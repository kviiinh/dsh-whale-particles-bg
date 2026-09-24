# dsh-whale-particles-bg

[English](#english) | [中文](#中文)

Animated whale particle background for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) Web UI — the WHALE-silhouette particle field plus the official dot-grid layer, registered into the frame-wide `shell.overlay` seat.

Topics: `dsh-plugin` · `deepseek-harness` · `cordis-plugin`

---

## English

### Preview

12-second capture of the whale field assembling from its scattered shell, breathing at idle, and being pushed around by the pointer (`src/preview.gif`, 720×360, 10fps, 2.8 MB — converted from `src/preview.mp4`, 1908×956, H.264/AAC, 12.7s, 4.1 MB):

![whale particle background preview](https://gitee.com/kviiin/dsh-whale-particles-bg/raw/main/src/preview.gif)

The animated GIF above plays inline by itself. Gitee's README renderer strips every video form — raw `<video>`, `.mp4` markdown images and `<iframe>` all render as an empty paragraph there — so a real player box cannot be embedded from a repository file; the full-quality video with audio is here: **[src/preview.mp4](https://gitee.com/kviiin/dsh-whale-particles-bg/raw/main/src/preview.mp4)** (4.1 MB).

### What it is

| Layer | Content |
| --- | --- |
| Whale (z-index 1) | Particle field sampled from the WHALE SVG path (24×18 viewBox, 6× offscreen rasterization, sampled every 2px). Particles assemble from a scattered shell, breathe when idle, and are pushed away from the pointer inside a 4.9-world-unit radius along a rotating per-particle angle. |
| Dot grid (z-index 0) | 90px square lattice with neighbour lines and a 140px pointer attraction that swells the dots. |

Both layers are fixed, full-viewport, click-through canvases. The theme is read from `body[data-ds-dark-theme]` on every frame (dark: `rgb(215,232,255)`, light: `rgb(50,82,135)`), so light/dark follows with no subscription. Animation runs on `requestAnimationFrame` throttled to ~30fps, which also suspends it while the tab is hidden.

### Install

Prerequisites: a dsh deployment with the `dsh` CLI on `PATH` (or a source checkout, where `pnpm dsh …` works).

```sh
dsh plugin --profile web add git+https://gitee.com/kviiin/dsh-whale-particles-bg.git

#    other sources:
#      local path : dsh plugin --profile web add /abs/path/to/this/repo
#      npm        : dsh plugin --profile web add dsh-whale-particles-bg   (if published)
```

This package is a **bundle**: it declares `dsh.bundle`, so the install appends it to the profile's `dsh.profile.bundles` and the package's own `cordis.patch.yml` inserts the plugin row (`id: whale-particles-bg`). There is nothing to hand-edit, and `dsh plugin --profile web remove dsh-whale-particles-bg` removes both the dependency and the layer.

Restart the harness (`dsh web`). **Settings → Plugins → Plugin list → Global plugins** then lists `whale-particles-bg` as running, and the whale background appears behind the UI.

> `lib/` is committed on purpose. The browser half must be a `window.__ModuleLoader__.load({ id, factory })` bundle produced by dsh's own tsdown preset (`packages/client/tsdown.client.ts`), which only exists inside a dsh checkout. Shipping the built artifact is what makes a git-installed copy loadable without a build step, and it keeps installs free of any `prepare`-script permission prompt. There is deliberately no `prepare` script.

### Rebuild after a dsh upgrade

```sh
scripts/build.sh /path/to/deepseek-harness
```

The script stages the sources into `<checkout>/packages/client/dsh-whale-particles-bg/`, runs `pnpm install` → `tsc -b` → `tsdown --env.DSH_BUILD_FACE client`, copies `lib/` back here, then removes the staged copy and restores `pnpm-lock.yaml` — including when the build fails.

### Layout

| Path | Purpose |
| --- | --- |
| `src/client/index.tsx` | Browser half: the two canvas components and the `shell.overlay` registration |
| `src/client/whale-path.ts` | The WHALE path constant |
| `src/client/global.css` | Page background color/gradient (injected as a tagged `<style>` at factory execution) |
| `src/preview.mp4` | 12s screen capture for the Preview section above (repo-only: `files` excludes `src/`, so npm publishing stays lean) |
| `src/preview.gif` | Animated GIF (720×360, 10fps) converted from `preview.mp4`; this is what the Preview section embeds |
| `src/index.ts` | Node half: an empty `apply` (a pure UI plugin only needs to exist in the Loader) |
| `cordis.patch.yml` | The bundle layer: inserts the `whale-particles-bg` row |
| `lib/` | Built artifacts: `index.js` (node half) + `client.js` + `client.js.map` |
| `scripts/build.sh` | Rebuild against a checkout and copy the artifacts back |

### Listing in the plugin market

The community market ([dsh-market](https://github.com/dsh-market/dsh-market)) is served by the curated [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) registry, so being in that registry is what makes a plugin installable from **Settings → Plugin Market**. Three things get a plugin there:

1. the repository carries the `dsh-plugin` GitHub topic;
2. the package declares a `dsh.bundle` manifest (this one does);
3. one entry is submitted by pull request into the registry's **UI Enhancements** category.

### Notes and limits

- `global.css` overrides the `body` background with `!important`, so it affects the whole page. Making it configurable means registering a settings namespace and shipping a card in the Plugins settings tab.
- No settings namespace and no host-side behavior, so no per-package approval is required. Disable it with `dsh plugin --profile web remove dsh-whale-particles-bg`, or set `disabled: true` on the row in the profile patch.
- Out-of-tree plugins carry a `@deepseek-ai/cordis` peer dependency; after a major dsh upgrade, rebuild the package if the peer no longer matches.

---

## 中文

鲸鱼粒子背景 —— dsh web 客户端的**正式插件包**（bundle 形态，可 `dsh plugin add` 一键安装，替代只在进程内存里存活的动态 Cordis 插件）。

- **鲸鱼层**（z-index 1）：从 WHALE 路径栅格化采样的粒子场（24×18 viewBox，6 倍离屏栅格化、每 2px 采样），入场从散点聚合、空闲呼吸与尾部波浪、指针 4.9 世界单位半径内的旋转斥力
- **点线网格层**（z-index 0）：90px 点阵 + 邻居连线 + 指针 140px 吸引/放大
- **主题适配**：每帧读 `body[data-ds-dark-theme]`；深色 `rgb(215,232,255)` / 浅色 `rgb(50,82,135)`
- **挂载点**：`shell.overlay`（由 `@deepseek-ai/dsh-client-ui-layout` 声明的 root 作用域 list 槽位），两个全屏 fixed canvas、`pointer-events: none`
- **帧率**：`requestAnimationFrame` 限 30fps（`FRAME_MS = 33`）；页面隐藏时浏览器自动暂停 rAF

### 预览

12 秒录屏：粒子从散点聚合、空闲呼吸，以及指针进入时的旋转斥力（动图 `src/preview.gif`，720×360，10fps，2.8 MB；由 `src/preview.mp4` 转出，源片 1908×956，H.264/AAC，12.7s，4.1 MB）：

![鲸鱼粒子背景预览](https://gitee.com/kviiin/dsh-whale-particles-bg/raw/main/src/preview.gif)

上面的动图会自动循环播放。Gitee 的 README 渲染器会过滤所有视频形式——原始 `<video>`、`.mp4` 图片语法、`<iframe>` 在 README 里都只会渲染成一个空段落——所以没法直接用仓库里的文件嵌出真正的播放器；要看带声音的完整画质：**[src/preview.mp4](https://gitee.com/kviiin/dsh-whale-particles-bg/raw/main/src/preview.mp4)**（4.1 MB）。

### 目录

| 文件 | 说明 |
| --- | --- |
| `src/client/index.tsx` | 浏览器半边：两个 canvas 组件 + `shell.overlay` 注册 |
| `src/client/whale-path.ts` | WHALE 路径常量（从原动态插件备份机械提取，md5 一致） |
| `src/client/global.css` | 页面背景色/渐变（构建时以带标记的 `<style>` 注入） |
| `src/preview.mp4` | 上方「预览」用的 12 秒录屏（仅随仓库分发：`files` 未收录 `src/`，npm 包不受影响） |
| `src/preview.gif` | 由 `preview.mp4` 转出的动图（720×360，10fps），即上方「预览」内嵌的文件 |
| `src/index.ts` | Node 半边：空 `apply`（纯 UI 插件只需在 Loader 里出现） |
| `cordis.patch.yml` | bundle 层：插入 `whale-particles-bg` 这一行 |
| `lib/` | 构建产物：`index.js`（node 半）+ `client.js`（`__ModuleLoader__` 工厂 bundle）+ sourcemap |
| `scripts/build.sh` | 在指定 checkout 中重新构建并把产物拷回 |

### 安装

```sh
dsh plugin --profile web add git+https://gitee.com/kviiin/dsh-whale-particles-bg.git
# 或本地路径：dsh plugin --profile web add /绝对路径/dsh-whale-particles-bg
```

本包是 **bundle**（声明了 `dsh.bundle`）：安装时会自动把包追加进 profile 的 `dsh.profile.bundles`，并由包内自带的 `cordis.patch.yml` 插入插件行（`id: whale-particles-bg`）。**不需要手改任何补丁文件**；`dsh plugin --profile web remove dsh-whale-particles-bg` 会同时移除依赖与这一层。

重启 `dsh web` 后生效，插件会出现在 **设置 → 插件 → 插件列表** 的「全局插件」分组。

> 若 `dsh` 不在 PATH 上（源码方式运行），用 `pnpm dsh plugin --profile web add <路径>`。

### 上架插件市场

社区市场 [dsh-market](https://github.com/dsh-market/dsh-market) 的数据来自精选注册表 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)——进了该注册表，才能在 **设置 → 插件市场** 里一键安装。三个条件：

1. 仓库带 `dsh-plugin` GitHub 话题；
2. 包声明 `dsh.bundle`（本包已满足）；
3. 向注册表的 **UI Enhancements** 分类提一个 PR 条目。

### 重新构建（DSH 升级后）

```sh
scripts/build.sh /path/to/deepseek-harness
```

脚本流程：把源码暂存到 `<checkout>/packages/client/dsh-whale-particles-bg/` → `pnpm install` → `tsc -b` → `tsdown --env.DSH_BUILD_FACE client` → 把 `lib/` 拷回本目录 → 删除暂存目录、恢复 `pnpm-lock.yaml`（失败时同样会还原）。

**为什么必须暂存进 checkout**：共享 tsdown 预设 `packages/client/tsdown.client.ts` 会按名字在 `packages/*/*` 下查找包清单，工作区之外的包会直接抛错（`no packages/*/*/package.json declares the name ...`）。

### 从动态插件移植时的差异

| 项 | 动态插件（whale-bg） | 本包 |
| --- | --- | --- |
| 外形 | `cordis_define` 的 JS 函数体字符串 | npm 包（TS/TSX + 构建产物） |
| 槽位 API | `ctx.get('slots').inject/register` | `ctx.slots.inject/register`（**相同契约**） |
| 样式 | `styles.insert(...)` | `import './global.css'`（构建时注入带标记 `<style>`） |
| 定时器 | `ctx.timer.interval(draw, 33)` | `requestAnimationFrame` + 33ms 累加器 |
| 隐藏暂停 | `visibilitychange` 监听 | 不需要（rAF 自动暂停） |
| 生效范围 | 当前会话、需授权、重启即失 | 全局、随部署启动、无需授权 |

### 已知限制

- `global.css` 用 `!important` 覆盖 `body` 背景，**影响整个页面**。如需可配置，可再注册一个 settings 命名空间并在「插件配置」里出卡片。
- 未注册 settings、无 host 半逻辑，因此不需要逐次授权。停用方式：`dsh plugin --profile web remove dsh-whale-particles-bg`，或在 profile 补丁里给该行加 `disabled: true`。
- 外部插件对 `@deepseek-ai/cordis` 有 peer 依赖；DSH 大版本升级后若 peer 不匹配，需要重新构建本包。

## License

MIT — see [LICENSE](./LICENSE).
