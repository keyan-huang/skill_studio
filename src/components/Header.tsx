import { Bot } from 'lucide-react';
import type { ProjectView } from '../shared/types.ts';
import { ProjectPicker } from './ProjectPicker.tsx';

interface Props {
  view: ProjectView | null;
  busy: boolean;
  onSwitch: (path: string) => void;
  onSample: () => void;
  onOther: () => void;
}

export function Header({ view, busy, onSwitch, onSample, onOther }: Props) {
  const agent = view?.agents.detected.find((candidate) => candidate.id === view.agents.selected);
  return (
    <header className="header">
      <p className="wordmark">Skill Studio</p>
      {view && (
        <>
          <ProjectPicker
            project={view.project}
            busy={busy}
            onSwitch={onSwitch}
            onSample={onSample}
            onOther={onOther}
          />
          {view.project.isSample && <span className="sample-tag">Sample</span>}
          <p className="agent-chip">
            <Bot size={18} aria-hidden="true" />
            <span>Agent:</span>
            <span className="agent-name">{agent?.label ?? 'None found'}</span>
          </p>
        </>
      )}
    </header>
  );
}
