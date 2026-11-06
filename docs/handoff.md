# Developer handoff — DSH Session Archive

Last updated: 2026-11-06, release **1.0.1**, DSH **0.2.2-rc.1**.

This document is the durable memory for future sessions. Read it before changing
the plugin; only inspect DSH internals when something here is wrong or a test fails.

## What the plugin is

A DeepSeek Harness Web UI plugin that adds a **Session archive** panel to the left
sidebar:

- browse archived and active Sessions, search by title/workspace/id;
- restore an archived Session, archive an active one;
- permanently delete an archived Session's DSH-owned data (logs, subagent logs,
  projection cache, archive/pin/workspace ownership);
- JSON/English UI, sidebar icon, theme-token CSS.

Deliberately **not** deleted: workspace project files and shared attachments
(content-addressed and possibly referenced by other Sessions).

## Architecture

### Host half — `index.js`

Registered as a Cordis plugin with `inject = ['connection', 'sessionPersistence',
'sessionQuery', 'workspaceRegistry']`.

- `apply(ctx)`:
  - `ctx.connection.fetch.register({ path: '/api/session-archive.delete',
    methods: ['POST'], requestBody: 'buffered', fetch: ... })` through
    `ctx.effect`;
  - runs `sweepPending(ctx)` and schedules one retry after 2.5 s.
- Authenticated route handler `deleteRouteResponse`:
  - JSON body `{ sessionId }`; validates the id with
    `/^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/`;
  - `sessionQuery.listSessions()` → records; `readArchivedSessionIds(home)` reads
    `$DSH_HOME/storages/workspace.json` (`global.archivedSessionIds`);
  - `planDeletion` refuses unknown ids (404), subagent roots (409), non-archived
    Sessions (409); a Session still `live` in this app run becomes **deferred**
    (202), not an error;
  - immediate path: `removeArtifacts()` for the root and all subagent descendants,
    then `clearRegistryEntries()` (`unarchiveSession`, `unpinSession`,
    `Workspace.detachSession`), then `ctx.emit('api-session/removed', id)` for
    every removed id; returns `{ deletedSessionIds, warnings, restartRequired:
    false, restartRecommended: true }`;
  - deferred path: appends the root id to
    `$DSH_HOME/session-archive/pending.json`, returns `{ deferred: true,
    deletedSessionIds: [id], restartRequired: true }`.
- `removeArtifacts(home, id)`:
  - scans `$DSH_HOME/sessions/*/<id>/` and removes the whole Session directory
    (format-agnostic; current files are `session.v4.jsonl.zstd`);
  - removes `$DSH_HOME/storages/session_projcache/sessions/<id>.json`;
  - refuses paths outside the session store and symlinked Session directories.
- `clearRegistryEntries(registry, ids)`:
  - `registry.unarchiveSession(id)`, `registry.unpinSession(id)`;
  - for each `registry.list()` Workspace whose `sessionIds` include the id,
    `workspace.detachSession(id)`; failures become `warnings`.
- `sweepPending(ctx)` (startup):
  - reads the queue, skips ids still live, drops ids no longer archived
    (cancelled queue entries), deletes root + descendants, clears registry
    entries, broadcasts removal, rewrites the queue.
- Pending queue helpers: `readPending`, `writePending`, `enqueuePending`;
  the directory `$DSH_HOME/session-archive/` is plugin-owned.

### Client half — `client.js`

- Browser module id: `@cendo91/dsh-session-archive` (must equal the package name).
- Registers:
  - `sidebar.panellist` entry `id: 'session-archive'`, `order: 20`, label
    `t('panel')`, icon component;
  - keyed `main` entry `key: 'session-archive'` rendering `Page`.
- `Page` uses the standard props `useSessions`, `useWorkspaces`, plus injected
  `ctx`, `t`, `dropSessions`.
- State: tab (`archived`/`active`), search, per-row pending/failure, locally
  hidden deleted ids, delete confirmation dialog, notice banner.
- Actions:
  - restore → `ctx.workspaces.unarchiveSession(id)`;
  - archive → `ctx.workspaces.archiveSession(id)`; if the failure is
    `workspace/session-active` (checked by the client wrapper
    `WorkspaceArchiveError` + `rpcError.code`), show “Stop and archive” →
    `archiveSession(id, { stopActivity: true })`;
  - delete → confirmation dialog → `POST api/session-archive.delete`; on 200/202
    hide the row locally and call `dropSessions(ids)`; on 202 show the deferred
    notice; on 409 show the returned reason; on 404/405 show the restart hint.
- `dropSessions(ids)` in `apply`:
  `ctx.get('sessions').handleSessionRemoved(id)` for each id — the same reduction
  the shipped `api-session/removed` listener performs, so the sidebar’s workspace
  groups and its “ungrouped” bucket update without a page reload.
- Locales: namespace `session-archive.ui` registered with `zh` and `en`
  dictionaries; UI text read at call time and re-rendered on locale changes.

## DSH integration points (verified on 0.2.1-rc.5 and 0.2.2-rc.1)

