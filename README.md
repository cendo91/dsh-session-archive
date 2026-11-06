# DSH Session Archive

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI plugin that adds a **Session archive** panel to the left sidebar: browse archived Sessions, restore them, archive active ones, and permanently delete archived Sessions' local data.

English | [中文](#中文说明)

## Requirements

- DeepSeek Harness 0.2.x with the Web UI (Desktop Web or standalone Web profile).
- Tested with **0.2.1-rc.5**. No runtime dependencies and no build step.

## Install

Open **Settings → Plugins → Add** and use one of:

```text
# GitHub (recommended until the first npm release; pin a tag)
github:cendo91/dsh-session-archive#v1.0.0

# npm
@cendo91/dsh-session-archive@1.0.0

# local checkout (absolute path to this folder)
C:\path\to\dsh-session-archive
```

Refresh the page after installation. If the running Host process cannot load the new Host half, restart DSH once.

## Features

- Sidebar panel with **Archived** and **Sessions** tabs and live counts.
- **Restore** an archived Session, **archive** an active one, and **delete** an archived one.
- Delete runs from the confirmation dialog and requires an archived, root-level Session.
- Chinese and English UI, following the Harness locale.

### What delete removes

| Data | Removed |
| --- | --- |
| Stored log generations under `$DSH_HOME/sessions/<project>/<id>/` | yes |
| Subagent Session logs recorded under that Session | yes |
| Projection cache `storages/session_projcache/sessions/<id>.json` | yes |
| Archive, pin, and workspace ownership entries | yes |
| Workspace project files, code, documents | **no** |
| Shared attachments (content-addressed) | **no** |

### Deleting a Session that is still loaded

DSH exposes no public API to unload a Session that is attached in the current app run. Such a deletion is **queued** in `$DSH_HOME/session-archive/pending.json` and completed automatically during the next DSH start, before any browser can resume a Session. The panel hides the row immediately and tells you a restart is needed. If you unarchive the Session before restarting, the queued deletion is cancelled.

Cold Sessions (not loaded in this app run) are deleted immediately.

## Safety

- Deletion is **permanent**. The confirmation dialog lists the scope before you confirm.
- The delete endpoint is an authenticated Connection Fetch route; the browser submits only a Session ID. Paths are derived from `$DSH_HOME` and validated; symlinked Session directories and path traversal are refused.
- Only DSH-owned data is touched. Workspace files and shared attachments are kept.
- The plugin makes no network requests and collects no telemetry.

## Compatibility

The plugin relies on DSH internals and is version-sensitive:

- the `api-session/removed` forwarded Remote event;
- the client `sessions` store and its `handleSessionRemoved` reduction;
- the JSONL Session layout under `$DSH_HOME/sessions`;
- `$DSH_HOME/storages/session_projcache` and `$DSH_HOME/storages/workspace.json`.

DSH upgrades may change any of them. `package.json` declares `engines.dsh` to block clearly incompatible installations, but re-test deletion after every DSH upgrade. A future DSH version that adds a real Session-deletion API should replace the file-level maintenance in this plugin.

## Development

```text
index.js          Host half: authenticated delete route, pending queue, startup sweep
client.js         Browser module: sidebar icon, panel, dialogs, Session-store updates
cordis.patch.yml  Bundle patch that inserts the plugin row
locale/en.json    Plugin display metadata (English)
locale/zh.json    Plugin display metadata (Chinese)
icon.svg          Plugin icon
```

```bash
npm run check          # syntax-check both halves
npm run pack:check     # inspect the npm tarball contents
```

Install the local checkout from **Settings → Plugins → Add** with this folder's absolute path while developing. Replacing an installed package normally requires a DSH restart to load a fresh Host module generation.

## License

MIT. See [LICENSE](LICENSE).

---

## 中文说明

这是一个 DeepSeek Harness（DSH）Web UI 插件，在左侧栏增加「**会话归档**」面板：浏览已归档会话、恢复归档、归档活动会话，以及**永久删除**已归档会话的本地数据。

### 安装

打开 **设置 → 插件 → 添加**，填以下任意一种：

```text
# GitHub（npm 首发前推荐，建议锁定 tag）
github:cendo91/dsh-session-archive#v1.0.0

# npm
@cendo91/dsh-session-archive@1.0.0

# 本地目录（此文件夹的绝对路径）
C:\path\to\dsh-session-archive
```

安装后刷新页面；如果 Host 端需要重启，按提示重启一次 DSH。

### 功能

- 「已归档 / 会话」两个标签及实时计数；
- 恢复、归档、删除；删除只能针对已归档的根会话；
- 中英文界面，跟随 Harness 语言。

### 删除范围

**会删除**：该会话在 `$DSH_HOME/sessions/` 下的全部日志版本、它的子代理会话日志、投影缓存 `storages/session_projcache/sessions/<id>.json`，以及归档、置顶、工作区归属登记。

**不会删除**：工作区里的项目文件、代码、文档；共享附件（内容寻址，可能被其他会话引用）。

### 仍被加载的会话

DSH 没有公开的「卸载当前运行中会话」接口。对这类会话点删除会**排队**到 `$DSH_HOME/session-archive/pending.json`，在下次 DSH 启动时（浏览器恢复会话之前）自动完成删除。面板会立即隐藏该行并提示需要重启；若在重启前恢复了归档，排队会被取消。冷会话（本次运行未加载）则立即删除。

### 安全与兼容

- 删除**不可恢复**，确认框会列出范围；
- 删除接口走 Connection 的已认证 Fetch 通道，浏览器只提交会话 ID；路径由 `$DSH_HOME` 推导并校验，拒绝路径穿越和符号链接目录；
- 不访问网络、无遥测；
- 依赖 DSH 内部事件与磁盘布局（`api-session/removed`、客户端 `sessions` 服务、`$DSH_HOME/sessions`、`storages/session_projcache`、`storages/workspace.json`）。DSH 升级后请重新测试删除；`engines.dsh` 会阻止明显不兼容的版本安装。

### 开发

```bash
npm run check
npm run pack:check
```

开发时可把本目录的绝对路径填进「设置 → 插件 → 添加」进行本地安装。替换已安装的包通常需要重启 DSH 才能加载新的 Host 模块。

## License

MIT
