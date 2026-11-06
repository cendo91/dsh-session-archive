/**
 * Host half of the Session Archive bundle.
 *
 * Exposes one authenticated Fetch route that permanently removes a Session's
 * DSH-owned artifacts. DSH itself has no delete API: session persistence is
 * append-only, so this route performs the same maintenance a user would do by
 * hand, and only for Sessions that are archived, cold, and root-level.
 *
 * Deleted: every stored log generation of the Session and of its subagent
 * descendants, their projection-cache records, and their archive, pin, and
 * workspace ownership entries.
 *
 * Never deleted: workspace project files, shared attachments, or anything
 * outside the DSH home.
 */
import { mkdir, readFile, readdir, lstat, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';

/** Required Host services. */
export const inject = [
  'connection',
  'sessionPersistence',
  'sessionQuery',
  'workspaceRegistry',
];

/** Absolute pathname the Host registers the delete route under. */
const DELETE_PATH = '/api/session-archive.delete';

/** Session ids are single safe path segments; anything else is refused. */
const SESSION_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/;

/**
 * Register the authenticated permanent-delete route.
 * @param ctx - Host context carrying Connection, Session query, and the Workspace registry.
 */
export function apply(ctx) {
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: DELETE_PATH,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: (request) => deleteRouteResponse(ctx, request),
      }),
    'session-archive: delete route',
  );
  // Finish deletions queued while a Session was still loaded in the previous
  // app run. This runs during plugin activation, before any browser can resume
  // a Session, so queued Sessions are cold by now. A second pass covers a
  // storage backend that was not readable yet on the first attempt.
  void sweepPending(ctx).catch(() => {});
  ctx.effect(() => {
    const timer = setTimeout(() => {
      void sweepPending(ctx).catch(() => {});
    }, 2500);
    timer.unref?.();
    return () => clearTimeout(timer);
  }, 'session-archive: pending delete retry');
}

/** JSON response helper. */
function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/** Resolve the DSH home the running process actually uses. */
function dshHome() {
  const configured = process.env['DSH_HOME'];
  if (typeof configured === 'string' && configured.length > 0) return resolve(configured);
  return join(homedir(), '.dsh');
}

/** Read the durable archive set the Workspace registry keeps. */
async function readArchivedSessionIds(home) {
  const text = await readFile(join(home, 'storages', 'workspace.json'), 'utf8');
  const parsed = JSON.parse(text);
  const ids = parsed?.global?.archivedSessionIds;
  if (!Array.isArray(ids)) throw new Error('workspace registry has no archive set');
  return new Set(ids.filter((id) => typeof id === 'string'));
}

/** Fetch the live-preferred session records; empty when the service is absent. */
async function sessionRecords(ctx, signal) {
  const query = ctx.get('sessionQuery');
  if (query === undefined) throw Object.assign(new Error('session query service is unavailable'), { status: 501 });
  return query.listSessions(signal);
}

/** Collect every subagent descendant id recorded under one root Session. */
function descendantIds(records, rootId) {
  const children = new Map();
  for (const record of records) {
    const parent = record.header.parentSession;
    if (typeof parent !== 'string') continue;
    const list = children.get(parent) ?? [];
    list.push(record.header.id);
    children.set(parent, list);
  }
  const collected = [];
  const queue = [...(children.get(rootId) ?? [])];
  while (queue.length > 0) {
    const id = queue.shift();
    if (collected.includes(id)) continue;
    collected.push(id);
    for (const child of children.get(id) ?? []) queue.push(child);
  }
  return collected;
}

/** Refuse a path that is not strictly inside the expected root. */
function assertInside(root, target) {
  const rel = relative(resolve(root), resolve(target));
  if (rel === '' || rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error(`refusing to touch a path outside the session store: ${target}`);
  }
}

/**
 * Locate every project directory that stores one Session, refusing symlinked
 * targets so a link cannot redirect deletion outside the session store.
 */
