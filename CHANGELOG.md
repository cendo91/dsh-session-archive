# Changelog

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
