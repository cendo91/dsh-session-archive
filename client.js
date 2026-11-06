window.__ModuleLoader__.load({
  id: '@cendo91/dsh-session-archive',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Dictionary namespace owned by this plugin. */
    const NS = 'session-archive.ui';
    /** Sidebar entry id; the same string keys this plugin's main panel. */
    const PANEL_ID = 'session-archive';
    /** Document-relative address of this package's authenticated delete route. */
    const DELETE_ENDPOINT = 'api/session-archive.delete';

    const zh = {
      'panel': '会话归档',
      'title': '会话归档管理',
      'subtitle': '恢复已归档的会话，或归档不再需要的会话。',
      'tabs.archived': '已归档',
      'tabs.active': '会话',
      'tabs.archivedCount': '已归档（{count}）',
      'tabs.activeCount': '会话（{count}）',
      'search.placeholder': '搜索标题、工作区或会话 ID',
      'search.label': '搜索会话',
      'search.clear': '清除搜索',
      'list.archivedLabel': '已归档的会话',
      'list.activeLabel': '会话',
      'empty.archived.title': '还没有归档的会话',
      'empty.archived.body': '在侧边栏的会话菜单中选择“归档”，会话就会出现在这里。',
      'empty.active.title': '所有会话都已归档',
      'empty.active.body': '在“已归档”标签页恢复一个会话后，它会重新出现在这里。',
      'empty.noMatches.title': '没有匹配的会话',
      'empty.noMatches.body': '换个关键词试试。',
      'workspace.unknown': '其他',
      'untitled': '无标题会话',
      'meta.updated': '更新于 {time}',
      'meta.running': '运行中',
      'meta.archived': '已归档',
      'action.restore': '恢复',
      'action.archive': '归档',
      'action.stopAndArchive': '停止并归档',
      'action.working': '处理中…',
      'error.active': '该会话正在运行，暂时无法归档。',
      'error.archive': '无法归档该会话：{message}',
      'error.restore': '无法恢复该会话：{message}',
      'error.unknown': '未知错误',
      'action.delete': '删除',
      'delete.title': '永久删除这个会话？',
      'delete.body': '将删除「{title}」的本地会话日志、投影缓存，并清除归档、置顶与工作区归属。此操作不可恢复。工作区中的项目文件会保留。',
      'delete.descendants': '同时删除 {count} 个子代理会话的日志。',
      'delete.confirm': '永久删除',
      'delete.cancel': '取消',
      'delete.pending': '正在删除…',
      'delete.done': '已删除。连接的窗口会立即移除它；搜索索引会在下次搜索时自动同步。',
      'delete.deferred': '该会话仍加载在当前应用中，已加入待删除队列；重启 DSH 后会自动删除。',
      'delete.partial': '会话日志已删除，但部分登记信息未清理：{message}',
      'delete.failed': '删除失败：{message}',
      'delete.unavailable': '删除接口不可用：请重启 DSH 后再试。',
      'notice.dismiss': '关闭提示',
      'busy.loading': '正在加载会话…',
    };

    const en = {
      'panel': 'Session archive',
      'title': 'Session archive',
      'subtitle': 'Restore archived Sessions, or archive the ones you no longer need.',
      'tabs.archived': 'Archived',
      'tabs.active': 'Sessions',
      'tabs.archivedCount': 'Archived ({count})',
      'tabs.activeCount': 'Sessions ({count})',
      'search.placeholder': 'Search title, workspace, or Session ID',
      'search.label': 'Search Sessions',
      'search.clear': 'Clear search',
      'list.archivedLabel': 'Archived Sessions',
      'list.activeLabel': 'Sessions',
      'empty.archived.title': 'No archived Sessions',
      'empty.archived.body': 'Choose Archive in a Session\u2019s sidebar menu; it then appears here.',
      'empty.active.title': 'Every Session is archived',
      'empty.active.body': 'Restore one from the Archived tab to see it here.',
      'empty.noMatches.title': 'No matching Sessions',
      'empty.noMatches.body': 'Try a different search.',
      'workspace.unknown': 'Other',
      'untitled': 'Untitled Session',
      'meta.updated': 'Updated {time}',
      'meta.running': 'Running',
      'meta.archived': 'Archived',
      'action.restore': 'Restore',
      'action.archive': 'Archive',
      'action.stopAndArchive': 'Stop and archive',
      'action.working': 'Working\u2026',
      'error.active': 'This Session is running, so it cannot be archived yet.',
      'error.archive': 'Could not archive this Session: {message}',
      'error.restore': 'Could not restore this Session: {message}',
      'error.unknown': 'an unexpected error',
      'action.delete': 'Delete',
      'delete.title': 'Delete this Session permanently?',
      'delete.body': 'This removes the local Session logs and projection cache for \u201c{title}\u201d, and clears its archive, pin, and workspace ownership. It cannot be undone. Workspace project files are kept.',
      'delete.descendants': 'It also removes the logs of {count} subagent Sessions.',
      'delete.confirm': 'Delete permanently',
      'delete.cancel': 'Cancel',
      'delete.pending': 'Deleting\u2026',
      'delete.done': 'Deleted. Connected windows drop it immediately; the search index reconciles on the next search.',
      'delete.deferred': 'This Session is still loaded in this app run. It is queued and will be deleted automatically the next time DSH starts.',
      'delete.partial': 'The Session logs were deleted, but some registry entries could not be cleared: {message}',
      'delete.failed': 'Could not delete: {message}',
      'delete.unavailable': 'The delete endpoint is unavailable. Restart DSH and try again.',
      'notice.dismiss': 'Dismiss notice',
      'busy.loading': 'Loading Sessions\u2026',
    };

    const CSS = `
.sa-page { width: 100%; min-width: 0; height: 100%; min-height: 0; display: flex; overflow: hidden; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font-size: 14px; line-height: 1.6; }
.sa-scroll { flex: 1 1 auto; min-height: 0; overflow: auto; scrollbar-gutter: stable; }
.sa-content { box-sizing: border-box; max-width: 960px; margin: 0 auto; padding: 28px clamp(24px, 4vw, 48px) 48px; }
[data-platform=darwin] .sa-content { padding-top: calc(28px + var(--dsh-frame-top-clearance, 0px)); }
.sa-heading { margin: 0; font-size: 20px; font-weight: 500; line-height: 28px; }
.sa-subtitle { margin: 6px 0 24px; font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.sa-tabs { display: inline-flex; gap: 2px; padding: 2px; margin-bottom: 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 9px; background: var(--dsw-alias-bg-layer-1); }
.sa-tab { appearance: none; border: 0; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 13px; line-height: 20px; padding: 4px 12px; cursor: pointer; }
.sa-tab:hover { color: var(--dsw-alias-label-primary); }
.sa-tab[aria-pressed="true"] { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.sa-tab:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.sa-search { position: relative; display: flex; align-items: center; margin-bottom: 16px; }
.sa-search-icon { position: absolute; left: 10px; display: flex; color: var(--dsw-alias-label-secondary); pointer-events: none; }
.sa-input { box-sizing: border-box; width: 100%; height: 34px; padding: 0 34px 0 32px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; }
.sa-input::placeholder { color: var(--dsw-alias-label-secondary); }
.sa-input:focus { outline: none; border-color: var(--dsw-alias-brand-primary); }
.sa-search-clear { position: absolute; right: 6px; display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border: 0; border-radius: 6px; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; }
.sa-search-clear:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.sa-search-clear:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.sa-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.sa-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); }
.sa-row:hover { background: var(--dsw-alias-bg-layer-2); }
.sa-row-main { flex: 1 1 auto; min-width: 0; }
.sa-row-title { font-size: 14px; font-weight: 500; line-height: 20px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sa-row-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 3px; font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-secondary); }
.sa-sep { color: var(--dsw-alias-border-l2); }
.sa-badge { display: inline-flex; align-items: center; gap: 4px; padding: 0 6px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l1); font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-secondary); }
.sa-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--dsw-alias-state-success-primary); }
.sa-row-actions { display: flex; align-items: center; gap: 6px; flex: 0 0 auto; }
.sa-button { appearance: none; display: inline-flex; align-items: center; height: 28px; padding: 0 10px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 7px; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; line-height: 1; cursor: pointer; white-space: nowrap; }
.sa-button:hover:not(:disabled) { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); }
.sa-button:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.sa-button:disabled { opacity: 0.55; cursor: default; }
.sa-button[data-variant="warn"] { color: var(--dsw-alias-state-warn-primary); }
.sa-button[data-variant="danger"] { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l1)); }
.sa-button[data-variant="danger"]:hover:not(:disabled) { border-color: var(--dsw-alias-state-error-primary); background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, var(--dsw-alias-bg-base)); }
.sa-notice { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 16px; padding: 9px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); font-size: 13px; line-height: 18px; color: var(--dsw-alias-label-primary); }
.sa-notice-text { flex: 1 1 auto; min-width: 0; }
.sa-notice-close { flex: 0 0 auto; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; margin: -1px 0 0 0; border: 0; border-radius: 5px; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; }
.sa-notice-close:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.sa-notice-close:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.sa-modal-backdrop { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; background: color-mix(in srgb, var(--dsw-alias-bg-base) 72%, transparent); backdrop-filter: blur(2px); }
.sa-modal { box-sizing: border-box; width: 100%; max-width: 440px; padding: 20px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-overlay); box-shadow: 0 12px 40px color-mix(in srgb, var(--dsw-alias-label-primary) 22%, transparent); }
.sa-modal-title { margin: 0 0 8px; font-size: 16px; line-height: 24px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.sa-modal-body { margin: 0 0 8px; font-size: 13px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
.sa-modal-body:last-of-type { margin-bottom: 0; }
.sa-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }
.sa-error { margin-top: 6px; font-size: 12px; line-height: 16px; color: var(--dsw-alias-state-error-primary); }
.sa-empty { margin-top: 28px; padding: 40px 24px; border: 1px dashed var(--dsw-alias-border-l1); border-radius: 12px; text-align: center; }
.sa-empty h2 { margin: 0 0 6px; font-size: 15px; font-weight: 600; }
.sa-empty p { margin: 0; font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.sa-loading { margin-top: 24px; font-size: 13px; color: var(--dsw-alias-label-secondary); }
`;

    function ArchiveGlyph({ size }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': true,
          focusable: false,
          style: { display: 'block' },
        },
        h('path', {
          d: 'M8 2v4.6',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'm5.9 4.6 2.1 2.1 2.1-2.1',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
        h('rect', {
          x: 2.1,
          y: 8.4,
          width: 11.8,
          height: 2.9,
          rx: 1,
          fill: 'currentColor',
        }),
        h('path', {
          d: 'M3.1 11.3h9.8v1.5c0 .7-.6 1.3-1.3 1.3H4.4c-.7 0-1.3-.6-1.3-1.3v-1.5Z',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinejoin: 'round',
        }),
      );
    }

    function ArchiveMark(props) {
      return h(ArchiveGlyph, { size: props.size });
    }

    function SearchGlyph() {
      return h(
        'svg',
        { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('circle', {
          cx: 7,
          cy: 7,
          r: 4.2,
          stroke: 'currentColor',
          strokeWidth: 1.4,
        }),
        h('path', {
          d: 'm10.2 10.2 3 3',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
        }),
      );
    }

    function CloseGlyph() {
      return h(
        'svg',
        { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'm4 4 8 8M12 4l-8 8',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
        }),
      );
    }

    /** Re-render on locale switches; translations are read at call time. */
    function useLocaleRevision(ctx) {
      const [, force] = React.useState(0);
      React.useEffect(
        () => ctx.locale.subscribe(() => force((value) => value + 1)),
        [ctx],
      );
    }

    function withoutKey(record, key) {
      const next = Object.assign({}, record);
      delete next[key];
      return next;
    }

    function textOf(reason) {
      if (reason instanceof Error && reason.message) return reason.message;
      if (typeof reason === 'string' && reason !== '') return reason;
      return undefined;
    }

    /** Host refused because the Session still has running work. */
    function isActiveRefusal(reason) {
      return (
        reason instanceof Error &&
        reason.name === 'WorkspaceArchiveError' &&
        reason.rpcError !== undefined &&
        reason.rpcError.code === 'workspace/session-active'
      );
    }

    function relativeTime(ms, locale) {
      if (!Number.isFinite(ms) || ms <= 0) return '';
      const deltaSeconds = Math.round((ms - Date.now()) / 1000);
      const units = [
        ['year', 31536000],
        ['month', 2592000],
        ['week', 604800],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
        ['second', 1],
      ];
      for (const [unit, seconds] of units) {
        if (Math.abs(deltaSeconds) >= seconds || unit === 'second') {
          const value = Math.round(deltaSeconds / seconds);
          try {
            return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);
          } catch {
            break;
          }
        }
      }
      try {
        return new Date(ms).toLocaleString(locale);
      } catch {
        return new Date(ms).toISOString();
      }
    }

    function matches(text, query) {
      if (query === '') return true;
      return text.toLowerCase().indexOf(query) !== -1;
    }

    /** Count every subagent Session recorded under one root Session. */
    function countDescendants(byId, rootId) {
      let count = 0;
      const queue = [];
      for (const summary of Object.values(byId)) {
        if (summary.parentId === rootId) queue.push(summary.id);
      }
      while (queue.length > 0) {
        const id = queue.shift();
        count += 1;
        for (const summary of Object.values(byId)) {
          if (summary.parentId === id) queue.push(summary.id);
        }
      }
      return count;
    }

    function Page(props) {
      const useSessions = props.useSessions;
      const useWorkspaces = props.useWorkspaces;
      const t = props.t;
      const ctx = props.ctx;
      const dropSessions = props.dropSessions;
      useLocaleRevision(ctx);

      const sessions = useSessions((snapshot) => snapshot);
      const workspaceState = useWorkspaces((snapshot) => snapshot);

      const [tab, setTab] = React.useState('archived');
      const [search, setSearch] = React.useState('');
      const [pending, setPending] = React.useState({});
      const [failures, setFailures] = React.useState({});
      const [deletedIds, setDeletedIds] = React.useState(() => new Set());
      const [confirming, setConfirming] = React.useState(null);
      const [deletePending, setDeletePending] = React.useState(false);
      const [deleteError, setDeleteError] = React.useState(null);
      const [notice, setNotice] = React.useState(null);
      const cancelButtonRef = React.useRef(null);

      React.useEffect(() => {
        if (confirming !== null) cancelButtonRef.current?.focus();
      }, [confirming]);

      const archivedList = React.useMemo(() => {
        const collection = [];
        for (const sessionId of workspaceState.archivedSessionIds) {
          if (deletedIds.has(sessionId)) continue;
          const summary = sessions.byId[sessionId];
          if (summary === undefined) continue;
          if (summary.origin === 'subagent' || summary.parentId !== undefined) continue;
          collection.push({ id: sessionId, summary: summary, archived: true });
        }
        return collection;
      }, [deletedIds, sessions, workspaceState]);

      const activeList = React.useMemo(() => {
        const archived = new Set(workspaceState.archivedSessionIds);
        const collection = [];
        for (const sessionId of sessions.ids) {
          if (deletedIds.has(sessionId)) continue;
          const summary = sessions.byId[sessionId];
          if (summary === undefined) continue;
          if (summary.origin === 'subagent' || summary.parentId !== undefined) continue;
          if (archived.has(sessionId)) continue;
          collection.push({ id: sessionId, summary: summary, archived: false });
        }
        collection.sort(
          (left, right) => (right.summary.updatedAt || 0) - (left.summary.updatedAt || 0),
        );
        return collection;
      }, [deletedIds, sessions, workspaceState]);

      const workspaceOf = React.useMemo(() => {
        const map = new Map();
        for (const workspace of workspaceState.items) {
          for (const sessionId of workspace.sessionIds) map.set(sessionId, workspace);
        }
        return map;
      }, [workspaceState]);

      const query = search.trim().toLowerCase();
      const source = tab === 'archived' ? archivedList : activeList;
      const visible = React.useMemo(
        () =>
          source.filter((row) => {
            const workspace = workspaceOf.get(row.id);
            const text = [
              row.summary.displayTitle,
              row.summary.title,
              row.summary.cwd,
              workspace === undefined ? undefined : workspace.title,
              row.id,
            ]
              .filter((value) => typeof value === 'string')
              .join('\n');
            return matches(text, query);
          }),
        [query, source, workspaceOf],
      );

      const locale = ctx.locale.getLocale().active;
      const loading = sessions.ids.length === 0 && sessions.phase !== 'ready';

      const setRowPending = (sessionId, value) => {
        setPending((current) => {
          if (value === undefined) return withoutKey(current, sessionId);
          const next = Object.assign({}, current);
          next[sessionId] = value;
          return next;
        });
      };
      const setRowFailure = (sessionId, value) => {
        setFailures((current) => {
          if (value === undefined) return withoutKey(current, sessionId);
          const next = Object.assign({}, current);
          next[sessionId] = value;
          return next;
        });
      };

      const restore = async (sessionId) => {
        if (pending[sessionId] !== undefined) return;
        setRowPending(sessionId, 'restoring');
        setRowFailure(sessionId, undefined);
        try {
          await ctx.workspaces.unarchiveSession(sessionId);
        } catch (reason) {
          setRowFailure(sessionId, {
            active: false,
            message: t('error.restore', {
              message: textOf(reason) || t('error.unknown'),
            }),
          });
        } finally {
          setRowPending(sessionId, undefined);
        }
      };

      const archive = async (sessionId, stopActivity) => {
        if (pending[sessionId] !== undefined) return;
        setRowPending(sessionId, stopActivity === true ? 'stopping' : 'archiving');
        setRowFailure(sessionId, undefined);
        try {
          await ctx.workspaces.archiveSession(
            sessionId,
            stopActivity === true ? { stopActivity: true } : undefined,
          );
        } catch (reason) {
          if (isActiveRefusal(reason)) {
            setRowFailure(sessionId, { active: true, message: t('error.active') });
          } else {
            setRowFailure(sessionId, {
              active: false,
              message: t('error.archive', {
                message: textOf(reason) || t('error.unknown'),
              }),
            });
          }
        } finally {
          setRowPending(sessionId, undefined);
        }
      };

      const tabLabel = (value, count) =>
        value === 'archived'
          ? t('tabs.archivedCount', { count: count })
          : t('tabs.activeCount', { count: count });

      const openConfirm = (row) => {
        setDeleteError(null);
        setConfirming({
          id: row.id,
          title: row.summary.displayTitle || t('untitled'),
          descendants: countDescendants(sessions.byId, row.id),
        });
      };

      const closeConfirm = () => {
        if (deletePending) return;
        setConfirming(null);
        setDeleteError(null);
      };

      const performDelete = async () => {
        if (confirming === null || deletePending) return;
        const target = confirming;
        setDeletePending(true);
        setDeleteError(null);
        try {
          const response = await fetch(DELETE_ENDPOINT, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sessionId: target.id }),
          });
          let payload = null;
          try {
            payload = await response.json();
          } catch {
            payload = null;
          }
          if (!response.ok) {
            if (response.status === 404 || response.status === 405) {
              setDeleteError(t('delete.unavailable'));
            } else {
              const detail =
                payload !== null && typeof payload.error === 'string' && payload.error !== ''
                  ? payload.error
                  : t('error.unknown');
              setDeleteError(t('delete.failed', { message: detail }));
            }
            return;
          }
          setDeletedIds((current) => {
            const next = new Set(current);
            const ids =
              payload !== null && Array.isArray(payload.deletedSessionIds)
                ? payload.deletedSessionIds
                : [];
            for (const id of ids) {
              if (typeof id === 'string') next.add(id);
            }
            next.add(target.id);
            return next;
          });
          // The Host has removed the logs, but this browser's Session store still
          // holds the row until a list refresh. Drop it exactly the way the
          // shipped `api-session/removed` listener does, so the sidebar's
          // workspace groups and the ungrouped bucket update immediately.
          const removedIds =
            payload !== null && Array.isArray(payload.deletedSessionIds)
              ? payload.deletedSessionIds.filter((id) => typeof id === 'string')
              : [];
          dropSessions([...new Set([target.id, ...removedIds])]);
          setConfirming(null);
          const warnings =
            payload !== null && Array.isArray(payload.warnings) ? payload.warnings : [];
          const deferred = payload !== null && payload.deferred === true;
          setNotice(
            warnings.length > 0
              ? t('delete.partial', { message: String(warnings[0]) })
              : deferred
                ? t('delete.deferred')
                : t('delete.done'),
          );
        } catch (reason) {
          setDeleteError(t('delete.failed', { message: textOf(reason) || t('error.unknown') }));
        } finally {
          setDeletePending(false);
        }
      };

      const listLabel = tab === 'archived' ? t('list.archivedLabel') : t('list.activeLabel');

      let empty = null;
      if (visible.length === 0) {
        const searching = query !== '';
        const fallback =
          tab === 'archived'
            ? ['empty.archived.title', 'empty.archived.body']
            : ['empty.active.title', 'empty.active.body'];
        const keys = searching ? ['empty.noMatches.title', 'empty.noMatches.body'] : fallback;
        empty = h(
          'div',
          { className: 'sa-empty', role: 'status' },
          h('h2', null, t(keys[0])),
          h('p', null, t(keys[1])),
        );
      }

      return h(
        React.Fragment,
        null,
        h('style', null, CSS),
        h(
          'section',
          { className: 'sa-page', 'aria-label': t('title') },
          h(
            'div',
            { className: 'sa-scroll' },
            h(
              'div',
              { className: 'sa-content' },
              h('h1', { className: 'sa-heading', tabIndex: -1 }, t('title')),
              h('p', { className: 'sa-subtitle' }, t('subtitle')),
              notice !== null
                ? h(
                    'div',
                    { className: 'sa-notice', role: 'status' },
                    h('span', { className: 'sa-notice-text' }, notice),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'sa-notice-close',
                        'aria-label': t('notice.dismiss'),
                        onClick: () => setNotice(null),
                      },
                      h(CloseGlyph),
                    ),
                  )
                : null,
              h(
                'div',
                { className: 'sa-tabs', role: 'group', 'aria-label': t('title') },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'sa-tab',
                    'aria-pressed': tab === 'archived',
                    onClick: () => setTab('archived'),
                  },
                  tabLabel('archived', archivedList.length),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'sa-tab',
                    'aria-pressed': tab === 'active',
                    onClick: () => setTab('active'),
                  },
                  tabLabel('active', activeList.length),
                ),
              ),
              h(
                'div',
                { className: 'sa-search' },
                h('span', { className: 'sa-search-icon' }, h(SearchGlyph)),
                h('input', {
                  className: 'sa-input',
                  type: 'search',
                  value: search,
                  placeholder: t('search.placeholder'),
                  'aria-label': t('search.label'),
                  onChange: (event) => setSearch(event.target.value),
                }),
                search !== ''
                  ? h(
                      'button',
                      {
                        type: 'button',
                        className: 'sa-search-clear',
                        'aria-label': t('search.clear'),
                        onClick: () => setSearch(''),
                      },
                      h(CloseGlyph),
                    )
                  : null,
              ),
              loading ? h('div', { className: 'sa-loading', role: 'status' }, t('busy.loading')) : null,
              h(
                'ul',
                { className: 'sa-list', 'aria-label': listLabel },
                visible.map((row) => {
                  const summary = row.summary;
                  const workspace = workspaceOf.get(row.id);
                  const title = summary.displayTitle || t('untitled');
                  const workspaceTitle =
                    workspace === undefined ? t('workspace.unknown') : workspace.title;
                  const updated = relativeTime(summary.updatedAt, locale);
                  const rowPending = pending[row.id];
                  const failure = failures[row.id];
                  const busy = rowPending !== undefined;
                  const metaParts = [workspaceTitle];
                  if (updated !== '') metaParts.push(t('meta.updated', { time: updated }));
                  return h(
                    'li',
                    { key: row.id, className: 'sa-row' },
                    h(
                      'div',
                      { className: 'sa-row-main' },
                      h('div', { className: 'sa-row-title', title: title }, title),
                      h(
                        'div',
                        { className: 'sa-row-meta' },
                        metaParts.map((part, index) =>
                          h(
                            React.Fragment,
                            { key: index },
                            index > 0 ? h('span', { className: 'sa-sep' }, '\u00b7') : null,
                            h('span', null, part),
                          ),
                        ),
                        summary.running
                          ? h(
                              'span',
                              { className: 'sa-badge' },
                              h('span', { className: 'sa-badge-dot' }),
                              t('meta.running'),
                            )
                          : null,
                        row.archived
                          ? h('span', { className: 'sa-badge' }, t('meta.archived'))
                          : null,
                      ),
                      failure !== undefined
                        ? h('div', { className: 'sa-error', role: 'alert' }, failure.message)
                        : null,
                    ),
                    h(
                      'div',
                      { className: 'sa-row-actions' },
                      row.archived
                        ? h(
                            React.Fragment,
                            null,
                            h(
                              'button',
                              {
                                type: 'button',
                                className: 'sa-button',
                                disabled: busy,
                                onClick: () => restore(row.id),
                              },
                              busy && rowPending === 'restoring'
                                ? t('action.working')
                                : t('action.restore'),
                            ),
                            h(
                              'button',
                              {
                                type: 'button',
                                className: 'sa-button',
                                'data-variant': 'danger',
                                disabled: busy,
                                onClick: () => openConfirm(row),
                              },
                              t('action.delete'),
                            ),
                          )
                        : h(
                            'button',
                            {
                              type: 'button',
                              className: 'sa-button',
                              disabled: busy,
                              onClick: () => archive(row.id, false),
                            },
                            busy && rowPending !== 'stopping'
                              ? t('action.working')
                              : t('action.archive'),
                          ),
                      !row.archived && failure !== undefined && failure.active
                        ? h(
                            'button',
                            {
                              type: 'button',
                              className: 'sa-button',
                              'data-variant': 'warn',
                              disabled: busy,
                              onClick: () => archive(row.id, true),
                            },
                            busy && rowPending === 'stopping'
                              ? t('action.working')
                              : t('action.stopAndArchive'),
                          )
                        : null,
                    ),
                  );
                }),
              ),
              empty,
            ),
          ),
          confirming !== null
            ? h(
                'div',
                {
                  className: 'sa-modal-backdrop',
                  onMouseDown: (event) => {
                    if (event.target === event.currentTarget) closeConfirm();
                  },
                  onKeyDown: (event) => {
                    if (event.key !== 'Escape' || event.defaultPrevented) return;
                    event.preventDefault();
                    event.stopPropagation();
                    closeConfirm();
                  },
                },
                h(
                  'div',
                  {
                    className: 'sa-modal',
                    role: 'dialog',
                    'aria-modal': 'true',
                    'aria-labelledby': 'sa-delete-title',
                    'aria-describedby': 'sa-delete-body',
                  },
                  h(
                    'h2',
                    { id: 'sa-delete-title', className: 'sa-modal-title' },
                    t('delete.title'),
                  ),
                  h(
                    'p',
                    { id: 'sa-delete-body', className: 'sa-modal-body' },
                    t('delete.body', { title: confirming.title }),
                  ),
                  confirming.descendants > 0
                    ? h(
                        'p',
                        { className: 'sa-modal-body' },
                        t('delete.descendants', { count: confirming.descendants }),
                      )
                    : null,
                  deleteError !== null
                    ? h('div', { className: 'sa-error', role: 'alert' }, deleteError)
                    : null,
                  h(
                    'div',
                    { className: 'sa-modal-actions' },
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'sa-button',
                        ref: cancelButtonRef,
                        disabled: deletePending,
                        onClick: closeConfirm,
                      },
                      t('delete.cancel'),
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'sa-button',
                        'data-variant': 'danger',
                        disabled: deletePending,
                        onClick: () => performDelete(),
                      },
                      deletePending ? t('delete.pending') : t('delete.confirm'),
                    ),
                  ),
                ),
              )
            : null,
        ),
      );
    }

    return {
      inject: ['slots', 'locale', 'sessions', 'workspaces'],
      apply(ctx) {
        ctx.effect(
          () => ctx.locale.register(NS, { zh: zh, en: en }),
          'session-archive: dictionaries',
        );
        const t = ctx.locale.bind(NS);
        /**
         * Remove deleted Sessions from the browser's Session catalog immediately.
         * This is the same reduction the shipped `api-session/removed` handler
         * performs; it keeps the sidebar's workspace groups and its ungrouped
         * bucket consistent without a page reload.
         */
        const dropSessions = (ids) => {
          const service = ctx.get('sessions');
          if (service === undefined || typeof service.handleSessionRemoved !== 'function') return;
          for (const id of ids) {
            if (typeof id !== 'string' || id === '') continue;
            try {
              service.handleSessionRemoved(id);
            } catch (error) {
              console.warn('session-archive: could not drop a deleted Session from the catalog', error);
            }
          }
        };
        const pageProps = () => ({ ctx: ctx, t: t, dropSessions: dropSessions });

        ctx.slots.inject('main', () =>
          ctx.slots.register(
            { name: 'main', key: PANEL_ID, locale: NS, inject: pageProps },
            Page,
          ),
        );
        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: PANEL_ID,
              order: 20,
              locale: NS,
              label: () => t('panel'),
            },
            ArchiveMark,
          ),
        );
      },
    };
  },
});
