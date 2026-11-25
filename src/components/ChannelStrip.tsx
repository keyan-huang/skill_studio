import type { CSSProperties } from 'react';
import { Copy, EyeOff, TriangleAlert } from 'lucide-react';
import type { Job, Skill } from '../shared/types.ts';
import { duplicateText, jobColor, SOURCE_LABEL } from '../labels.ts';

interface Props {
  skill: Skill;
  jobs: Job[];
  agentLabel: string | null;
  /** Varies the angle of the tape label so strips look hand-labeled. */
  tilt: number;
  selected: boolean;
  onSelect: (skill: Skill) => void;
}

export function ChannelStrip({ skill, jobs, agentLabel, tilt, selected, onSelect }: Props) {
  const style = { '--channel': jobColor(skill.job, jobs) } as CSSProperties;
  const descriptionId = `${skill.id}-description`;
  const notLoaded = !skill.loaded && agentLabel ? `Not loaded by ${agentLabel}` : null;
  const duplicate = skill.alsoIn.length > 0 ? duplicateText(skill.alsoIn) : null;
  const source = skill.source === 'unknown' ? null : SOURCE_LABEL[skill.source];
  const label = [skill.name, skill.job?.label, source, notLoaded, duplicate, skill.problem ? 'Needs a fix' : null]
    .filter(Boolean)
    .join('. ');

  return (
    <button
      type="button"
      className={`strip${skill.loaded ? '' : ' strip-off'}`}
      style={style}
      aria-pressed={selected}
      aria-label={`${label}.`}
      aria-describedby={descriptionId}
      onClick={() => onSelect(skill)}
    >
      {skill.job && (
        <span className="strip-job">
          <span className="strip-led" aria-hidden="true" />
          {skill.job.label}
        </span>
      )}
      <span className="strip-description" id={descriptionId}>
        {skill.description || 'No description.'}
      </span>
      <span className="strip-flags">
        {notLoaded && (
          <span className="flag">
            <EyeOff size={16} aria-hidden="true" />
            {notLoaded}
          </span>
        )}
        {duplicate && (
          <span className="flag flag-duplicate">
            <Copy size={16} aria-hidden="true" />
            {duplicate}
          </span>
        )}
        {skill.problem && (
          <span className="flag flag-problem">
            <TriangleAlert size={16} aria-hidden="true" />
            Needs a fix
          </span>
        )}
        {source && <span className="strip-source">{source}</span>}
      </span>
      <span className={`tape tape-tilt-${tilt}`}>{skill.name}</span>
    </button>
  );
}