async function sessionDirectories(home, sessionId) {
  const root = join(home, 'sessions');
  let projects;
  try {
    projects = await readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }
  const found = [];
  for (const project of projects) {
    if (!project.isDirectory()) continue;
    const candidate = join(root, project.name, sessionId);
    assertInside(root, candidate);
    try {
      const info = await lstat(candidate);
      if (info.isSymbolicLink()) {
        throw new Error(`refusing to follow a symlinked session directory: ${candidate}`);
      }
      if (info.isDirectory()) found.push(candidate);
    } catch (error) {
      if (error?.code === 'ENOENT') continue;
      throw error;
    }
  }
  return found;
}

/** Remove one Session's stored logs and projection-cache record. */
async function removeArtifacts(home, sessionId) {
  const removed = [];
  for (const directory of await sessionDirectories(home, sessionId)) {
    await rm(directory, { recursive: true, force: true });
    removed.push(directory);
  }
  await rm(join(home, 'storages', 'session_projcache', 'sessions', `${sessionId}.json`), {
    force: true,
  });
  return removed;
}

/** Drop archive, pin, and workspace accounting for every removed Session. */
async function clearRegistryEntries(registry, sessionIds) {
  const warnings = [];
  for (const sessionId of sessionIds) {
    try {
      await registry.unarchiveSession(sessionId);
    } catch (error) {
      warnings.push(`unarchive ${sessionId}: ${messageOf(error)}`);
    }
    try {
      await registry.unpinSession(sessionId);
    } catch (error) {
      warnings.push(`unpin ${sessionId}: ${messageOf(error)}`);
    }
  }
  for (const workspace of registry.list()) {
    for (const sessionId of sessionIds) {
      if (!workspace.sessionIds.includes(sessionId)) continue;
      try {
        await workspace.detachSession(sessionId);
      } catch (error) {
        warnings.push(`detach ${sessionId}: ${messageOf(error)}`);
      }
    }
  }
  return warnings;
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}

/** File holding deletions queued while their Session was still loaded. */
function pendingPath(home) {
  return join(home, 'session-archive', 'pending.json');
}

/** Read queued Session ids, ignoring a missing or malformed file. */
async function readPending(home) {
  try {
    const parsed = JSON.parse(await readFile(pendingPath(home), 'utf8'));
    if (!Array.isArray(parsed)) return [];
    return [
      ...new Set(parsed.filter((id) => typeof id === 'string' && SESSION_ID_PATTERN.test(id))),
    ];
  } catch {
    return [];
  }
}

/** Persist the queued ids, removing the file when nothing is left. */
async function writePending(home, ids) {
  const unique = [...new Set(ids)];
  const file = pendingPath(home);
  if (unique.length === 0) {
    await rm(file, { force: true });
    return;
  }
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(unique), 'utf8');
}

/** Queue one Session for deletion at the next Host start. */
async function enqueuePending(home, sessionId) {
  const pending = await readPending(home);
  if (pending.includes(sessionId)) return;
  pending.push(sessionId);
  await writePending(home, pending);
}

/**
 * Apply deletions queued during a previous app run. A queued Session stays
 * queued when it is somehow already loaded again or its registry is not
 * readable yet; it is dropped when the user unarchived it in the meantime.
 */
async function sweepPending(ctx) {
  const home = dshHome();
  const pending = await readPending(home);
  if (pending.length === 0) return;
  const remaining = [];
  for (const sessionId of pending) {
    try {
      const records = await ctx.sessionQuery.listSessions();
      const byId = new Map(records.map((record) => [record.header.id, record]));
      const target = byId.get(sessionId);
      if (target !== undefined && target.live) {
        remaining.push(sessionId);
        continue;
      }
      let archived;
      try {
        archived = await readArchivedSessionIds(home);
      } catch {
        remaining.push(sessionId);
        continue;
      }
      if (!archived.has(sessionId)) continue;
      const descendants = target === undefined ? [] : descendantIds(records, sessionId);
      const sessionIds = [sessionId, ...descendants];
      if (sessionIds.some((id) => byId.get(id)?.live === true)) {
        remaining.push(sessionId);
        continue;
      }
      for (const id of sessionIds) await removeArtifacts(home, id);
      await clearRegistryEntries(ctx.workspaceRegistry, sessionIds);
      for (const id of sessionIds) {
        try {
          ctx.emit('api-session/removed', id);
        } catch {
          /* no browser is attached during startup */
        }
      }
    } catch {
      remaining.push(sessionId);
    }
  }
  await writePending(home, remaining);
}

