import { useEffect, useState } from 'react';
import type { ProjectView, Skill } from './shared/types.ts';
import { Header } from './components/Header.tsx';
import { ConsoleBank } from './components/ConsoleBank.tsx';
import { DetailsPanel } from './components/DetailsPanel.tsx';
import { plural } from './labels.ts';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; view: ProjectView };

export function App() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<Skill | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/project', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Status ${response.status}`);
        setState({ status: 'ready', view: (await response.json()) as ProjectView });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setState({ status: 'error', message: "Skill Studio couldn't read the skills. Check that it's still running, then try again." });
      });
    return () => controller.abort();
  }, [attempt]);

  if (state.status === 'loading') {
    return (
      <main className="message-screen" aria-busy="true">
        <p>Reading skills…</p>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main className="message-screen">
        <h1>Couldn't load skills</h1>
        <p>{state.message}</p>
        <button
          type="button"
          className="button"
          onClick={() => {
            setState({ status: 'loading' });
            setAttempt((n) => n + 1);
          }}
        >
          Try again
        </button>
      </main>
    );
  }

  const { view } = state;
  const total = view.spaces.reduce((sum, space) => sum + space.skills.length, 0);
  const counts = view.spaces
    .filter((space) => space.skills.length > 0)
    .map((space) =>
      space.place === 'project'
        ? `${space.skills.length} in this project`
        : `${space.skills.length} from your personal folder`,
    );

  return (
    <div className="app">
      <Header project={view.project} />
      <div className="workspace">
        <main className="console" aria-labelledby="console-title">
          <div className="console-intro">
            <h1 id="console-title">
              {plural(total, 'skill')} {total === 1 ? 'is' : 'are'} loaded for {view.project.name}
            </h1>
            {counts.length > 0 && <p className="console-breakdown">{counts.join(', ')}.</p>}
          </div>
          {view.spaces.map((space) => (
            <ConsoleBank
              key={space.place}
              space={space}
              jobs={view.jobs}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
            />
          ))}
        </main>
        <DetailsPanel skill={selected} jobs={view.jobs} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
}
