import { useEffect, useState, type CSSProperties } from 'react';
import { X } from 'lucide-react';
import type { Job, Skill } from '../shared/types.ts';
import { duplicateText, jobColor, PLACE_LABEL, PLACE_NOTE, SOURCE_LABEL } from '../labels.ts';

interface Props {
  skill: Skill | null;
  jobs: Job[];
  agentLabel: string | null;
  onClose: () => void;
  onCompare: (skill: Skill) => void;
}

export function DetailsPanel({ skill, jobs, agentLabel, onClose, onCompare }: Props) {
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    setShowRaw(false);
  }, [skill]);

  if (!skill) return null;

  const style = { '--channel': jobColor(skill.job, jobs) } as CSSProperties;

  return (
    <div className="panel" style={style}>
      <div className="panel-top">
        <h2 id="panel-title" className="tape tape-panel">
          {skill.name}
        </h2>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close details">
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {skill.problem && <p className="panel-problem">{skill.problem}</p>}

      <p className="panel-description">{skill.description || 'This skill has no description.'}</p>

      <dl className="facts">
        {skill.job && (
          <div>
            <dt>Job</dt>
            <dd>
              <span className="strip-led" aria-hidden="true" />
              {skill.job.label}
            </dd>
          </div>
        )}
        <div>
          <dt>Where it loads</dt>
          <dd>
            {skill.loaded
              ? `${PLACE_LABEL[skill.place]}. ${PLACE_NOTE[skill.place]}`
              : `Not loaded${agentLabel ? ` by ${agentLabel}` : ''}: it doesn't read this folder.`}
          </dd>
        </div>
        {skill.alsoIn.length > 0 && (
          <div>
            <dt>Duplicate</dt>
            <dd>{capitalize(duplicateText(skill.alsoIn).replace('Duplicate: ', ''))}. The AI may pick either copy.</dd>
          </div>
        )}
        <div>
          <dt>Made by</dt>
          <dd>{SOURCE_LABEL[skill.source]}</dd>
        </div>
        <div>
          <dt>Folder</dt>
          <dd className="path">{skill.location}</dd>
        </div>
      </dl>

      <h3 className="panel-subheading">Files included</h3>
      <ul className="file-list">
        {skill.files.map((file) => (
          <li key={file} className="path">
            {file}
          </li>
        ))}
        {skill.moreFiles > 0 && <li>and {skill.moreFiles} more</li>}
      </ul>

      <div className="panel-actions">
        <button type="button" className="button button-quiet" onClick={() => onCompare(skill)}>
          Compare with another skill
        </button>
      </div>

      <button
        type="button"
        className="button button-quiet"
        aria-expanded={showRaw}
        aria-controls="raw-skill"
        onClick={() => setShowRaw((value) => !value)}
      >
        {showRaw ? 'Hide details' : 'Show details'}
      </button>
      {showRaw && (
        <pre id="raw-skill" className="raw" tabIndex={0} aria-label={`Full instructions for ${skill.name}`}>
          {skill.raw}
        </pre>
      )}
    </div>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
