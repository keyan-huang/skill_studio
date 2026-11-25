import { useEffect, useId, useState, type FormEvent } from 'react';
import { Download, ExternalLink, Terminal, X } from 'lucide-react';
import type { CatalogEntry, CatalogPreview, DownloadResult, ProjectView } from '../shared/types.ts';
import { ApiProblem, api } from '../api.ts';
import { SOURCE_LABEL, plural } from '../labels.ts';

interface Props {
  entry: CatalogEntry;
  project: ProjectView['project'];
  agentId: string | null;
  /** The project skill folder the agent reads, e.g. ".github/skills". */
  destinationFolder: string;
  /** Names of skills already in this project's skill folder. */
  projectNames: Set<string>;
  onClose: () => void;
  onDownloaded: (result: DownloadResult) => void;
}

type Preview = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: CatalogPreview };

/** Preview of an online skill, with a safe download into the connected project. */
export function OnlinePanel({ entry, project, agentId, destinationFolder, projectNames, onClose, onDownloaded }: Props) {
  const [preview, setPreview] = useState<Preview>({ status: 'loading' });
  const [showRaw, setShowRaw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [newName, setNewName] = useState<string | null>(null);
  const [done, setDone] = useState<DownloadResult | null>(null);
  const nameId = useId();
  const nameHintId = useId();

  useEffect(() => {
    let cancelled = false;
    setPreview({ status: 'loading' });
    setShowRaw(false);
    setProblem(null);
    setDone(null);
    setNewName(projectNames.has(entry.name) ? suggestName(entry.name, projectNames) : null);
    api
      .preview(entry.id)
      .then((data) => !cancelled && setPreview({ status: 'ready', data }))
      .catch((error: unknown) => !cancelled && setPreview({ status: 'error', message: messageOf(error) }));
    return () => {
      cancelled = true;
    };
    // Only reload when a different skill is picked.
  }, [entry.id]);

  async function download(event?: FormEvent) {
    event?.preventDefault();
    setSaving(true);
    setProblem(null);
    try {
      const result = await api.download({
        id: entry.id,
        projectPath: project.path,
        agent: agentId,
        ...(newName ? { newName } : {}),
      });
      setDone(result);
      onDownloaded(result);
    } catch (error) {
      if (error instanceof ApiProblem && error.status === 409 && error.suggestion) {
        setNewName(error.suggestion);
      }
      setProblem(messageOf(error));
    } finally {
      setSaving(false);
    }
  }

  const finalName = newName ?? entry.name;
  const destination = `${project.location}/${destinationFolder}/${finalName}`;

  return (
    <div className="panel">
      <div className="panel-top">
        <h2 id="online-title" className="tape tape-panel">
          {entry.name}
        </h2>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close preview">
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <p className="panel-kicker">Online skill, not downloaded yet</p>

      <p className="panel-description">{entry.description || 'No description.'}</p>

      <dl className="facts">
        <div>
          <dt>From</dt>
          <dd>
            <a href={entry.url} target="_blank" rel="noreferrer" className="link">
              {entry.catalogLabel} on GitHub
              <ExternalLink size={14} aria-hidden="true" />
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </dd>
        </div>
        <div>
          <dt>Made by</dt>
          <dd>{SOURCE_LABEL[entry.source]}</dd>
        </div>
        <div>
          <dt>License</dt>
          <dd>{preview.status === 'ready' ? preview.data.license : 'Checking…'}</dd>
        </div>
      </dl>

      {preview.status === 'error' && <p className="panel-problem">{preview.message}</p>}

      {preview.status === 'ready' && (
        <>
          {preview.data.scripts.length > 0 && (
            <div className="caution">
              <Terminal size={18} aria-hidden="true" />
              <p>
                Includes {plural(preview.data.scripts.length, 'script')} that the AI agent can run on your computer.
                Only download skills you trust.
              </p>
            </div>
          )}
        </>
      )}

      <section className="download" aria-labelledby="download-title">
        <h3 id="download-title" className="panel-subheading">
          Download to {project.name}
        </h3>

        {project.isSample ? (
          <p className="field-hint">Connect your own project to download skills into it.</p>
        ) : done ? (
          <p className="success" role="status">
            Downloaded to <span className="path">{done.location}</span>. Start a new chat in VS Code to use it.
          </p>
        ) : (
          <form onSubmit={download}>
            {newName !== null && (
              <>
                <p className="field-hint">
                  This project already has a skill called {entry.name}. Nothing will be replaced. Save this one under a
                  new name:
                </p>
                <label htmlFor={nameId} className="field-label">
                  New name
                </label>
                <p id={nameHintId} className="field-hint">
                  Lowercase letters, numbers, and hyphens.
                </p>
                <input
                  id={nameId}
                  className="field field-wide path"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value.trim())}
                  aria-describedby={nameHintId}
                  autoComplete="off"
                  spellCheck={false}
                />
              </>
            )}
            <p className="field-hint">
              Saves to <span className="path">{destination}</span>
            </p>
            {problem && (
              <p className="field-error" role="alert">
                {problem}
              </p>
            )}
            <button type="submit" className="button" disabled={saving || preview.status !== 'ready' || newName === ''}>
              <Download size={18} aria-hidden="true" />
              {saving ? 'Downloading…' : newName ? `Download as ${finalName}` : 'Download'}
            </button>
          </form>
        )}
      </section>

      {preview.status === 'ready' && (
        <>
          <h3 className="panel-subheading">Files included ({preview.data.files.length})</h3>
          <ul className="file-list">
            {preview.data.files.slice(0, 12).map((file) => (
              <li key={file.path} className="path">
                {file.path}
              </li>
            ))}
            {preview.data.files.length > 12 && <li>and {preview.data.files.length - 12} more</li>}
          </ul>
          <button
            type="button"
            className="button button-quiet"
            aria-expanded={showRaw}
            aria-controls="online-raw"
            onClick={() => setShowRaw((value) => !value)}
          >
            {showRaw ? 'Hide details' : 'Show details'}
          </button>
          {showRaw && (
            <pre id="online-raw" className="raw" tabIndex={0} aria-label={`Full instructions for ${entry.name}`}>
              {preview.data.raw}
            </pre>
          )}
        </>
      )}

    </div>
  );
}

function suggestName(name: string, taken: Set<string>): string {
  let counter = 2;
  while (taken.has(`${name}-${counter}`)) counter += 1;
  return `${name}-${counter}`;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
