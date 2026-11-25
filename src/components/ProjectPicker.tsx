import { useEffect, useId, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import type { ProjectGroup, ProjectView } from '../shared/types.ts';
import { api } from '../api.ts';

const SAMPLE = '__sample';
const OTHER = '__other';

interface Props {
  project: ProjectView['project'];
  busy: boolean;
  onSwitch: (path: string) => void;
  onSample: () => void;
  onOther: () => void;
}

/** A dropdown of the user's projects (for example, everything in ~/Documents/Projects). */
export function ProjectPicker({ project, busy, onSwitch, onSample, onOther }: Props) {
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const selectId = useId();

  useEffect(() => {
    let cancelled = false;
    api
      .projects(project.path || undefined)
      .then((result) => {
        if (!cancelled) setGroups(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [project.path]);

  const value = project.isSample ? SAMPLE : project.path;

  return (
    <div className="project-picker">
      <FolderOpen size={18} aria-hidden="true" />
      <label htmlFor={selectId}>Project</label>
      <select
        id={selectId}
        className="field field-select project-select"
        value={value}
        disabled={busy}
        onChange={(event) => {
          const next = event.target.value;
          if (next === SAMPLE) onSample();
          else if (next === OTHER) onOther();
          else if (next !== value) onSwitch(next);
        }}
      >
        {!project.isSample && !groups.some((group) => group.projects.some((p) => p.path === project.path)) && (
          <option value={project.path}>{project.name}</option>
        )}
        {groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.projects.map((choice) => (
              <option key={choice.path} value={choice.path}>
                {choice.name}
              </option>
            ))}
          </optgroup>
        ))}
        <optgroup label="More">
          <option value={SAMPLE}>Sample skills</option>
          <option value={OTHER}>Another folder…</option>
        </optgroup>
      </select>
    </div>
  );
}
