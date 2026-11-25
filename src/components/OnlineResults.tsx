import { Copy, RefreshCw, Terminal } from 'lucide-react';
import type { CatalogEntry, CatalogList } from '../shared/types.ts';
import { byRelevance, matches } from '../search.ts';
import { plural } from '../labels.ts';

const SHOWN = 60;

export type CatalogState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; list: CatalogList };

interface Props {
  catalog: CatalogState;
  query: string;
  loadedNames: Set<string>;
  selectedId: string | null;
  onSelect: (entry: CatalogEntry) => void;
  onRefresh: () => void;
}

/** Skills from public catalogs, shown as a list because they aren't on the desk yet. */
export function OnlineResults({ catalog, query, loadedNames, selectedId, onSelect, onRefresh }: Props) {
  return (
    <section className="bank" aria-labelledby="bank-online">
      <div className="bank-heading">
        <h2 id="bank-online">Online</h2>
        <p className="bank-note">Public skills you can preview and download. Not loaded yet.</p>
      </div>
      <Body
        catalog={catalog}
        query={query}
        loadedNames={loadedNames}
        selectedId={selectedId}
        onSelect={onSelect}
        onRefresh={onRefresh}
      />
    </section>
  );
}

function Body({ catalog, query, loadedNames, selectedId, onSelect, onRefresh }: Props) {
  if (catalog.status === 'idle' || catalog.status === 'loading') {
    return (
      <p className="bank-empty" aria-live="polite">
        Loading online skills from GitHub…
      </p>
    );
  }
  if (catalog.status === 'error') {
    return (
      <div className="bank-empty">
        <p>{catalog.message}</p>
        <button type="button" className="button button-quiet button-small" onClick={onRefresh}>
          Try again
        </button>
      </div>
    );
  }

  const { list } = catalog;
  const results = byRelevance(
    query,
    list.entries.filter((entry) => matches(query, entry.name, entry.description, entry.catalogLabel)),
  );
  const updated = new Date(list.fetchedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <>
      <div className="online-meta">
        <p aria-live="polite">
          {query.trim()
            ? `${plural(results.length, 'match', 'matches')} out of ${list.entries.length}.`
            : `${list.entries.length} skills from Awesome Copilot and Anthropic. Type to narrow them down.`}
          {list.stale && ' Showing a saved list because GitHub couldn’t be reached.'}
        </p>
        <button type="button" className="button button-quiet button-small" onClick={onRefresh}>
          <RefreshCw size={16} aria-hidden="true" />
          Refresh list
        </button>
      </div>
      <p className="online-updated">List updated {updated}.</p>
      {results.length === 0 ? (
        <p className="bank-empty">No online skills match. Try a shorter or different word.</p>
      ) : (
        <ul className="crate">
          {results.slice(0, SHOWN).map((entry, index) => (
            <li key={entry.id}>
              <button
                type="button"
                className="crate-row"
                aria-pressed={entry.id === selectedId}
                aria-label={[
                  entry.name,
                  entry.catalogLabel,
                  entry.hasScripts ? 'Includes scripts' : null,
                  loadedNames.has(entry.name) ? 'You already have a skill with this name' : null,
                ]
                  .filter(Boolean)
                  .join('. ')}
                aria-describedby={`${entry.id}-description`}
                onClick={() => onSelect(entry)}
              >
                <span className={`tape tape-tilt-${index % 3}`}>{entry.name}</span>
                <span className="crate-description" id={`${entry.id}-description`}>
                  {entry.description || 'No description.'}
                </span>
                <span className="crate-meta">
                  <span>{entry.catalogLabel}</span>
                  {entry.hasScripts && (
                    <span className="flag">
                      <Terminal size={16} aria-hidden="true" />
                      Includes scripts
                    </span>
                  )}
                  {loadedNames.has(entry.name) && (
                    <span className="flag flag-duplicate">
                      <Copy size={16} aria-hidden="true" />
                      You already have a skill with this name
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {results.length > SHOWN && (
        <p className="online-updated">Showing the first {SHOWN}. Type more to narrow it down.</p>
      )}
    </>
  );
}