/**
 * Validate the request target: it must exist, be a root Session, and be
 * archived. A Session still loaded in this app run cannot be deleted now, so
 * it is reported as deferred instead of refused.
 */
function planDeletion(records, archived, sessionId) {
  const byId = new Map(records.map((record) => [record.header.id, record]));
  const target = byId.get(sessionId);
  if (target === undefined) {
    return { status: 404, code: 'session-not-found', message: 'the Session does not exist' };
  }
  if (target.header.origin === 'subagent') {
    return { status: 409, code: 'session-subagent', message: 'only a root Session can be deleted' };
  }
  if (!archived.has(sessionId)) {
    return { status: 409, code: 'session-not-archived', message: 'archive the Session first' };
  }
  const descendants = descendantIds(records, sessionId);
  if (target.live || descendants.some((id) => byId.get(id)?.live === true)) {
    return { deferred: true, target, descendants };
  }
  return { target, descendants, sessionIds: [sessionId, ...descendants] };
}

/**
 * Authenticated POST handler: validate, then delete artifacts durably before
 * clearing the registry entries that reference them.
 */
async function deleteRouteResponse(ctx, request) {
  if (request.method !== 'POST') return jsonResponse(405, { error: 'POST required' });
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { error: 'invalid JSON body' });
  }
  const sessionId = payload?.sessionId;
  if (typeof sessionId !== 'string' || !SESSION_ID_PATTERN.test(sessionId)) {
    return jsonResponse(400, { error: 'invalid sessionId' });
  }

  const home = dshHome();
  let records;
  let archived;
  try {
    records = await sessionRecords(ctx, request.signal);
    archived = await readArchivedSessionIds(home);
  } catch (error) {
    return jsonResponse(error?.status ?? 500, { error: messageOf(error) });
  }

  const plan = planDeletion(records, archived, sessionId);
  if (plan.status !== undefined) {
    return jsonResponse(plan.status, { code: plan.code, error: plan.message });
  }
  if (plan.deferred === true) {
    try {
      await enqueuePending(home, sessionId);
    } catch (error) {
      return jsonResponse(500, { code: 'queue-failed', error: messageOf(error) });
    }
    return jsonResponse(202, {
      deferred: true,
      deletedSessionIds: [sessionId],
      restartRequired: true,
      warnings: [],
    });
  }

  const removedDirectories = [];
  try {
    for (const id of plan.sessionIds) {
      for (const directory of await removeArtifacts(home, id)) removedDirectories.push(directory);
    }
  } catch (error) {
    return jsonResponse(500, {
      code: 'delete-failed',
      error: messageOf(error),
      removedLogDirectories: removedDirectories.length,
    });
  }

  const warnings = [];
  const registry = ctx.get('workspaceRegistry');
  if (registry === undefined) {
    warnings.push('workspace registry is unavailable; archive and ownership entries were kept');
  } else {
    for (const warning of await clearRegistryEntries(registry, plan.sessionIds)) {
      warnings.push(warning);
    }
  }

  // Forward the removals to every connected browser. `api-session/removed` is an
  // allowlisted Remote event (dsh-api-remotes), so the sidebar's workspace groups,
  // its ungrouped bucket, and every other Session list drop these rows at once
  // instead of waiting for a restart.
  for (const id of plan.sessionIds) {
    try {
      ctx.emit('api-session/removed', id);
    } catch (error) {
      warnings.push(`notify ${id}: ${messageOf(error)}`);
    }
  }

  return jsonResponse(200, {
    deletedSessionIds: plan.sessionIds,
    removedLogDirectories: removedDirectories.length,
    restartRequired: false,
    restartRecommended: true,
    warnings,
  });
}

export { sweepPending };

