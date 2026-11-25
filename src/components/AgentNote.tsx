import { useId } from 'react';
import { Info } from 'lucide-react';
import type { AgentId, AgentState } from '../shared/types.ts';

interface Props {
  agents: AgentState;
  aiApproved: boolean;
  busy: boolean;
  onChoose: (agent: AgentId) => void;
  onAskEveryTime: () => void;
}

/** Explains which AI agent Skill Studio found for this project, and why. */
export function AgentNote({ agents, aiApproved, busy, onChoose, onAskEveryTime }: Props) {
  const selectId = useId();
  const selected = agents.detected.find((agent) => agent.id === agents.selected);

  if (!selected) {
    return (
      <div className="agent-note">
        <Info size={18} aria-hidden="true" />
        <p>
          No AI agent found for this project. You can still see every skill. To compare skills later, install GitHub
          Copilot, Claude Code, or Codex.
        </p>
      </div>
    );
  }

  return (
    <div className={`agent-note${agents.needsChoice ? ' agent-note-choice' : ''}`}>
      <Info size={18} aria-hidden="true" />
      <div>
        {agents.needsChoice ? (
          <p>This project has clues for more than one AI agent. Which one do you use here?</p>
        ) : (
          <p>
            {agents.chosenByUser ? 'You chose' : 'Skill Studio found'} <strong>{selected.label}</strong> for this
            project.{!selected.installed && ` Its tool isn't installed, so AI features won't work with it yet.`}
          </p>
        )}
        {aiApproved && (
          <p className="agent-approval">
            AI actions run without asking for this project.{' '}
            <button type="button" className="link-button" onClick={onAskEveryTime} disabled={busy}>
              Ask me every time
            </button>
          </p>
        )}
        <details className="agent-clues">
          <summary>How Skill Studio knows</summary>
          <ul>
            {agents.detected.map((agent) => (
              <li key={agent.id}>
                <strong>{agent.label}:</strong> {agent.clues.join(', ')}.
              </li>
            ))}
          </ul>
        </details>
        {agents.detected.length > 1 && (
          <div className="agent-pick">
            <label htmlFor={selectId}>Agent for this project</label>
            <select
              id={selectId}
              className="field field-select"
              value={selected.id}
              disabled={busy}
              onChange={(event) => onChoose(event.target.value as AgentId)}
            >
              {agents.detected.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.label}
                  {agent.installed ? '' : ' (not installed)'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
