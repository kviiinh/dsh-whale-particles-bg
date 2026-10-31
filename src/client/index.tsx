/**
 * Whale particle background, browser half: two canvases in the frame-wide
 * `shell.overlay` seat 鈥?the official dot-grid layer underneath (z-index 0) and
 * the WHALE-silhouette particle field above it (z-index 1). Both are fixed,
 * full-viewport and click-through; the theme is read from
 * `body[data-ds-dark-theme]` on every frame, so the field follows light/dark
 * without subscribing to anything.
 *
 * The silhouette is sampled from the WHALE path once per mount (offset-canvas
 * rasterization at 6x, sampled every 2px), and each sample becomes one particle
 * that assembles from a scattered shell, then breathes, and is pushed away from
 * the pointer inside a 4.9-world-unit radius. Animation runs on
 * `requestAnimationFrame` throttled to ~30fps, which also suspends the field
 * while the tab is hidden.
 */
import React from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: pulls the renderer-owned `slots` service (ctx.slots) and its SlotMap merges.
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
// Type-only: pulls the `shell.overlay` seat declared by the layout plugin.
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { WHALE } from './whale-path.ts'
import './global.css'

/** Frame budget: the field is authored for 30fps, not the display refresh rate. */
const FRAME_MS = 33
/** Device-pixel-ratio ceiling: a 3x surface quadruples fill cost for no visible gain. */
const DPR_CAP = 2
/** Grid pitch of the dot layer, in CSS pixels. */
const GRID_STEP = 90
/** Pointer influence radius of the dot layer, in CSS pixels. */
const GRID_RADIUS = 140

/** One dot of the sampled grid: its rest position plus its spring state. */
interface GridDot {
  readonly restX: number
  readonly restY: number
  x: number
  y: number
  vx: number
  vy: number
}

/** One particle anchored to a point sampled from the whale silhouette. */
interface Particle {
  /** Anchor in normalized silhouette space. */
  readonly ax: number
  readonly ay: number
  /** Current position in viewport space, normalized. */
  cx: number
  cy: number
  /** Pointer offset in CSS px, integrated from the velocity below. */
  ox: number
  oy: number
  /** Offset velocity in px/s: the force model gives particles inertia. */
  vx: number
  vy: number
  /** Per-particle render-size seed. */
  readonly s: number
}

/** Whether the pointer is coarse (touch), which suppresses pointer listeners. */
function pointerIsCoarse(): boolean {
  return window.matchMedia('(hover: none), (pointer: coarse)').matches
}

/** Whether the document is currently in the dark theme. */
function isDark(): boolean {
  return document.body.hasAttribute('data-ds-dark-theme')
}

/** Clamp a value into an inclusive range. */
function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value
}

/**
 * Live box of one fixed, full-viewport canvas plus its cached viewport origin.
 *
 * Nothing in the animation path may read layout: during token streaming the chat
 * DOM is dirty almost every frame, so a `getBoundingClientRect()` in a
 * `mousemove` handler (or a `clientWidth` read per frame) forces a synchronous
 * re-layout of the whole page and serializes the background with the renderer.
 * The box therefore arrives from a `ResizeObserver`, and the origin is cached
 * here 鈥?refreshed only when the box or the viewport actually changes.
 */
interface CanvasBox {
  /** Canvas box in CSS pixels; zero until the first observation. */
  width: number
  height: number
  /** Cached canvas origin in viewport coordinates, for pointer conversion. */
  originX: number
  originY: number
}

/**
 * Keep one canvas' backing store and cached geometry in sync with its box.
 * @param canvas - the canvas element.
 * @param context - its 2D context (the transform is reset with the surface).
 * @param box - the mutable geometry record the layer reads every frame.
 * @param onBoxChange - invoked after the box changed, for layer-owned rebuilds.
 * @returns a disposer that disconnects the observer and the viewport listener.
 */