| Dependency | Notes |
|---|---|
| `api-session/removed` | Allowlisted forwarded Remote event in `@deepseek-ai/dsh-api-remotes` (`mode: 'emit'`, resources `{ session: id => id }`). Any Host plugin may `ctx.emit` it; the gateway forwards it to owner peers. |
| Client `sessions.handleSessionRemoved(id)` | Public method on the ClientSessions service; records a `remove` mutation and calls `handleRemoved()`. |
| `sessionQuery.listSessions(signal)` | Returns `SessionRecord[]` with `header` and `live`; used to find the target and subagent descendants (`header.parentSession`). |
| `workspaceRegistry.unarchiveSession` / `unpinSession` | No session-existence check; safe for deleted ids. |
| `Workspace.detachSession(id)` | Removes workspace accounting; `Workspace.sessionIds` is filtered by the header index. |
| `$DSH_HOME/sessions/<project>/<id>/` | Session-owned directory; delete the whole directory, never individual format files. |
| `$DSH_HOME/storages/session_projcache/sessions/<id>.json` | Projection cache record. |
| `$DSH_HOME/storages/workspace.json` | Workspace domain v2: `global.archivedSessionIds`, `global.pinnedSessionIds`, `tables.workspaces[ws].sessionIds`. |
| `engines.dsh` | `^0.2.1-rc.5`; DSH says “Prereleases participate in range matching”, so `0.2.2-rc.1` passes. Re-check on 0.3.x. |

### Error-class detail

0.2.2’s Host throws `WorkspaceActiveSessionError`, but the Client
`ctx.workspaces.archiveSession` wraps failures in its own
`WorkspaceArchiveError` (client bundle class name unchanged in 0.2.2), with
`rpcError.code === 'workspace/session-active'`. The plugin checks the wrapper name
+ code. If a future version changes the wrapper, rely on the code alone.

### No official deletion API

As of 0.2.2-rc.1, `sessions` has no dispose/delete, `workspaceRegistry` has no
delete-Session, and `sessionController` has no delete. The plugin’s file-level
maintenance remains necessary. A future official API should replace it.

## Deletion semantics

- Only archived, root-level Sessions (`header.origin !== 'subagent'`).
- Cold Session → immediate 200; artifacts + registry entries removed, removal
  broadcast.
- Session still `live` (loaded in this app run) → 202 deferred; row hidden now,
  artifacts deleted by the startup sweep on the next DSH start, before the browser
  can resume Sessions. If the user unarchives it before restarting, the queued
  entry is dropped without deleting.
- Subagent descendants are removed with the root (logs + projection cache).
- Queued deletion file: `$DSH_HOME/session-archive/pending.json` (plugin-owned;
  empty file removed).
- Project files and shared attachments are never touched.
- Search index: the SQLite FTS index reconciles deleted Sessions on its next
  search; no explicit cleanup is needed.

## Release checklist

Only when the user asks to release.

```powershell
cd <repo>
git status -sb
npm run check
npm pack --dry-run          # expect 9 files: index, client, patch, icon, 2 locales, README, LICENSE, package.json

# docs/version
npm version patch --no-git-tag-version
git add -A
git commit -m "chore: release X.Y.Z"
npm publish --access public
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

- npm auth: `~/.npmrc` holds a granular token with **Bypass 2FA** or publish with
  `--otp=<code>`. Tokens are 7-day by default; never commit them. npm will remove
  bypass-token direct publishing in January 2027; then use Trusted Publishing or
  stage-only.
- GitHub Release: web UI, or API with the user’s stored git credential (never
  print the token). Tag must exist on the remote first.
- Local install upgrade:
  - `plugin_manager remove_bundle @cendo91/dsh-session-archive`;
  - `plugin_manager install_bundle @cendo91/dsh-session-archive@X.Y.Z`;
  - verify the row is `active`; refresh the page, restart DSH if the Host half
    changed.
- The repo `main` may be ahead of the latest release commit for docs-only
  changes; that is expected. Do not move a release tag for docs changes.

## Development workflow

1. Edit in this repository (source of truth). Do not keep a second copy.
2. `npm run check`, `npm pack --dry-run`.
3. To test in DSH:
   - remove the npm bundle (same row id), then add this directory’s absolute path;
   - `client.js` changes → refresh page; `index.js`/patch/locale changes → restart
     DSH (or reinstall the bundle);
   - after testing, remove the local bundle and reinstall the npm version.
4. Update `CHANGELOG.md` and, when the architecture or DSH contracts change, this
   document and `AGENTS.md`.
5. Commit small, focused changes; release only on request.

## Testing notes

Historical verification used temporary, uncommitted scripts:

- Host route: temporary `DSH_HOME`, mock `sessionQuery`, `workspaceRegistry`,
  `connection.fetch.register`, `ctx.emit`; asserted refusals, immediate delete,
  deferred 202 + queue, startup sweep, file removal, registry calls, broadcast.
- Client: `react-test-renderer` with mock ctx/`sessions`; asserted tabs, search,
  restore/archive, delete dialog, deferred notice, 409 failure, row hiding.

There is no committed `tests/` directory yet. If adding tests, put them under
`tests/`, keep them independent of the real `$DSH_HOME`, and document the commands
here and in `AGENTS.md`.

## Known limitations

- No official Session delete/unload API; file-level maintenance is unsupported by
  DSH and may break on future format changes.
- A Session loaded in the current app run cannot be deleted immediately; it is
  queued to the next DSH start.
- Shared attachments are not garbage-collected.
- Windows file locks can make removal fail; the route reports the error and the
  queue retries on the next start.
- The plugin depends on internal event names, client service methods, and the
  on-disk layout; always re-test after a DSH upgrade.
