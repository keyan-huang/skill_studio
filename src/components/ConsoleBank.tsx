import type { Job, Skill, Space } from '../shared/types.ts';
import { PLACE_LABEL, PLACE_NOTE, plural } from '../labels.ts';
import { ChannelStrip } from './ChannelStrip.tsx';

interface Props {
  space: Space;
  jobs: Job[];
  selectedId: string | null;
  onSelect: (skill: Skill) => void;
}

export function ConsoleBank({ space, jobs, selectedId, onSelect }: Props) {
  const titleId = `bank-${space.place}`;
  return (
    <section className="bank" aria-labelledby={titleId}>
      <div className="bank-heading">
        <h2 id={titleId}>{PLACE_LABEL[space.place]}</h2>
        <p className="bank-note">
          {plural(space.skills.length, 'skill')}. {PLACE_NOTE[space.place]}
        </p>
      </div>
      {space.skills.length === 0 ? (
        <p className="bank-empty">No skills here yet.</p>
      ) : (
        <ul className="strips">
          {space.skills.map((skill, index) => (
            <li key={skill.id}>
              <ChannelStrip
                skill={skill}
                jobs={jobs}
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