function trackCanvasBox(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  box: CanvasBox,
  onBoxChange: () => void,
): () => void {
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
  const refreshOrigin = (): void => {
    const rect = canvas.getBoundingClientRect()
    box.originX = rect.left
    box.originY = rect.top
  }
  const apply = (width: number, height: number): void => {
    if (width === box.width && height === box.height) return
    box.width = width
    box.height = height
    canvas.width = Math.max(1, Math.round(width * dpr))
    canvas.height = Math.max(1, Math.round(height * dpr))
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    refreshOrigin()
    onBoxChange()
  }
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (entry !== undefined) apply(entry.contentRect.width, entry.contentRect.height)
  })
  observer.observe(canvas)
  // Exactly one synchronous read, at mount: the first frame must not draw into a
  // zero-sized surface, and the origin is needed before the first pointer event.
  apply(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight)
  // The canvases are fixed to the viewport, so the cached origin only ever
  // changes when the viewport does 鈥?never during animation.
  window.addEventListener('resize', refreshOrigin, { passive: true })
  return () => {
    observer.disconnect()
    window.removeEventListener('resize', refreshOrigin)
  }
}

/**
 * The official dot-grid layer: a square lattice that stretches lines between
 * neighbours and swells under the pointer.
 */
function DotGridCanvas(): React.ReactElement {
  const ref = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    const canvas = ref.current
    if (canvas === null) return
    const g = canvas.getContext('2d')
    if (g === null) return

    const coarse = pointerIsCoarse()
    const pts: GridDot[] = []
    let cols = 0
    let rows = 0
    const box: CanvasBox = { width: 0, height: 0, originX: 0, originY: 0 }
    const mouse = { x: NaN, y: NaN }

    const build = (): void => {
      cols = Math.ceil(box.width / GRID_STEP) + 1
      rows = Math.ceil(box.height / GRID_STEP) + 1
      const ox = (box.width - (cols - 1) * GRID_STEP) / 2
      const oy = (box.height - (rows - 1) * GRID_STEP) / 2
      pts.length = 0
      for (let n = 0; n < rows; n += 1) {
        for (let r = 0; r < cols; r += 1) {
          const x = ox + GRID_STEP * r
          const y = oy + GRID_STEP * n
          pts.push({ restX: x, restY: y, x, y, vx: 0, vy: 0 })
        }
      }
    }

    const disposeBox = trackCanvasBox(canvas, g, box, build)

    const onMove = (e: MouseEvent): void => {
      mouse.x = e.clientX - box.originX
      mouse.y = e.clientY - box.originY
    }
    if (!coarse) window.addEventListener('mousemove', onMove)

    const draw = (): void => {
      const w = box.width
      const h = box.height
      if (w === 0 || h === 0) return
      g.clearRect(0, 0, w, h)
      const mx = mouse.x
      const my = mouse.y
      const dark = isDark()
      const lineColor = dark ? 'rgba(255, 255, 255,' : 'rgba(60, 100, 160,'
      const dotColor = dark ? 'rgba(255, 255, 255,' : 'rgba(60, 100, 160,'
      const lineAlpha = dark ? 0.08 : 0.1
      const dotAlpha = dark ? 0.16 : 0.2

      for (const p of pts) {
        const dx = p.x - mx
        const dy = p.y - my
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < GRID_RADIUS && d > 0.1) {
          const push = (1 - d / GRID_RADIUS) * 30
          p.vx += (dx / d) * push * 0.1
          p.vy += (dy / d) * push * 0.1
        }
        const sx = p.restX - p.x
        const sy = p.restY - p.y
        p.vx += 0.05 * sx
        p.vy += 0.05 * sy
        p.vx *= 0.85
        p.vy *= 0.85
        p.x += p.vx
        p.y += p.vy
      }

      g.strokeStyle = lineColor + ' ' + lineAlpha + ')'
      g.lineWidth = 0.5
      for (let n = 0; n < rows; n += 1) {
        for (let r = 0; r < cols - 1; r += 1) {
          const a = pts[n * cols + r]
          const b = pts[n * cols + r + 1]
          if (a === undefined || b === undefined) continue
          const ox = b.x - a.x
          const oy = b.y - a.y
          const len = Math.sqrt(ox * ox + oy * oy)
          if (len < 20) continue
          const ux = ox / len
          const uy = oy / len
          g.beginPath()
          g.moveTo(a.x + 10 * ux, a.y + 10 * uy)
          g.lineTo(b.x - 10 * ux, b.y - 10 * uy)
          g.stroke()
        }
      }
      for (let r = 0; r < cols; r += 1) {
        for (let n = 0; n < rows - 1; n += 1) {
          const a = pts[n * cols + r]
          const b = pts[(n + 1) * cols + r]
          if (a === undefined || b === undefined) continue
          const ox = b.x - a.x
          const oy = b.y - a.y
          const len = Math.sqrt(ox * ox + oy * oy)
          if (len < 20) continue
          const ux = ox / len
          const uy = oy / len
          g.beginPath()
          g.moveTo(a.x + 10 * ux, a.y + 10 * uy)
          g.lineTo(b.x - 10 * ux, b.y - 10 * uy)
          g.stroke()
        }
      }

      g.fillStyle = dotColor + ' ' + dotAlpha + ')'
      for (const p of pts) {
        let size = 1.8
        let alpha = dotAlpha
        if (!isNaN(mx) && !isNaN(my)) {
          const dx = p.x - mx
          const dy = p.y - my
          const d = Math.sqrt(dx * dx + dy * dy)
          const boost = Math.max(0, 1 - d / GRID_RADIUS)
          size = 1.8 + 2 * boost
          alpha = dotAlpha + 0.4 * boost
        }
        g.globalAlpha = alpha
        g.fillRect(p.x - size, p.y - size, size * 2, size * 2)
      }
      g.globalAlpha = 1
    }

    draw()
    let raf = 0
    let last = 0
    const loop = (time: number): void => {
      raf = window.requestAnimationFrame(loop)
      if (time - last < FRAME_MS) return
      last = time
      draw()
    }
    raf = window.requestAnimationFrame(loop)

    return () => {
      window.cancelAnimationFrame(raf)
      if (!coarse) window.removeEventListener('mousemove', onMove)
      disposeBox()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0,
      }}
    />
  )
}

