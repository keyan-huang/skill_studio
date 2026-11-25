import { FolderOpen } from 'lucide-react';
import type { ProjectView } from '../shared/types.ts';

export function Header({ project }: { project: ProjectView['project'] }) {
  return (
    <header className="header">
      <p className="wordmark">Skill Studio</p>
      <div className="project-chip" aria-label="Connected project">
        <FolderOpen size={18} aria-hidden="true" />
        <span className="project-name">{project.name}</span>
        {project.isSample && <span className="sample-tag">Sample</span>}
      </div>
      {project.isSample && (
        <p className="header-note">You're exploring made-up sample skills. Connecting your own project comes next.</p>
      )}
    </header>
  );
}
