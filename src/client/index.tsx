/**
 * Whale particle background, browser half: two canvases in the frame-wide
 * `shell.overlay` seat — the official dot-grid layer underneath (z-index 0) and
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
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
    const pts: GridDot[] = []
    let cols = 0
    let rows = 0
    let cw = 0
    let ch = 0
    const mouse = { x: NaN, y: NaN }

    const build = (): void => {
      cols = Math.ceil(cw / GRID_STEP) + 1
      rows = Math.ceil(ch / GRID_STEP) + 1
      const ox = (cw - (cols - 1) * GRID_STEP) / 2
      const oy = (ch - (rows - 1) * GRID_STEP) / 2
      pts.length = 0
      for (let n = 0; n < rows; n += 1) {
        for (let r = 0; r < cols; r += 1) {
          const x = ox + GRID_STEP * r
          const y = oy + GRID_STEP * n
          pts.push({ restX: x, restY: y, x, y, vx: 0, vy: 0 })
        }
      }
    }

    const onMove = (e: MouseEvent): void => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    if (!coarse) window.addEventListener('mousemove', onMove)

    const draw = (): void => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w !== cw || h !== ch) {
        cw = w
        ch = h
        canvas.width = w * dpr
        canvas.height = h * dpr
        g.setTransform(dpr, 0, 0, dpr, 0, 0)
        build()
      }
      g.clearRect(0, 0, cw, ch)
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

    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
    let cw = 0
    let ch = 0

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
        s: 0.5 + Math.random() * 1,
      })
    }

    const mouse = { x: NaN, y: NaN }
    const onMove = (e: MouseEvent): void => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onLeave = (): void => {
      mouse.x = NaN
      mouse.y = NaN
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    const t0 = Date.now()
    let curAlpha = 0.10
    const TOUCH_R = 12 * 2.88
    const MOUSE = { radius: 4.9, strength: 0.8, decay: 0.2, distort: 5 }
    const mst = { smX: 0, smY: 0, hasMoved: false, active: false, strength: 0 }

    const draw = (): void => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w !== cw || h !== ch) {
        cw = w
        ch = h
        canvas.width = w * dpr
        canvas.height = h * dpr
        g.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      g.clearRect(0, 0, cw, ch)
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
      if (mst.hasMoved) {
        if (mst.strength < 0.01) {
          mst.smX = msx
          mst.smY = msy
        } else {
          mst.smX += (msx - mst.smX) * MOUSE.decay
          mst.smY += (msy - mst.smY) * MOUSE.decay
        }
      }

      const D = 1 - Math.pow(1 - clamp((now - 0.3) / 2.5, 0, 1), 3)
      const unit = 0.0574 * Math.min(w, h)
      const whaleCx = ox + ww / 2
      const whaleCy = oy + size * 0.375
      const mwx = (mst.smX - whaleCx) / unit
      const mwy = (mst.smY - whaleCy) / unit

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
        let fx = px
        let fy = py
        if (D > 0.8) {
          const mEff = (D - 0.8) * 5
          const pwx = (px - whaleCx) / unit
          const pwy = (py - whaleCy) / unit
          const dx = pwx - mwx
          const dy = pwy - mwy
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MOUSE.radius && dist > 0.001) {
            const tt = 1 - dist / MOUSE.radius
            const force = tt * tt * tt * mEff * mst.strength
            const ang = Math.sin(i * 0.37 + now * 0.5) * MOUSE.distort
            const ca = Math.cos(ang)
            const sa = Math.sin(ang)
            const ux = dx / dist
            const uy = dy / dist
            fx = px + (ux * ca - uy * sa) * force * 2 * unit
            fy = py + (ux * sa + uy * ca) * force * 2 * unit
          }
        }

        const half = (0.8 + p.s * 0.7) * 0.7 * 1.5
        g.globalAlpha = curAlpha
        g.fillStyle = 'rgb(' + rgb + ')'
        g.fillRect(fx - half, fy - half, half * 2, half * 2)
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
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
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
