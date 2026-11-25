import { useId, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { RecentProject } from '../shared/types.ts';
import { FolderBrowser } from './FolderBrowser.tsx';

interface Props {
  recent: RecentProject[];
  busy: boolean;
  error: string | null;
  onConnect: (path: string) => void;
  onSample: () => void;
  onForget: (path: string) => void;
  /** Present when a project is already open, so the user can go back to it. */
  onCancel?: (() => void) | undefined;
}

export function ConnectScreen({ recent, busy, error, onConnect, onSample, onForget, onCancel }: Props) {
  const [typed, setTyped] = useState('');
  const fieldId = useId();
  const hintId = useId();
  const errorId = useId();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (typed.trim()) onConnect(typed.trim());
  }

  return (
    <main className="connect" aria-labelledby="connect-title" aria-busy={busy}>
      <div className="connect-intro">
        <h1 id="connect-title">Connect a project</h1>
        <p>
          Pick the folder you open in VS Code. Skill Studio shows every skill loaded there, including the ones from
          your personal skills folder, and which AI agent the project uses. It only reads; nothing is changed.
        </p>
        {onCancel && (
          <button type="button" className="button button-quiet" onClick={onCancel}>
            Back to the current project
          </button>
        )}
      </div>

      {recent.length > 0 && (
        <section className="connect-section" aria-labelledby="recent-title">
          <h2 id="recent-title">Recent projects</h2>
          <ul className="recent-list">
            {recent.map((project) => (
              <li key={project.path} className="recent-row">
                <button
                  type="button"
                  className="recent-open"
                  disabled={busy}
                  onClick={() => onConnect(project.path)}
                >
                  <span className="recent-name">{project.name}</span>
                  <span className="path">{project.location}</span>
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onForget(project.path)}
                  aria-label={`Remove ${project.name} from recent projects`}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="connect-section" aria-labelledby="paste-title">
        <h2 id="paste-title">Paste a folder location</h2>
        <form className="paste-form" onSubmit={submit}>
          <label htmlFor={fieldId} className="field-label">
            Project folder
          </label>
          <p id={hintId} className="field-hint">
            In VS Code, right-click the folder and choose Copy Path. For example ~/Documents/Projects/my-app
          </p>
          <div className="paste-row">
            <input
              id={fieldId}
              className="field"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              aria-describedby={error ? `${hintId} ${errorId}` : hintId}
              aria-invalid={error ? true : undefined}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="button" disabled={busy || !typed.trim()}>
              {busy ? 'Connecting…' : 'Connect'}
            </button>
          </div>
          {error && (
            <p id={errorId} className="field-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </section>

      <section className="connect-section" aria-labelledby="browse-title">
        <h2 id="browse-title">Or browse your folders</h2>
        <FolderBrowser onConnect={onConnect} busy={busy} />
      </section>

      <section className="connect-section connect-sample" aria-labelledby="sample-title">
        <h2 id="sample-title">Just looking?</h2>
        <p>Explore made-up sample skills, with a planted duplicate, overlaps, and a clash.</p>
        <button type="button" className="button button-quiet" onClick={onSample} disabled={busy}>
          Explore sample skills
        </button>
      </section>
    </main>
  );
}
