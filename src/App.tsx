import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { AgentId, CatalogEntry, ProjectView, RecentProject } from './shared/types.ts';
import { api } from './api.ts';
import { Header } from './components/Header.tsx';
import { ConnectScreen } from './components/ConnectScreen.tsx';
import { AgentNote } from './components/AgentNote.tsx';
import { ConsoleBank } from './components/ConsoleBank.tsx';
import { DetailsPanel } from './components/DetailsPanel.tsx';
import { OnlinePanel } from './components/OnlinePanel.tsx';
import { OnlineResults, type CatalogState } from './components/OnlineResults.tsx';
import { SearchBar, type SearchFilter } from './components/SearchBar.tsx';
import { plural } from './labels.ts';
import { matches } from './search.ts';

type Target = { path: string } | { sample: true };
type Screen = 'loading' | 'connect' | 'project';

export function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [view, setView] = useState<ProjectView | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [recent, setRecent] = useState<RecentProject[]>([]);
  const [busy, setBusy] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [catalog, setCatalog] = useState<CatalogState>({ status: 'idle' });
  const [selectedOnline, setSelectedOnline] = useState<CatalogEntry | null>(null);

  const searching = query.trim() !== '' || filter !== 'all';
  const wantsOnline = searching && (filter === 'all' || filter === 'online');

  const loadCatalog = useCallback((refresh = false) => {
    setCatalog({ status: 'loading' });
    api
      .catalog(refresh)
      .then((list) => setCatalog({ status: 'ready', list }))
      .catch((error: unknown) =>
        setCatalog({ status: 'error', message: error instanceof Error ? error.message : String(error) }),
      );
  }, []);

  // The online list is only fetched once someone searches, not on every page load.
  useEffect(() => {
    if (wantsOnline && catalog.status === 'idle') loadCatalog();
  }, [wantsOnline, catalog.status, loadCatalog]);

  const refreshRecent = useCallback(() => {
    api
      .start()
      .then((info) => setRecent(info.recent))
      .catch(() => {});
  }, []);

  const connect = useCallback(
    async (next: Target, agent?: AgentId, options: { fromStart?: boolean } = {}) => {
      setBusy(true);
      setConnectError(null);
      try {
        const result = await api.connect(next, agent);
        setView(result);
        setTarget(next);
        setScreen('project');
        setNotice(null);
        setSelectedId((current) =>
          result.spaces.some((space) => space.skills.some((skill) => skill.id === current)) ? current : null,
        );
        if ('path' in next) refreshRecent();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (options.fromStart) {
          setNotice(`Couldn't open your last project. ${message}`);
          setScreen('connect');
        } else if (screen === 'project' && view) {
          setNotice(message);
        } else {
          setConnectError(message);
        }
      } finally {
        setBusy(false);
      }
    },
    [refreshRecent, screen, view],
  );

  useEffect(() => {
    let cancelled = false;
    api
      .start()
      .then((info) => {
        if (cancelled) return;
        setRecent(info.recent);
        if (info.lastProject) void connect({ path: info.lastProject }, undefined, { fromStart: true });
        else setScreen('connect');
      })
      .catch(() => {
        if (!cancelled) setScreen('connect');
      });
    return () => {
      cancelled = true;
    };
    // Runs once when the page opens.
  }, []);

  if (screen === 'loading') {
    return (
      <main className="message-screen" aria-busy="true">
        <p>Opening Skill Studio…</p>
      </main>
    );
  }

  if (screen === 'connect' || !view) {
    return (
      <div className="app">
        <Header view={null} busy={busy} onSwitch={() => {}} onSample={() => {}} onOther={() => {}} />
        <div className="scroll">
          {notice && <p className="notice">{notice}</p>}
          <ConnectScreen
            recent={recent}
            busy={busy}
            error={connectError}
            onConnect={(path) => void connect({ path })}
            onSample={() => void connect({ sample: true })}
            onForget={(path) => {
              setRecent((list) => list.filter((entry) => entry.path !== path));
              void api.forget(path);
            }}
            onCancel={view ? () => setScreen('project') : undefined}
          />
        </div>
      </div>
    );
  }

  const agentLabel = view.agents.detected.find((agent) => agent.id === view.agents.selected)?.label ?? null;
  const all = view.spaces.flatMap((space) => space.skills);
  const loaded = all.filter((skill) => skill.loaded);
  const projectCount = loaded.filter((skill) => skill.place === 'project').length;
  const personalCount = loaded.filter((skill) => skill.place === 'personal').length;
  const duplicates = new Set(loaded.filter((skill) => skill.alsoIn.length > 0).map((skill) => skill.name)).size;
  const notLoaded = all.length - loaded.length;
  const selected = all.find((skill) => skill.id === selectedId) ?? null;
  const projectSpace = view.spaces.find((space) => space.place === 'project');
  const destinationFolder =
    projectSpace?.folders.find((folder) => view.agents.selected && folder.readBy.includes(view.agents.selected))
      ?.folder ?? '.github/skills';
  const projectNames = new Set(
    projectSpace?.skills.filter((skill) => skill.folder === destinationFolder).map((skill) => skill.name),
  );
  const loadedNames = new Set(loaded.map((skill) => skill.name));
  const localSpaces = view.spaces
    .filter((space) => filter === 'all' || filter === space.place)
    .map((space) => ({
      ...space,
      skills: space.skills.filter((skill) => matches(query, skill.name, skill.description, skill.job?.label ?? '')),
    }));

  const breakdown = [
    `${projectCount} in this project`,
    `${personalCount} from your personal folder`,
    ...(duplicates > 0 ? [plural(duplicates, 'duplicate')] : []),
  ];

  return (
    <div className="app">
      <Header
        view={view}
        busy={busy}
        onSwitch={(path) => void connect({ path })}
        onSample={() => void connect({ sample: true })}
        onOther={() => {
          setConnectError(null);
          setScreen('connect');
        }}
      />
      <div className="workspace">
        <main className="console" aria-labelledby="console-title" aria-busy={busy}>
          {notice && (
            <p className="notice" role="alert">
              {notice}
            </p>
          )}
          <div className="console-intro">
            <h1 id="console-title">
              {plural(loaded.length, 'skill')} {loaded.length === 1 ? 'is' : 'are'} loaded for {view.project.name}
            </h1>
            <div className="console-actions">
              <p className="console-breakdown">{breakdown.join(', ')}.</p>
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={() => target && void connect(target)}
                disabled={busy}
              >
                <RefreshCw size={16} aria-hidden="true" />
                {busy ? 'Checking…' : 'Check again'}
              </button>
            </div>
            {notLoaded > 0 && agentLabel && (
              <p className="console-breakdown">
                {plural(notLoaded, 'more skill')} {notLoaded === 1 ? 'was' : 'were'} found that {agentLabel} doesn't
                load.
              </p>
            )}
            <AgentNote agents={view.agents} busy={busy} onChoose={(agent) => target && void connect(target, agent)} />
          </div>
          <SearchBar query={query} filter={filter} onQuery={setQuery} onFilter={setFilter} />
          {searching && filter !== 'online' && localSpaces.every((space) => space.skills.length === 0) && (
            <p className="search-empty">
              {query.trim() ? `None of your loaded skills match “${query.trim()}”.` : 'No loaded skills here.'}
            </p>
          )}
          {(searching ? localSpaces.filter((space) => space.skills.length > 0) : view.spaces).map((space) => (
            <ConsoleBank
              key={space.place}
              space={space}
              jobs={view.jobs}
              agentLabel={agentLabel}
              selectedId={selectedOnline ? null : selectedId}
              onSelect={(skill) => {
                setSelectedOnline(null);
                setSelectedId(skill.id);
              }}
            />
          ))}
          {wantsOnline && (
            <OnlineResults
              catalog={catalog}
              query={query}
              loadedNames={loadedNames}
              selectedId={selectedOnline?.id ?? null}
              onSelect={(entry) => setSelectedOnline(entry)}
              onRefresh={() => loadCatalog(true)}
            />
          )}
        </main>
        {selectedOnline ? (
          <OnlinePanel
            entry={selectedOnline}
            project={view.project}
            agentId={view.agents.selected}
            destinationFolder={destinationFolder}
            projectNames={projectNames}
            onClose={() => setSelectedOnline(null)}
            onDownloaded={() => target && void connect(target)}
          />
        ) : (
          <DetailsPanel skill={selected} jobs={view.jobs} agentLabel={agentLabel} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  );
}
