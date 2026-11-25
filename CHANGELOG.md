# Changelog

## 1.0.3

- Verified against DeepSeek Harness 0.2.2-rc.5. Documentation-only release: the
  plugin code is unchanged from 1.0.2.
- The two upgrade guides between 0.2.2-rc.3 and 0.2.2-rc.5 (`v0.2.2-rc.3/deepseek-refusal-code`,
  `v0.2.2-rc.4/web-search-deepseek-model-default`) touch DeepSeek error codes and
  web-search defaults, neither of which this plugin consumes.
- Re-checked every surface on the running 0.2.2-rc.5 build: plugin entry `active`,
  `session-archive` still occupies `sidebar.panellist` and the keyed `main` slot,
  `api-session/removed` still allowlisted, `sessions.handleSessionRemoved` still
  implemented in the shipped browser bundle, `sessionQuery.listSessions` and
  `SessionRecord{header,live}`, `workspaceRegistry` unarchive/unpin without
  existence checks, `Workspace.detachSession`, `WorkspaceArchiveError` +
  `workspace/session-active`, the Connection Fetch route shape, the theme tokens
  in use, and the `$DSH_HOME` storage layout are all unchanged.

## 1.0.2

- Verified against DeepSeek Harness 0.2.2-rc.3. Every DSH surface the plugin uses
  still exists: `api-session/removed`, `sessionQuery.listSessions` with
  `SessionRecord.header`/`live`, `header.parentSession`/`origin`, the
  `workspaceRegistry` archive/pin/detach methods, the Connection Fetch route API,
  the `sidebar.panellist` and keyed `main` Slots, `locale.register`, all twelve
  theme tokens in use, and the `$DSH_HOME` storage layout (`sessions/<project>/<id>/`,
  `storages/session_projcache/sessions/<id>.json`, `storages/workspace.json`).
- Applied the 0.2.2-rc.1 window-drag-region migration the 1.0.1 verification
  missed: the delete dialog's full-viewport backdrop now declares
  `data-window-drag-exclude`, so on macOS Desktop its controls no longer fall
  inside the header's drag row. Windows and Web behavior is unchanged.
- Documented two DSH 0.2.2 behaviors that change what deletion leaves behind:
  archiving can now remove a clean Session worktree (the checkout, never the
  branch), and deleting an archived Session does not reclaim a retained
  worktree; `sessions.handleSessionRemoved` is no longer listed by DSH's Client
  Service inspection, though the shipped browser bundle still implements it.
- No change to the delete route, the pending queue, the startup sweep, or the UI.

## 1.0.1

- Verified against DeepSeek Harness 0.2.2-rc.1. No functional changes: the sidebar
  panel, archive/restore actions, deletion, the deferred-deletion queue, and the
  connected-window removal broadcast all continue to work with the new release.
- Documentation now names both tested DSH versions.

## 1.0.0

First public release.

- Session archive panel in the left sidebar: Archived/Sessions tabs, live counts, and search.
- Restore an archived Session, archive an active one.
- Permanently delete an archived Session: all stored log generations, subagent logs,
  projection cache, and archive/pin/workspace ownership. Workspace project files and
  shared attachments are kept.
- A Session still loaded in the running app is queued and deleted automatically on
  the next DSH start.
- Connected browser windows drop deleted rows immediately via `api-session/removed`.
- Chinese and English UI.
