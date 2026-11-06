# DSH Session Archive — agent instructions

DeepSeek Harness Web UI plugin. This directory is the repository root.

- Current release: **1.0.1**
- Tested DSH: **0.2.1-rc.5**, **0.2.2-rc.1**
- npm: `@cendo91/dsh-session-archive`
- GitHub: `cendo91/dsh-session-archive`

## Read first

- [`docs/handoff.md`](docs/handoff.md) — architecture, DSH integration points, release checklist.
- [`CHANGELOG.md`](CHANGELOG.md) — what changed and current status.

Do not re-inspect DSH internals unless a test fails; the handoff doc records the
APIs and file layout this plugin relies on.

## Files

```text
index.js          Host half: authenticated delete route, pending queue, startup sweep
client.js         Browser half: sidebar icon, panel, tabs, dialogs, Session-store updates
cordis.patch.yml  Bundle patch that inserts the plugin row
locale/en.json    Plugin display metadata (English)
locale/zh.json    Plugin display metadata (Chinese)
icon.svg          Plugin icon
README.md         User-facing install/usage/compatibility
CHANGELOG.md      Release history
docs/handoff.md   Detailed developer handoff
```

## Commands

```powershell
npm run check          # node --check index.js && node --check client.js
npm pack --dry-run     # inspect the npm tarball (9 files)
```

Release (only when the user asks):

```powershell
npm version patch --no-git-tag-version
git add -A
git commit -m "chore: release X.Y.Z"
npm publish --access public
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

## Install forms

```text
@cendo91/dsh-session-archive@1.0.1
github:cendo91/dsh-session-archive#v1.0.1
<absolute path to this directory>     # local development
```

## Rules

- The npm package and a local-path install share the bundle row id
  `session-archive`; install only one at a time.
- Host changes (`index.js`, patch, locale metadata) need a DSH restart;
  client changes (`client.js`) need a page refresh.
- Ask before publishing, pushing tags, or removing the installed bundle.
- Never commit tokens, `.npmrc`, `pending.json`, session data, or local paths.
- Keep `README.md` and `CHANGELOG.md` current; they are the durable memory for
  future sessions.
