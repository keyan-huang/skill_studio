import type { Job, Skill, Space } from '../shared/types.ts';
import { PLACE_LABEL, PLACE_NOTE, plural } from '../labels.ts';
import { ChannelStrip } from './ChannelStrip.tsx';

interface Props {
  space: Space;
  jobs: Job[];
  agentLabel: string | null;
  selectedId: string | null;
  onSelect: (skill: Skill) => void;
}

export function ConsoleBank({ space, jobs, agentLabel, selectedId, onSelect }: Props) {
  const titleId = `bank-${space.place}`;
  const loaded = space.skills.filter((skill) => skill.loaded);
  const notLoaded = space.skills.filter((skill) => !skill.loaded);
  const found = space.folders.filter((folder) => folder.exists).map((folder) => folder.display);
  const looked = space.folders.map((folder) => folder.folder);

  return (
    <section className="bank" aria-labelledby={titleId}>
      <div className="bank-heading">
        <h2 id={titleId}>{PLACE_LABEL[space.place]}</h2>
        <p className="bank-note">
          {plural(loaded.length, 'skill')}. {PLACE_NOTE[space.place]}
        </p>
      </div>
      {found.length > 0 && (
        <p className="bank-folders">
          From <span className="path">{found.join(', ')}</span>
        </p>
      )}

      {space.skills.length === 0 ? (
        <p className="bank-empty">
          {space.place === 'project'
            ? `This project doesn't have its own skills yet. Skill Studio looked in ${listWords(looked)}.`
            : `No personal skills yet. Skill Studio looked in ${listWords(looked.map((folder) => `~/${folder}`))}.`}
        </p>
      ) : (
        <ul className="strips">
          {[...loaded, ...notLoaded].map((skill, index) => (
            <li key={skill.id}>
              <ChannelStrip
                skill={skill}
                jobs={jobs}
                agentLabel={agentLabel}
                tilt={index % 3}
                selected={skill.id === selectedId}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function listWords(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}
