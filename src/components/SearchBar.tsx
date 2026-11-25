import { useId } from 'react';
import { Search } from 'lucide-react';

export type SearchFilter = 'all' | 'project' | 'personal' | 'online';

const FILTERS: { id: SearchFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'project', label: 'This project' },
  { id: 'personal', label: 'Your personal folder' },
  { id: 'online', label: 'Online' },
];

interface Props {
  query: string;
  filter: SearchFilter;
  onQuery: (query: string) => void;
  onFilter: (filter: SearchFilter) => void;
}

export function SearchBar({ query, filter, onQuery, onFilter }: Props) {
  const inputId = useId();
  const groupName = useId();
  return (
    <div className="search" role="search">
      <label htmlFor={inputId} className="field-label">
        Search skills
      </label>
      <div className="search-field">
        <Search size={18} aria-hidden="true" />
        <input
          id={inputId}
          type="search"
          className="field"
          value={query}
          placeholder="For example: slides, pdf, testing"
          onChange={(event) => onQuery(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <fieldset className="filters">
        <legend className="visually-hidden">Where to search</legend>
        {FILTERS.map((option) => (
          <label key={option.id} className="filter">
            <input
              type="radio"
              name={groupName}
              value={option.id}
              checked={filter === option.id}
              onChange={() => onFilter(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
