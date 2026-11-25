import type { CSSProperties } from 'react';
import { TriangleAlert } from 'lucide-react';
import type { Job, Skill } from '../shared/types.ts';
import { jobColor, SOURCE_LABEL } from '../labels.ts';

interface Props {
  skill: Skill;
  jobs: Job[];
  /** Varies the angle of the tape label so strips look hand-labeled. */
  tilt: number;
  selected: boolean;
  onSelect: (skill: Skill) => void;
}

export function ChannelStrip({ skill, jobs, tilt, selected, onSelect }: Props) {
  const style = { '--channel': jobColor(skill.job, jobs) } as CSSProperties;
  const descriptionId = `${skill.id}-description`;
  const jobLabel = skill.job?.label ?? 'Job not sorted yet';
  return (
    <button
      type="button"
      className="strip"
      style={style}
      aria-pressed={selected}
      aria-label={`${skill.name}. ${jobLabel}. ${SOURCE_LABEL[skill.source]}.${skill.problem ? ' Needs a fix.' : ''}`}
      aria-describedby={descriptionId}
      onClick={() => onSelect(skill)}
    >
      <span className="strip-job">
        <span className="strip-led" aria-hidden="true" />
        {jobLabel}
      </span>
      <span className="strip-description" id={descriptionId}>
        {skill.description || 'No description.'}
      </span>
      {skill.problem && (
        <span className="strip-problem">
          <TriangleAlert size={16} aria-hidden="true" />
          Needs a fix
        </span>
      )}
      <span className="strip-source">{SOURCE_LABEL[skill.source]}</span>
      <span className={`tape tape-tilt-${tilt}`}>{skill.name}</span>
    </button>
  );
}