/**
 * The whale particle field: one particle per sampled silhouette point, pushed
 * away from the pointer along a rotating per-particle angle.
 */
function WhaleCanvas(): React.ReactElement {
  const ref = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    const canvas = ref.current
    if (canvas === null) return
    const g = canvas.getContext('2d')
    if (g === null) return

    const box: CanvasBox = { width: 0, height: 0, originX: 0, originY: 0 }

    /** Rasterize the silhouette once and return its sampled points. */
    const sample = (): { u: number, v: number }[] => {
      const s = document.createElement('canvas')
      const SG = 6
      s.width = 24 * SG
      s.height = 18 * SG
      const sg = s.getContext('2d')
      if (sg === null) return []
      sg.scale(SG, SG)
      const path = new Path2D(WHALE)
      sg.fillStyle = '#fff'
      sg.fill(path)
      const data = sg.getImageData(0, 0, s.width, s.height).data
      const out: { u: number, v: number }[] = []
      for (let y = 0; y < s.height; y += 2) {
        for (let x = 0; x < s.width; x += 2) {
          const a = data[(y * s.width + x) * 4 + 3] ?? 0
          if (a > 128) out.push({ u: x / s.width, v: y / s.height })
        }
      }
      return out
    }

    let anchors: { u: number, v: number }[] = []
    try {
      anchors = sample()
    } catch {
      anchors = []
    }
    const N = anchors.length
    const parts: Particle[] = []
    for (let i = 0; i < N; i += 1) {
      const a = anchors[i]
      if (a === undefined) continue
      parts.push({
        ax: a.u, ay: a.v,
        cx: Math.random(), cy: Math.random(),
        ox: 0, oy: 0, vx: 0, vy: 0,
        s: 0.5 + Math.random() * 1,
      })
    }

    const disposeBox = trackCanvasBox(canvas, g, box, () => { /* geometry only */ })

    const mouse = { x: NaN, y: NaN }
    const onMove = (e: MouseEvent): void => {
      mouse.x = e.clientX - box.originX
      mouse.y = e.clientY - box.originY
    }
    // Dropping the sample is what stops the influence. Three signals drop it, because a bare
    // mouseleave is not enough: an always-on-top window belonging to another application can
    // sit over this page, and then the page sees neither mousemove nor a reliable mouseleave —
    // the last sample would keep stamping the same spot and freeze a dent in the whale.
    // Any of these clears the sample; the next mousemove restores it. There is deliberately no
    // idle timer: a pointer resting on the whale must keep holding the particles away.
    const onLeave = (): void => {
      mouse.x = NaN
      mouse.y = NaN
    }
    /** Crossing the page border: relatedTarget is null only when the pointer really left. */
    const onOut = (e: MouseEvent): void => {
      if (e.relatedTarget === null) onLeave()
    }
    /** Another window took the activation (a drag on it), so the pointer is no longer ours. */
    const onBlur = (): void => {
      onLeave()
    }
    const onVisibility = (): void => {
      if (document.visibilityState === 'hidden') onLeave()
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('blur', onBlur)
    document.addEventListener('mouseout', onOut, true)
    document.addEventListener('visibilitychange', onVisibility)

    const t0 = Date.now()
    let curAlpha = 0.10
    const TOUCH_R = 12 * 2.88
    const MOUSE = { radius: 4.9, strength: 0.8, decay: 0.2, distort: 5, spinFalloff: 6 }
    const mst = { smX: 0, smY: 0, hasMoved: false, active: false, strength: 0 }
    /** Smoothed pointer of the previous frame, in CSS px; NaN until the first sample. */
    let prevX = NaN
    let prevY = NaN
    /** Low-passed pointer speed in world units per frame, for the scatter angle. */
    let spinSpeed = 0
    /** Low-passed pointer speed in CSS px per frame, for the deposit gain. */
    let stampSpeed = 0
    // The influence centre is a scalar field stamped at the pointer every frame and decayed
    // in place: a "pheromone" map of the pointer's recent path. The push is the negative
    // gradient of that field, so the centre follows the trail and the force is smooth
    // everywhere — there is no polyline whose nearest point can jump from frame to frame
    // (that discontinuity was what made slow movement jitter).
    const FIELD_CELL = 12
    const FIELD_DECAY = 0.94
    const FIELD_REACH = 300
    const FIELD_MIN = 0.01
    // A fast sweep has only a few frames to deposit, so scale the dose with (low-passed)
    // pointer speed and lay the stamps along the frame's movement instead of at one point.
    const STAMP_GAIN = 4
    const STAMP_GAIN_MAX = 10
    const STAMP_GAIN_FLOOR = 0.35
    const STAMP_SPEED_LP = 0.15
    const STAMP_STEP_PX = 40
    const STAMP_MAX = 8
    const STAMP_JUMP_PX = 800
    let fieldCols = 0
    let fieldRows = 0
    let field = new Float32Array(0)
    let fieldKernel = new Float32Array(0)
    let fieldKernelSize = 0

    const draw = (): void => {
      const w = box.width
      const h = box.height
      if (w === 0 || h === 0) return
      g.clearRect(0, 0, w, h)
      if (N === 0) return

      const size = Math.min(w * 0.8, h * 0.7) * 1.5
      const ww = size * 1.2
      const ox = (w - ww) / 2
      const oy = h * 0.26 - 80
      const elapsed = (Date.now() - t0) / 1000
      const t = Math.max(0, Math.min(1, elapsed / 1.6))
      const ease = 1 - Math.pow(1 - t, 3)
      const assembled = t >= 1
      const dark = isDark()
      const rgb = dark ? '215, 232, 255' : '50, 82, 135'
      const now = Date.now() / 1000

      const msx = mouse.x
      const msy = mouse.y
      const hasMouse = !isNaN(msx)
      if (hasMouse) {
        mst.hasMoved = true
        mst.active = true
      } else {
        mst.active = false
      }
      const targetStrength = mst.active ? MOUSE.strength : 0
      const dt = 1 / 30
      mst.strength += (targetStrength - mst.strength) * (1 - Math.pow(0.05, dt))
      if (!hasMouse) {
        // Blank the smoothed centre while the pointer is away: the stamp guard then stops, and
        // the next sample snaps instead of smoothing from a stale position.
        mst.smX = NaN
        mst.smY = NaN
      } else if (isNaN(mst.smX) || mst.strength < 0.01) {
        // First sample, or back after a release. Snapping is required here: smoothing from the
        // old position would either spread the NaN left by mouseleave through smX forever
        // (silently killing the effect until a reload) or drag a false channel across the
        // whole canvas, amplified by the speed gain.
        mst.smX = msx
        mst.smY = msy
      } else {
        mst.smX += (msx - mst.smX) * MOUSE.decay
        mst.smY += (msy - mst.smY) * MOUSE.decay
      }
      // Every direction below derives from this centre. One NaN here would stick to a particle
      // offset forever (it is drawn at NaN, i.e. invisible, and never springs back).
      const centreOk = !isNaN(mst.smX)

      const D = 1 - Math.pow(1 - clamp((now - 0.3) / 2.5, 0, 1), 3)
      const unit = 0.0574 * Math.min(w, h)
      const whaleCx = ox + ww / 2
      const whaleCy = oy + size * 0.375
      // Decay the whole field, then stamp the kernel at the pointer. A still pointer
      // reaches a steady blob (so hovering keeps the original radial push), while moving
      // pointers leave a ridge along their path that fades in about a second.
      const cols = Math.ceil(w / FIELD_CELL) + 3
      const rows = Math.ceil(h / FIELD_CELL) + 3
      if (cols !== fieldCols || rows !== fieldRows) {
        fieldCols = cols
        fieldRows = rows
        field = new Float32Array(cols * rows)
        const kr = Math.ceil(FIELD_REACH / FIELD_CELL)
        fieldKernelSize = kr * 2 + 1
        fieldKernel = new Float32Array(fieldKernelSize * fieldKernelSize)
        for (let ky = -kr; ky <= kr; ky += 1) {
          for (let kx = -kr; kx <= kr; kx += 1) {
            const rr = Math.sqrt(kx * kx + ky * ky) * FIELD_CELL
            const kk = rr >= FIELD_REACH ? 0 : 1 - rr / FIELD_REACH
            fieldKernel[(ky + kr) * fieldKernelSize + (kx + kr)] = kk * kk * kk
          }
        }
      }
      for (let k = 0; k < field.length; k += 1) field[k] *= FIELD_DECAY
      if (hasMouse && !isNaN(mst.smX)) {
        // Deposit along the frame's movement so a fast sweep leaves a continuous ridge,
        // and scale the dose with the low-passed speed: a faster cut should cut deeper.
        let dxp = isNaN(prevX) ? 0 : mst.smX - prevX
        let dyp = isNaN(prevY) ? 0 : mst.smY - prevY
        let stepPx = Math.sqrt(dxp * dxp + dyp * dyp)
        if (stepPx > STAMP_JUMP_PX) {
          // A teleport (the pointer came back somewhere else): stamp once instead of drawing
          // a ridge along a jump that never happened.
          dxp = 0
          dyp = 0
          stepPx = 0
        }
        stampSpeed += (stepPx - stampSpeed) * STAMP_SPEED_LP
        const rel = stampSpeed / 33 - STAMP_GAIN_FLOOR
        const gain = rel <= 0 ? 1 : Math.min(STAMP_GAIN_MAX, 1 + STAMP_GAIN * Math.pow(rel, 1.1))
        const nStamp = Math.min(STAMP_MAX, Math.max(1, Math.ceil(stepPx / STAMP_STEP_PX)))
        const wStamp = gain / nStamp
        const kr = (fieldKernelSize - 1) / 2
        for (let s = 1; s <= nStamp; s += 1) {
          const frac = s / nStamp
          const sx = isNaN(prevX) ? mst.smX : prevX + dxp * frac
          const sy = isNaN(prevY) ? mst.smY : prevY + dyp * frac
          const cim = Math.round(sx / FIELD_CELL) + 1
          const cjm = Math.round(sy / FIELD_CELL) + 1
          for (let ky = -kr; ky <= kr; ky += 1) {
            const row = cjm + ky
            if (row < 0 || row >= fieldRows) continue
            const krow = (ky + kr) * fieldKernelSize + kr
            for (let kx = -kr; kx <= kr; kx += 1) {
              const col = cim + kx
              if (col < 0 || col >= fieldCols) continue
              field[row * fieldCols + col] += fieldKernel[krow + kx] * wStamp
            }
          }
        }
      }

      // Per-particle scatter fades with speed: at rest it is the old ±5 rad, at speed it
      // has to shrink or it would blur the channel into noise. The speed itself is
      // low-passed, so a tiny back-and-forth wiggle does not keep switching the angle and
      // making the whole neighbourhood shiver.
      const stepLen = !centreOk || isNaN(prevX) ? 0 : Math.hypot(mst.smX - prevX, mst.smY - prevY) / unit
      // NaN would survive every later low-pass step and turn the scatter angle into NaN for
      // the rest of the session. Reset instead.
      spinSpeed = centreOk ? spinSpeed + (stepLen - spinSpeed) * 0.10 : 0
      const spin = MOUSE.distort / (1 + MOUSE.spinFalloff * spinSpeed)

      let touched = false
      if (hasMouse) {
        const tr2 = TOUCH_R * TOUCH_R
        for (const p of parts) {
          const ddx = p.cx * w - msx
          const ddy = p.cy * h - msy
          if (ddx * ddx + ddy * ddy < tr2) {
            touched = true
            break
          }
        }
      }
      const targetAlpha = touched ? 0.25 : 0.10
      curAlpha += (targetAlpha - curAlpha) * 0.08

      // Force model (steering): the field is an acceleration, not a target position, so a
      // particle carries velocity and inertia. Stiff while pressed, soft on release, with
      // a speed clamp so a very deep field cannot fling it away.
      const K_PUSH = 120
      const C_PUSH = 14
      const K_HOME = 2.5
      const C_HOME = 2.2
      const MAX_SPEED = 2000
      // Safety net: the push is bounded to ~99 px, but the integrator can overshoot. Keep the
      // offset inside a sane radius so a released particle cannot coast off the whale.
      const MAX_OFFSET = 150

      for (let i = 0; i < N; i += 1) {
        const p = parts[i]
        if (p === undefined) continue
        let ax = ox + p.ax * ww
        let ay = oy + p.ay * (size * 0.75)
        if (assembled) {
          const br = 1 + Math.sin(now * 0.8) * 0.010
          ax = whaleCx + (ax - whaleCx) * br
          ay = whaleCy + (ay - whaleCy) * br
          ay += Math.sin(now * 0.9 + p.ax * 14) * size * 0.004
        }
        if (!assembled) {
          const k = 0.14 * (ease + 0.08)
          p.cx += (ax / w - p.cx) * k
          p.cy += (ay / h - p.cy) * k
        } else {
          p.cx = ax / w
          p.cy = ay / h
        }

        const px = p.cx * w
        const py = p.cy * h
        let tx = 0
        let ty = 0
        if (D > 0.8) {
          const mEff = (D - 0.8) * 5
          // Bilinear sample of the field and of its analytic gradient, so the push direction
          // is continuous instead of stepping at cell borders (that stepping is what was
          // left of the slow-motion jitter).
          const cxf = px / FIELD_CELL + 1
          const cyf = py / FIELD_CELL + 1
          const i0 = clamp(Math.floor(cxf), 1, fieldCols - 3)
          const j0 = clamp(Math.floor(cyf), 1, fieldRows - 3)
          const fx = cxf - i0
          const fy = cyf - j0
          const row0 = j0 * fieldCols
          const row1 = row0 + fieldCols
          const f00 = field[row0 + i0]
          const f10 = field[row0 + i0 + 1]
          const f01 = field[row1 + i0]
          const f11 = field[row1 + i0 + 1]
          const fA = f00 + (f10 - f00) * fx
          const fB = f01 + (f11 - f01) * fx
          const f0 = fA + (fB - fA) * fy
          const power = Math.min(1, f0 * (1 - FIELD_DECAY))
          if (power > FIELD_MIN) {
            // Push away from the stamped trail: the negative gradient of the field.
            const gx = (f10 - f00) + ((f11 - f01) - (f10 - f00)) * fy
            const gy = (f01 - f00) + ((f11 - f10) - (f01 - f00)) * fx
            const g2 = gx * gx + gy * gy
            let ux: number
            let uy: number
            if (g2 > 1e-12) {
              const inv = 1 / Math.sqrt(g2)
              ux = -gx * inv
              uy = -gy * inv
            } else if (centreOk) {
              // Dead centre of a still pointer: fall back to the radial direction.
              const rx = px - mst.smX
              const ry = py - mst.smY
              const rl = Math.sqrt(rx * rx + ry * ry)
              if (rl > 0.001) {
                ux = rx / rl
                uy = ry / rl
              } else {
                ux = 1
                uy = 0
              }
            } else {
              // No centre to be radial about (the sample was dropped mid-fade).
              ux = 1
              uy = 0
            }
            const ang = Math.sin(i * 0.37 + now * 0.5) * spin
            const ca = Math.cos(ang)
            const sa = Math.sin(ang)
            const amp = power * mEff * mst.strength * 2 * unit
            tx = (ux * ca - uy * sa) * amp
            ty = (ux * sa + uy * ca) * amp
          }
        }
        const pushed = tx !== 0 || ty !== 0
        const k = pushed ? K_PUSH : K_HOME
        const c = pushed ? C_PUSH : C_HOME
        p.vx += ((tx - p.ox) * k - p.vx * c) * dt
        p.vy += ((ty - p.oy) * k - p.vy * c) * dt
        const sp2 = p.vx * p.vx + p.vy * p.vy
        if (sp2 > MAX_SPEED * MAX_SPEED) {
          const cl = MAX_SPEED / Math.sqrt(sp2)
          p.vx *= cl
          p.vy *= cl
        }
        p.ox += p.vx * dt
        p.oy += p.vy * dt
        // Every clamp below is false for NaN, so a NaN offset would draw the particle at NaN
        // (invisible) with no way back. Restart it from its rest position instead.
        if (p.ox !== p.ox || p.oy !== p.oy) {
          p.ox = 0
          p.oy = 0
          p.vx = 0
          p.vy = 0
        }
        const off2 = p.ox * p.ox + p.oy * p.oy
        if (off2 > MAX_OFFSET * MAX_OFFSET) {
          const cl = MAX_OFFSET / Math.sqrt(off2)
          p.ox *= cl
          p.oy *= cl
          p.vx *= cl
          p.vy *= cl
        }
        // Below a pixel the motion is invisible anyway; finish the return here instead of
        // crawling for seconds on sub-pixel steps.
        if (p.ox * p.ox + p.oy * p.oy < 1) {
          p.ox = 0
          p.oy = 0
          p.vx = 0
          p.vy = 0
        }
        const fx = px + p.ox
        const fy = py + p.oy

        const half = (0.8 + p.s * 0.7) * 0.7 * 1.5
        g.globalAlpha = curAlpha
        g.fillStyle = 'rgb(' + rgb + ')'
        g.fillRect(fx - half, fy - half, half * 2, half * 2)
      }
      prevX = mst.smX
      prevY = mst.smY
      g.globalAlpha = 1
    }

    draw()
    let raf = 0
    let last = 0
    const loop = (time: number): void => {
      raf = window.requestAnimationFrame(loop)
      if (time - last < FRAME_MS) return
      last = time
      draw()
    }
    raf = window.requestAnimationFrame(loop)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('mouseout', onOut, true)
      document.removeEventListener('visibilitychange', onVisibility)
      disposeBox()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1,
      }}
    />
  )
}

/** Services this browser half waits for before it registers its canvases. */
export const inject = ['slots']

/**
 * Register the two background layers into the frame-wide overlay seat.
 * @param ctx - the client context, with `slots` resolved through {@link inject}.
 */
export function apply(ctx: ClientContext): void {
  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    { name: 'shell.overlay', id: 'dsh-whale-particles-bg-dotgrid', order: 0 },
    DotGridCanvas,
  ))
  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    { name: 'shell.overlay', id: 'dsh-whale-particles-bg-whale', order: 1 },
    WhaleCanvas,
  ))
}
