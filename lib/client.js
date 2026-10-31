window.__ModuleLoader__.load({
	id: "dsh-whale-particles-bg",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		react = __toESM(react, 1);
		//#region lib/types/client/whale-path.js
		const WHALE = "M22.9168 1.43018C22.6713 1.31018 22.5658 1.53918 22.4223 1.65519C22.3733 1.69269 22.3318 1.74169 22.2903 1.78669C21.9317 2.1697 21.5127 2.42121 20.9657 2.39121C20.1657 2.34621 19.4827 2.59771 18.8787 3.20973C18.7502 2.45521 18.3236 2.0047 17.6746 1.71569C17.3351 1.56568 16.9916 1.41518 16.7536 1.08867C16.5876 0.856163 16.5421 0.597155 16.4591 0.341647C16.4061 0.187643 16.3536 0.0301382 16.1761 0.00363739C15.9836 -0.0263635 15.9081 0.135141 15.8326 0.270145C15.5306 0.822162 15.4136 1.43018 15.4251 2.0462C15.4516 3.43174 16.0366 4.53527 17.1991 5.3203C17.3311 5.4103 17.3651 5.5003 17.3236 5.63181C17.2441 5.90231 17.1501 6.16482 17.0671 6.43533C17.0141 6.60784 16.9351 6.64584 16.7501 6.57033C16.1121 6.30383 15.5611 5.90931 15.074 5.4328C14.2475 4.63328 13.5 3.75075 12.568 3.05973C12.349 2.89822 12.13 2.74822 11.9034 2.60522C10.9524 1.68169 12.028 0.923165 12.277 0.833162C12.5375 0.739159 12.3675 0.41615 11.5259 0.42015C10.6844 0.42365 9.91439 0.705658 8.93286 1.08117C8.78935 1.13767 8.63835 1.17867 8.48384 1.21267C7.59332 1.04367 6.66829 1.00617 5.70226 1.11517C3.88321 1.31768 2.43016 2.1777 1.36213 3.64575C0.0790928 5.4103 -0.222916 7.41536 0.146595 9.50642C0.535106 11.7105 1.66014 13.535 3.38869 14.9616C5.18125 16.4406 7.24581 17.1657 9.60138 17.0266C11.0319 16.9441 12.6245 16.7526 14.421 15.2321C14.874 15.4576 15.3496 15.5476 16.1381 15.6151C16.7456 15.6716 17.3306 15.5851 17.7836 15.4911C18.4931 15.3411 18.4441 14.6841 18.1876 14.5636C16.1081 13.595 16.5646 13.9891 16.1496 13.67C17.2061 12.42 18.8202 10.1979 19.3182 7.17235C19.3672 6.83834 19.4297 6.36783 19.4222 6.09732C19.4182 5.93231 19.4562 5.86831 19.6447 5.84931C20.1657 5.78931 20.6712 5.64681 21.1357 5.3913C22.4833 4.65528 23.0268 3.44624 23.1548 1.9972C23.1738 1.77569 23.1508 1.54668 22.9168 1.43018ZM11.1749 14.4736C9.15936 12.889 8.18184 12.3675 7.77832 12.39C7.40081 12.4125 7.46881 12.8445 7.55182 13.126C7.63882 13.404 7.75182 13.5955 7.91033 13.8396C8.01983 14.0011 8.09533 14.2411 7.80083 14.4216C7.15181 14.8231 6.02327 14.2866 5.97027 14.2601C4.65673 13.4865 3.5587 12.4655 2.78467 11.069C2.03715 9.72493 1.60314 8.28289 1.53164 6.74384C1.51264 6.37233 1.62214 6.24082 1.99215 6.17332C2.47916 6.08332 2.98118 6.06432 3.46769 6.13582C5.52476 6.43633 7.27581 7.35586 8.74385 8.8129C9.58188 9.64243 10.2159 10.634 10.8689 11.6025C11.5634 12.631 12.3105 13.611 13.262 14.4146C13.598 14.6961 13.866 14.9101 14.1225 15.0681C13.349 15.1546 12.058 15.1731 11.1749 14.4746L11.1749 14.4736ZM12.141 8.25988C12.141 8.09488 12.273 7.96338 12.439 7.96338C12.4765 7.96338 12.5105 7.97088 12.541 7.98188C12.5825 7.99688 12.6205 8.01938 12.6505 8.05338C12.7035 8.10588 12.7335 8.18088 12.7335 8.25988C12.7335 8.42489 12.6015 8.55639 12.4355 8.55639C12.2695 8.55639 12.141 8.42489 12.141 8.25988ZM15.1415 9.79893C14.949 9.87793 14.7565 9.94544 14.5715 9.95294C14.2845 9.96794 13.9715 9.85143 13.8015 9.70893C13.5375 9.48742 13.3485 9.36342 13.2695 8.97691C13.2355 8.8119 13.2545 8.55639 13.2845 8.40989C13.3525 8.09438 13.277 7.89187 13.0545 7.70787C12.8735 7.55786 12.643 7.51636 12.39 7.51636C12.2955 7.51636 12.209 7.47486 12.1445 7.44136C12.039 7.38886 11.9519 7.25735 12.035 7.09585C12.0615 7.04335 12.19 6.91584 12.22 6.89334C12.5635 6.69784 12.9595 6.76184 13.326 6.90834C13.6655 7.04735 13.9225 7.30236 14.292 7.66287C14.6695 8.09838 14.7375 8.21838 14.9525 8.54539C15.1225 8.8009 15.277 9.06341 15.3831 9.36392C15.4471 9.55142 15.3641 9.70493 15.1415 9.79893Z";
		//#endregion
		//#region \0dsh-global-css:<virtual>/global.css.mjs
		const css = "body{background-color:#e9eef5!important;background-image:linear-gradient(135deg,#ffffff80 0%,#ffffff0a 38%,#ffffff05 62%,#ffffff4d 100%)!important}body[data-ds-dark-theme]{background-color:#101113!important;background-image:linear-gradient(135deg,#ffffff0f 0%,#ffffff04 38%,#ffffff03 62%,#ffffff08 100%)!important}";
		const tagId = "dsh-whale-particles-bg/global.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-whale-particles-bg";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region lib/types/client/index.js
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
		/** Frame budget: the field is authored for 30fps, not the display refresh rate. */
		const FRAME_MS = 33;
		/** Device-pixel-ratio ceiling: a 3x surface quadruples fill cost for no visible gain. */
		const DPR_CAP = 2;
		/** Grid pitch of the dot layer, in CSS pixels. */
		const GRID_STEP = 90;
		/** Pointer influence radius of the dot layer, in CSS pixels. */
		const GRID_RADIUS = 140;
		/** Whether the pointer is coarse (touch), which suppresses pointer listeners. */
		function pointerIsCoarse() {
			return window.matchMedia("(hover: none), (pointer: coarse)").matches;
		}
		/** Whether the document is currently in the dark theme. */
		function isDark() {
			return document.body.hasAttribute("data-ds-dark-theme");
		}
		/** Clamp a value into an inclusive range. */
		function clamp(value, min, max) {
			return value < min ? min : value > max ? max : value;
		}
		/**
		* Keep one canvas' backing store and cached geometry in sync with its box.
		* @param canvas - the canvas element.
		* @param context - its 2D context (the transform is reset with the surface).
		* @param box - the mutable geometry record the layer reads every frame.
		* @param onBoxChange - invoked after the box changed, for layer-owned rebuilds.
		* @returns a disposer that disconnects the observer and the viewport listener.
		*/
		function trackCanvasBox(canvas, context, box, onBoxChange) {
			const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
			const refreshOrigin = () => {
				const rect = canvas.getBoundingClientRect();
				box.originX = rect.left;
				box.originY = rect.top;
			};
			const apply = (width, height) => {
				if (width === box.width && height === box.height) return;
				box.width = width;
				box.height = height;
				canvas.width = Math.max(1, Math.round(width * dpr));
				canvas.height = Math.max(1, Math.round(height * dpr));
				context.setTransform(dpr, 0, 0, dpr, 0, 0);
				refreshOrigin();
				onBoxChange();
			};
			const observer = new ResizeObserver((entries) => {
				const entry = entries[0];
				if (entry !== void 0) apply(entry.contentRect.width, entry.contentRect.height);
			});
			observer.observe(canvas);
			apply(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
			window.addEventListener("resize", refreshOrigin, { passive: true });
			return () => {
				observer.disconnect();
				window.removeEventListener("resize", refreshOrigin);
			};
		}
		/**
		* The official dot-grid layer: a square lattice that stretches lines between
		* neighbours and swells under the pointer.
		*/
		function DotGridCanvas() {
			const ref = react.default.useRef(null);
			react.default.useEffect(() => {
				const canvas = ref.current;
				if (canvas === null) return;
				const g = canvas.getContext("2d");
				if (g === null) return;
				const coarse = pointerIsCoarse();
				const pts = [];
				let cols = 0;
				let rows = 0;
				const box = {
					width: 0,
					height: 0,
					originX: 0,
					originY: 0
				};
				const mouse = {
					x: NaN,
					y: NaN
				};
				const build = () => {
					cols = Math.ceil(box.width / GRID_STEP) + 1;
					rows = Math.ceil(box.height / GRID_STEP) + 1;
					const ox = (box.width - (cols - 1) * GRID_STEP) / 2;
					const oy = (box.height - (rows - 1) * GRID_STEP) / 2;
					pts.length = 0;
					for (let n = 0; n < rows; n += 1) for (let r = 0; r < cols; r += 1) {
						const x = ox + GRID_STEP * r;
						const y = oy + GRID_STEP * n;
						pts.push({
							restX: x,
							restY: y,
							x,
							y,
							vx: 0,
							vy: 0
						});
					}
				};
				const disposeBox = trackCanvasBox(canvas, g, box, build);
				const onMove = (e) => {
					mouse.x = e.clientX - box.originX;
					mouse.y = e.clientY - box.originY;
				};
				if (!coarse) window.addEventListener("mousemove", onMove);
				const draw = () => {
					const w = box.width;
					const h = box.height;
					if (w === 0 || h === 0) return;
					g.clearRect(0, 0, w, h);
					const mx = mouse.x;
					const my = mouse.y;
					const dark = isDark();
					const lineColor = dark ? "rgba(255, 255, 255," : "rgba(60, 100, 160,";
					const dotColor = dark ? "rgba(255, 255, 255," : "rgba(60, 100, 160,";
					const lineAlpha = dark ? .08 : .1;
					const dotAlpha = dark ? .16 : .2;
					for (const p of pts) {
						const dx = p.x - mx;
						const dy = p.y - my;
						const d = Math.sqrt(dx * dx + dy * dy);
						if (d < GRID_RADIUS && d > .1) {
							const push = (1 - d / GRID_RADIUS) * 30;
							p.vx += dx / d * push * .1;
							p.vy += dy / d * push * .1;
						}
						const sx = p.restX - p.x;
						const sy = p.restY - p.y;
						p.vx += .05 * sx;
						p.vy += .05 * sy;
						p.vx *= .85;
						p.vy *= .85;
						p.x += p.vx;
						p.y += p.vy;
					}
					g.strokeStyle = lineColor + " " + lineAlpha + ")";
					g.lineWidth = .5;
					for (let n = 0; n < rows; n += 1) for (let r = 0; r < cols - 1; r += 1) {
						const a = pts[n * cols + r];
						const b = pts[n * cols + r + 1];
						if (a === void 0 || b === void 0) continue;
						const ox = b.x - a.x;
						const oy = b.y - a.y;
						const len = Math.sqrt(ox * ox + oy * oy);
						if (len < 20) continue;
						const ux = ox / len;
						const uy = oy / len;
						g.beginPath();
						g.moveTo(a.x + 10 * ux, a.y + 10 * uy);
						g.lineTo(b.x - 10 * ux, b.y - 10 * uy);
						g.stroke();
					}
					for (let r = 0; r < cols; r += 1) for (let n = 0; n < rows - 1; n += 1) {
						const a = pts[n * cols + r];
						const b = pts[(n + 1) * cols + r];
						if (a === void 0 || b === void 0) continue;
						const ox = b.x - a.x;
						const oy = b.y - a.y;
						const len = Math.sqrt(ox * ox + oy * oy);
						if (len < 20) continue;
						const ux = ox / len;
						const uy = oy / len;
						g.beginPath();
						g.moveTo(a.x + 10 * ux, a.y + 10 * uy);
						g.lineTo(b.x - 10 * ux, b.y - 10 * uy);
						g.stroke();
					}
					g.fillStyle = dotColor + " " + dotAlpha + ")";
					for (const p of pts) {
						let size = 1.8;
						let alpha = dotAlpha;
						if (!isNaN(mx) && !isNaN(my)) {
							const dx = p.x - mx;
							const dy = p.y - my;
							const d = Math.sqrt(dx * dx + dy * dy);
							const boost = Math.max(0, 1 - d / GRID_RADIUS);
							size = 1.8 + 2 * boost;
							alpha = dotAlpha + .4 * boost;
						}
						g.globalAlpha = alpha;
						g.fillRect(p.x - size, p.y - size, size * 2, size * 2);
					}
					g.globalAlpha = 1;
				};
				draw();
				let raf = 0;
				let last = 0;
				const loop = (time) => {
					raf = window.requestAnimationFrame(loop);
					if (time - last < FRAME_MS) return;
					last = time;
					draw();
				};
				raf = window.requestAnimationFrame(loop);
				return () => {
					window.cancelAnimationFrame(raf);
					if (!coarse) window.removeEventListener("mousemove", onMove);
					disposeBox();
				};
			}, []);
			return (0, react_jsx_runtime.jsx)("canvas", {
				ref,
				style: {
					position: "fixed",
					left: 0,
					top: 0,
					width: "100%",
					height: "100%",
					pointerEvents: "none",
					zIndex: 0
				}
			});
		}
		/**
		* The whale particle field: one particle per sampled silhouette point, pushed
		* away from the pointer along a rotating per-particle angle.
		*/
		function WhaleCanvas() {
			const ref = react.default.useRef(null);
			react.default.useEffect(() => {
				const canvas = ref.current;
				if (canvas === null) return;
				const g = canvas.getContext("2d");
				if (g === null) return;
				const box = {
					width: 0,
					height: 0,
					originX: 0,
					originY: 0
				};
				/** Rasterize the silhouette once and return its sampled points. */
				const sample = () => {
					const s = document.createElement("canvas");
					const SG = 6;
					s.width = 24 * SG;
					s.height = 18 * SG;
					const sg = s.getContext("2d");
					if (sg === null) return [];
					sg.scale(SG, SG);
					const path = new Path2D(WHALE);
					sg.fillStyle = "#fff";
					sg.fill(path);
					const data = sg.getImageData(0, 0, s.width, s.height).data;
					const out = [];
					for (let y = 0; y < s.height; y += 2) for (let x = 0; x < s.width; x += 2) if ((data[(y * s.width + x) * 4 + 3] ?? 0) > 128) out.push({
						u: x / s.width,
						v: y / s.height
					});
					return out;
				};
				let anchors = [];
				try {
					anchors = sample();
				} catch {
					anchors = [];
				}
				const N = anchors.length;
				const parts = [];
				for (let i = 0; i < N; i += 1) {
					const a = anchors[i];
					if (a === void 0) continue;
					parts.push({
						ax: a.u,
						ay: a.v,
						cx: Math.random(),
						cy: Math.random(),
						ox: 0,
						oy: 0,
						s: .5 + Math.random() * 1
					});
				}
				const disposeBox = trackCanvasBox(canvas, g, box, () => {});
				const mouse = {
					x: NaN,
					y: NaN
				};
				const onMove = (e) => {
					mouse.x = e.clientX - box.originX;
					mouse.y = e.clientY - box.originY;
				};
				const onLeave = () => {
					mouse.x = NaN;
					mouse.y = NaN;
				};
				window.addEventListener("mousemove", onMove);
				window.addEventListener("mouseleave", onLeave);
				const t0 = Date.now();
				let curAlpha = .1;
				const TOUCH_R = 12 * 2.88;
				const MOUSE = {
					radius: 4.9,
					strength: .8,
					decay: .2,
					distort: 5,
					spinFalloff: 6
				};
				const mst = {
					smX: 0,
					smY: 0,
					hasMoved: false,
					active: false,
					strength: 0
				};
				/** Smoothed pointer of the previous frame, in CSS px; NaN until the first sample. */
				let prevX = NaN;
				let prevY = NaN;
				/** Low-passed pointer speed in world units per frame, for the scatter angle. */
				let spinSpeed = 0;
				// The influence centre is a scalar field stamped at the pointer every frame and
				// decayed in place: a "pheromone" map of the pointer's recent path. The push is the
				// negative gradient of that field, so the centre follows the trail and the force is
				// smooth everywhere (no polyline whose nearest point can jump frame to frame).
				const FIELD_CELL = 12;
				const FIELD_DECAY = .94;
				const FIELD_REACH = 300;
				const FIELD_MIN = .01;
				let fieldCols = 0;
				let fieldRows = 0;
				let field = new Float32Array(0);
				let fieldKernel = new Float32Array(0);
				let fieldKernelSize = 0;
				const draw = () => {
					const w = box.width;
					const h = box.height;
					if (w === 0 || h === 0) return;
					g.clearRect(0, 0, w, h);
					if (N === 0) return;
					const size = Math.min(w * .8, h * .7) * 1.5;
					const ww = size * 1.2;
					const ox = (w - ww) / 2;
					const oy = h * .26 - 80;
					const elapsed = (Date.now() - t0) / 1e3;
					const t = Math.max(0, Math.min(1, elapsed / 1.6));
					const ease = 1 - Math.pow(1 - t, 3);
					const assembled = t >= 1;
					const rgb = isDark() ? "215, 232, 255" : "50, 82, 135";
					const now = Date.now() / 1e3;
					const msx = mouse.x;
					const msy = mouse.y;
					const hasMouse = !isNaN(msx);
					if (hasMouse) {
						mst.hasMoved = true;
						mst.active = true;
					} else mst.active = false;
					const targetStrength = mst.active ? MOUSE.strength : 0;
					mst.strength += (targetStrength - mst.strength) * (1 - Math.pow(.05, 1 / 30));
					if (mst.hasMoved) if (mst.strength < .01) {
						mst.smX = msx;
						mst.smY = msy;
					} else {
						mst.smX += (msx - mst.smX) * MOUSE.decay;
						mst.smY += (msy - mst.smY) * MOUSE.decay;
					}
					const D = 1 - Math.pow(1 - clamp((now - .3) / 2.5, 0, 1), 3);
					const unit = .0574 * Math.min(w, h);
					const whaleCx = ox + ww / 2;
					const whaleCy = oy + size * .375;
					const mwx = (mst.smX - whaleCx) / unit;
					const mwy = (mst.smY - whaleCy) / unit;
					// Decay the whole field, then stamp the kernel at the pointer. A still pointer
					// reaches a steady blob (the original radial push), a moving one leaves a ridge
					// along its path that fades in about a second.
					const cols = Math.ceil(w / FIELD_CELL) + 3;
					const rows = Math.ceil(h / FIELD_CELL) + 3;
					if (cols !== fieldCols || rows !== fieldRows) {
						fieldCols = cols;
						fieldRows = rows;
						field = new Float32Array(cols * rows);
						const kr = Math.ceil(FIELD_REACH / FIELD_CELL);
						fieldKernelSize = kr * 2 + 1;
						fieldKernel = new Float32Array(fieldKernelSize * fieldKernelSize);
						for (let ky = -kr; ky <= kr; ky += 1) for (let kx = -kr; kx <= kr; kx += 1) {
							const rr = Math.sqrt(kx * kx + ky * ky) * FIELD_CELL;
							const kk = rr >= FIELD_REACH ? 0 : 1 - rr / FIELD_REACH;
							fieldKernel[(ky + kr) * fieldKernelSize + (kx + kr)] = kk * kk * kk;
						}
					}
					for (let k = 0; k < field.length; k += 1) field[k] *= FIELD_DECAY;
					if (hasMouse && !isNaN(mst.smX)) {
						const cim = Math.round(mst.smX / FIELD_CELL) + 1;
						const cjm = Math.round(mst.smY / FIELD_CELL) + 1;
						const kr = (fieldKernelSize - 1) / 2;
						for (let ky = -kr; ky <= kr; ky += 1) {
							const row = cjm + ky;
							if (row < 0 || row >= fieldRows) continue;
							const krow = (ky + kr) * fieldKernelSize + kr;
							for (let kx = -kr; kx <= kr; kx += 1) {
								const col = cim + kx;
								if (col < 0 || col >= fieldCols) continue;
								field[row * fieldCols + col] += fieldKernel[krow + kx];
							}
						}
					}
					// Per-particle scatter fades with speed, low-passed so a wiggle does not
					// keep switching the angle.
					const stepLen = isNaN(prevX) ? 0 : Math.hypot(mst.smX - prevX, mst.smY - prevY) / unit;
					spinSpeed += (stepLen - spinSpeed) * .1;
					const spin = MOUSE.distort / (1 + MOUSE.spinFalloff * spinSpeed);
					let touched = false;
					if (hasMouse) {
						const tr2 = TOUCH_R * TOUCH_R;
						for (const p of parts) {
							const ddx = p.cx * w - msx;
							const ddy = p.cy * h - msy;
							if (ddx * ddx + ddy * ddy < tr2) {
								touched = true;
								break;
							}
						}
					}
					curAlpha += ((touched ? .25 : .1) - curAlpha) * .08;
					// The offset chases the push target as a low-pass, the same shape as the pointer
					// smoothing above: fast while pressed, slow once the pointer is gone.
					const PUSH_RATE = .3;
					const RETURN_RATE = .05;
					// Cap on how far the offset may travel in one frame: a target that flips sides
					// would otherwise still jump. 12 px/frame = 360 px/s.
					const MAX_STEP = 12;
					for (let i = 0; i < N; i += 1) {
						const p = parts[i];
						if (p === void 0) continue;
						let ax = ox + p.ax * ww;
						let ay = oy + p.ay * (size * .75);
						if (assembled) {
							const br = 1 + Math.sin(now * .8) * .01;
							ax = whaleCx + (ax - whaleCx) * br;
							ay = whaleCy + (ay - whaleCy) * br;
							ay += Math.sin(now * .9 + p.ax * 14) * size * .004;
						}
						if (!assembled) {
							const k = .14 * (ease + .08);
							p.cx += (ax / w - p.cx) * k;
							p.cy += (ay / h - p.cy) * k;
						} else {
							p.cx = ax / w;
							p.cy = ay / h;
						}
						const px = p.cx * w;
						const py = p.cy * h;
						let tx = 0;
						let ty = 0;
						if (D > .8) {
							const mEff = (D - .8) * 5;
							// Bilinear sample of the field and of its analytic gradient, so the push
							// direction is continuous instead of stepping at cell borders.
							const cxf = px / FIELD_CELL + 1;
							const cyf = py / FIELD_CELL + 1;
							const i0 = clamp(Math.floor(cxf), 1, fieldCols - 3);
							const j0 = clamp(Math.floor(cyf), 1, fieldRows - 3);
							const fx = cxf - i0;
							const fy = cyf - j0;
							const row0 = j0 * fieldCols;
							const row1 = row0 + fieldCols;
							const f00 = field[row0 + i0];
							const f10 = field[row0 + i0 + 1];
							const f01 = field[row1 + i0];
							const f11 = field[row1 + i0 + 1];
							const fA = f00 + (f10 - f00) * fx;
							const fB = f01 + (f11 - f01) * fx;
							const f0 = fA + (fB - fA) * fy;
							const power = Math.min(1, f0 * (1 - FIELD_DECAY));
							if (power > FIELD_MIN) {
								const gx = (f10 - f00) + ((f11 - f01) - (f10 - f00)) * fy;
								const gy = (f01 - f00) + ((f11 - f10) - (f01 - f00)) * fx;
								const g2 = gx * gx + gy * gy;
								let ux;
								let uy;
								if (g2 > 1e-12) {
									const inv = 1 / Math.sqrt(g2);
									ux = -gx * inv;
									uy = -gy * inv;
								} else {
									const rx = px - mst.smX;
									const ry = py - mst.smY;
									const rl = Math.sqrt(rx * rx + ry * ry);
									if (rl > .001) {
										ux = rx / rl;
										uy = ry / rl;
									} else {
										ux = 1;
										uy = 0;
									}
								}
								const ang = Math.sin(i * .37 + now * .5) * spin;
								const ca = Math.cos(ang);
								const sa = Math.sin(ang);
								const amp = power * mEff * mst.strength * 2 * unit;
								tx = (ux * ca - uy * sa) * amp;
								ty = (ux * sa + uy * ca) * amp;
							}
						}
						const rate = tx === 0 && ty === 0 ? RETURN_RATE : PUSH_RATE;
						let mvx = (tx - p.ox) * rate;
						let mvy = (ty - p.oy) * rate;
						const mv2 = mvx * mvx + mvy * mvy;
						if (mv2 > MAX_STEP * MAX_STEP) {
							const s = MAX_STEP / Math.sqrt(mv2);
							mvx *= s;
							mvy *= s;
						}
						p.ox += mvx;
						p.oy += mvy;
						// Below a pixel the motion is invisible anyway; finish the return here
						// instead of crawling for seconds on sub-pixel steps.
						if (p.ox * p.ox + p.oy * p.oy < 1) {
							p.ox = 0;
							p.oy = 0;
						}
						const fx = px + p.ox;
						const fy = py + p.oy;
						const half = (.8 + p.s * .7) * .7 * 1.5;
						g.globalAlpha = curAlpha;
						g.fillStyle = "rgb(" + rgb + ")";
						g.fillRect(fx - half, fy - half, half * 2, half * 2);
					}
					prevX = mst.smX;
					prevY = mst.smY;
					g.globalAlpha = 1;
				};
				draw();
				let raf = 0;
				let last = 0;
				const loop = (time) => {
					raf = window.requestAnimationFrame(loop);
					if (time - last < FRAME_MS) return;
					last = time;
					draw();
				};
				raf = window.requestAnimationFrame(loop);
				return () => {
					window.cancelAnimationFrame(raf);
					window.removeEventListener("mousemove", onMove);
					window.removeEventListener("mouseleave", onLeave);
					disposeBox();
				};
			}, []);
			return (0, react_jsx_runtime.jsx)("canvas", {
				ref,
				style: {
					position: "fixed",
					left: 0,
					top: 0,
					width: "100%",
					height: "100%",
					pointerEvents: "none",
					zIndex: 1
				}
			});
		}
		/** Services this browser half waits for before it registers its canvases. */
		const inject = ["slots"];
		/**
		* Register the two background layers into the frame-wide overlay seat.
		* @param ctx - the client context, with `slots` resolved through {@link inject}.
		*/
		function apply(ctx) {
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "dsh-whale-particles-bg-dotgrid",
				order: 0
			}, DotGridCanvas));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "dsh-whale-particles-bg-whale",
				order: 1
			}, WhaleCanvas));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map