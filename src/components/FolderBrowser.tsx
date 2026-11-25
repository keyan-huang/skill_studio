import { useEffect, useState } from 'react';
import { ArrowUp, Folder, FolderGit2 } from 'lucide-react';
import type { FolderListing } from '../shared/types.ts';
import { api } from '../api.ts';

interface Props {
  onConnect: (path: string) => void;
  busy: boolean;
}

/** An in-app folder browser. Shows folders only, never file contents. */
export function FolderBrowser({ onConnect, busy }: Props) {
  const [listing, setListing] = useState<FolderListing | null>(null);
  const [target, setTarget] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    api
      .folders(target)
      .then((result) => {
        if (!cancelled) setListing(result);
      })
      .catch((problem: unknown) => {
        if (!cancelled) setError(problem instanceof Error ? problem.message : String(problem));
      });
    return () => {
      cancelled = true;
    };
  }, [target]);

  return (
    <div className="browser">
      <div className="browser-bar">
        <button
          type="button"
          className="icon-button"
          onClick={() => listing?.parent && setTarget(listing.parent)}
          disabled={!listing?.parent}
          aria-label="Go up one folder"
        >
          <ArrowUp size={20} aria-hidden="true" />
        </button>
        <p className="browser-location path" aria-live="polite">
          {listing?.location ?? 'Opening…'}
        </p>
        <button
          type="button"
          className="button"
          disabled={!listing || busy}
          onClick={() => listing && onConnect(listing.path)}
        >
          Connect this folder
        </button>
      </div>

      {error && <p className="field-error">{error}</p>}

      {listing && (
        <ul className="browser-list" aria-label={`Folders in ${listing.location}`}>
          {listing.folders.length === 0 && <li className="browser-empty">No folders inside this one.</li>}
          {listing.folders.map((folder) => (
            <li key={folder.path} className="browser-row">
              <button type="button" className="browser-open" onClick={() => setTarget(folder.path)}>
                {folder.looksLikeProject ? (
                  <FolderGit2 size={18} aria-hidden="true" />
                ) : (
                  <Folder size={18} aria-hidden="true" />
                )}
                <span>{folder.name}</span>
                {folder.looksLikeProject && <span className="tag">Project</span>}
              </button>
              {folder.looksLikeProject && (
                <button
                  type="button"
                  className="button button-quiet button-small"
                  disabled={busy}
                  onClick={() => onConnect(folder.path)}
                  aria-label={`Connect ${folder.name}`}
                >
                  Connect
                </button>
              )}
            </li>
          ))}
          {listing.truncated && <li className="browser-empty">Some folders aren't shown. Paste the location instead.</li>}
        </ul>
      )}
    </div>
  );
}
