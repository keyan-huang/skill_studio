import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CircleDashed, Scale, Sparkles, TriangleAlert } from 'lucide-react';
import type { CompareResult, MixResult, ProjectView, Skill } from '../shared/types.ts';
import { ApiProblem, api, type AiTarget } from '../api.ts';
import { plural } from '../labels.ts';
import { ApprovalDialog, type ApprovalRequest } from './ApprovalDialog.tsx';

type Tool = 'mix' | 'compare';
type Run<T> = { status: 'idle' } | { status: 'asking' } | { status: 'error'; message: string } | { status: 'done'; result: T };

const RELATIONSHIP_LABEL: Record<CompareResult['relationship'], string> = {
  duplicate: 'Duplicates',
  overlap: 'Overlap: same job, different approach',
  clash: 'Clash: opposite instructions',
  complement: 'Complement: different jobs that work together',
  unrelated: 'Unrelated',
};

interface Props {
  view: ProjectView;
  target: AiTarget;
  /** Set from a skill's details panel to start a comparison with that skill. */
  compareSeed: { id: string; nonce: number } | null;
  onSelectSkill: (id: string) => void;
  onApprovalSaved: () => void;
}

/** "Best mix for a task" and "Compare two skills", answered by the project's own agent. */
export function AiStudio({ view, target, compareSeed, onSelectSkill, onApprovalSaved }: Props) {
  const [tool, setTool] = useState<Tool>('mix');
  const [task, setTask] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [mix, setMix] = useState<Run<MixResult>>({ status: 'idle' });
  const [compare, setCompare] = useState<Run<CompareResult>>({ status: 'idle' });
  const [approval, setApproval] = useState<(ApprovalRequest & { run: (remember: boolean) => void }) | null>(null);
  const controller = useRef<AbortController | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const taskId = useId();
  const aId = useId();
  const bId = useId();

  const agent = view.agents.detected.find((candidate) => candidate.id === view.agents.selected) ?? null;
  const skills = view.spaces.flatMap((space) => space.skills);
  const loaded = skills.filter((skill) => skill.loaded);
  const asking = mix.status === 'asking' || compare.status === 'asking';

  useEffect(() => {
    if (!compareSeed) return;
    setTool('compare');
    setA(compareSeed.id);
    if (b === compareSeed.id) setB('');
    sectionRef.current?.scrollIntoView({ block: 'start' });
    // Only react to a new request from the details panel.
  }, [compareSeed]);

  useEffect(() => () => controller.current?.abort(), []);

  /** Asks for approval first, unless the user chose "Don't ask again" for this project. */
  function withApproval(request: ApprovalRequest, run: (approved: boolean, remember: boolean) => void) {
    if (view.aiApproved) run(false, false);
    else setApproval({ ...request, run: (remember) => run(true, remember) });
  }

  function start<T>(
    setRun: (run: Run<T>) => void,
    call: (signal: AbortSignal) => Promise<T>,
    remember: boolean,
  ) {
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setRun({ status: 'asking' });
    call(next.signal)
      .then((result) => {
        setRun({ status: 'done', result });
        if (remember) onApprovalSaved();
      })
      .catch((error: unknown) => {
        if (next.signal.aborted) {
          setRun({ status: 'idle' });
          return;
        }
        if (error instanceof ApiProblem && error.status === 428) {
          setRun({ status: 'idle' });
          onApprovalSaved();
          return;
        }
        setRun({ status: 'error', message: error instanceof Error ? error.message : String(error) });
      });
  }

  function askMix(event: FormEvent) {
    event.preventDefault();
    if (!agent || !task.trim()) return;
    withApproval(
      {
        agentLabel: agent.label,
        action: 'suggest the best mix for your task',
        sending: [
          'Your task, as you typed it',
          `The names and short descriptions of your ${plural(loaded.length, 'loaded skill')} (not their full instructions)`,
        ],
      },
      (approved, remember) =>
        start(setMix, (signal) => api.mix({ ...target, task, approved, remember }, signal), remember),
    );
  }

  function askCompare(event: FormEvent) {
    event.preventDefault();
    const first = skills.find((skill) => skill.id === a);
    const second = skills.find((skill) => skill.id === b);
    if (!agent || !first || !second) return;
    withApproval(
      {
        agentLabel: agent.label,
        action: `compare ${first.name} and ${second.name}`,
        sending: [`The full instructions of ${first.name}`, `The full instructions of ${second.name}`],
      },
      (approved, remember) =>
        start(setCompare, (signal) => api.compare({ ...target, a, b, approved, remember }, signal), remember),
    );
  }

  const unavailable = !agent
    ? 'No AI agent was found for this project, so these tools are turned off.'
    : !agent.installed
      ? `${agent.label}'s command-line tool isn't installed, so these tools are turned off.`
      : null;

  return (
    <section className="bank studio" aria-labelledby="studio-title" ref={sectionRef}>
      <div className="bank-heading">
        <h2 id="studio-title">Ask {agent?.label ?? 'your agent'}</h2>
        <p className="bank-note">Uses this project's own AI agent, only after you approve.</p>
      </div>

      <div className="tabs" role="group" aria-label="AI tools">
        <button type="button" aria-pressed={tool === 'mix'} className="tab" onClick={() => setTool('mix')}>
          <Sparkles size={16} aria-hidden="true" />
          Best mix for a task
        </button>
        <button type="button" aria-pressed={tool === 'compare'} className="tab" onClick={() => setTool('compare')}>
          <Scale size={16} aria-hidden="true" />
          Compare two skills
        </button>
      </div>

      {unavailable && <p className="field-hint">{unavailable}</p>}

      {tool === 'mix' ? (
        <div>
          <form className="studio-form" onSubmit={askMix}>
            <label htmlFor={taskId} className="field-label">
              What do you want to get done?
            </label>
            <textarea
              id={taskId}
              className="field field-area"
              rows={3}
              maxLength={2000}
              value={task}
              placeholder="For example: Write a product spec for the new onboarding flow in my team's style"
              onChange={(event) => setTask(event.target.value)}
            />
            <Actions
              asking={mix.status === 'asking'}
              disabled={!!unavailable || !task.trim() || asking}
              label="Suggest a mix"
              agentLabel={agent?.label ?? ''}
              onStop={() => controller.current?.abort()}
            />
          </form>
          {mix.status === 'error' && <ErrorNote message={mix.message} />}
          {mix.status === 'done' && <MixView result={mix.result} onSelectSkill={onSelectSkill} />}
        </div>
      ) : (
        <div>
          <form className="studio-form" onSubmit={askCompare}>
            <div className="compare-pickers">
              <SkillSelect id={aId} label="First skill" value={a} skills={skills} exclude={b} onChange={setA} />
              <SkillSelect id={bId} label="Second skill" value={b} skills={skills} exclude={a} onChange={setB} />
            </div>
            <Actions
              asking={compare.status === 'asking'}
              disabled={!!unavailable || !a || !b || asking}
              label="Compare"
              agentLabel={agent?.label ?? ''}
              onStop={() => controller.current?.abort()}
            />
          </form>
          {compare.status === 'error' && <ErrorNote message={compare.message} />}
          {compare.status === 'done' && <CompareView result={compare.result} />}
        </div>
      )}

      <ApprovalDialog
        request={approval}
        onCancel={() => setApproval(null)}
        onAllow={(remember) => {
          const run = approval?.run;
          setApproval(null);
          run?.(remember);
        }}
      />
    </section>
  );
}

function Actions(props: { asking: boolean; disabled: boolean; label: string; agentLabel: string; onStop: () => void }) {
  return (
    <div className="studio-actions">
      <button type="submit" className="button" disabled={props.disabled}>
        {props.asking ? 'Asking…' : props.label}
      </button>
      {props.asking && (
        <>
          <p className="field-hint" role="status">
            Asking {props.agentLabel}. This usually takes 20 to 60 seconds.
          </p>
          <button type="button" className="button button-quiet button-small" onClick={props.onStop}>
            Stop
          </button>
        </>
      )}
    </div>
  );
}

function SkillSelect(props: {
  id: string;
  label: string;
  value: string;
  skills: Skill[];
  exclude: string;
  onChange: (id: string) => void;
}) {
  const groups: { label: string; skills: Skill[] }[] = [
    { label: 'In this project', skills: props.skills.filter((skill) => skill.place === 'project') },
    { label: 'From your personal folder', skills: props.skills.filter((skill) => skill.place === 'personal') },
  ];
  return (
    <div className="picker">
      <label htmlFor={props.id} className="field-label">
        {props.label}
      </label>
      <select
        id={props.id}
        className="field field-select"
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      >
        <option value="">Choose a skill</option>
        {groups
          .filter((group) => group.skills.length > 0)
          .map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.skills.map((skill) => (
                <option key={skill.id} value={skill.id} disabled={skill.id === props.exclude}>
                  {skill.name}
                </option>
              ))}
            </optgroup>
          ))}
      </select>
    </div>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p className="field-error" role="alert">
      {message}
    </p>
  );
}

function MixView({ result, onSelectSkill }: { result: MixResult; onSelectSkill: (id: string) => void }) {
  return (
    <div className="result" aria-live="polite">
      <p className="result-summary">{result.summary || `${result.agentLabel} suggested this mix.`}</p>

      <h3 className="result-heading">Recommended mix</h3>
      {result.picks.length === 0 ? (
        <p className="field-hint">No loaded skill fits this task well.</p>
      ) : (
        <ul className="slots">
          {result.picks.map((pick, index) => (
            <li key={pick.id}>
              <button type="button" className="slot" onClick={() => onSelectSkill(pick.id)}>
                <span className="slot-role">{pick.role || 'Part of the mix'}</span>
                <span className="slot-reason">{pick.reason}</span>
                <span className={`tape tape-tilt-${index % 3}`}>{pick.name}</span>
              </button>
            </li>
          ))}
          {result.gaps.map((gap) => (
            <li key={gap}>
              <div className="slot slot-gap">
                <span className="slot-role">
                  <CircleDashed size={16} aria-hidden="true" />
                  Gap
                </span>
                <span className="slot-reason">{gap}</span>
                <span className="slot-empty">No loaded skill covers this</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {result.clashes.length > 0 && (
        <>
          <h3 className="result-heading">Watch out</h3>
          <ul className="clash-list">
            {result.clashes.map((clash) => (
              <li key={clash.advice} className="caution">
                <TriangleAlert size={18} aria-hidden="true" />
                <p>
                  {clash.names.length > 0 && <strong>{clash.names.join(' and ')}: </strong>}
                  {clash.advice}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}

      {result.leftOut.length > 0 && (
        <>
          <h3 className="result-heading">Left out</h3>
          <ul className="left-out">
            {result.leftOut.map((left) => (
              <li key={left.id}>
                <button type="button" className="left-out-row" onClick={() => onSelectSkill(left.id)}>
                  <span className="path">{left.name}</span>
                  <span>{left.reason}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="result-foot">
        Suggested by {result.agentLabel}. Advice only: nothing in your project was changed.
        {result.ignoredNames.length > 0 &&
          ` It also mentioned ${result.ignoredNames.join(', ')}, which ${result.ignoredNames.length === 1 ? "isn't" : "aren't"} loaded, so ${result.ignoredNames.length === 1 ? 'it was' : 'they were'} left off.`}
      </p>
    </div>
  );
}

function CompareView({ result }: { result: CompareResult }) {
  return (
    <div className="result" aria-live="polite">
      <p className="result-summary">{result.takeaway}</p>
      <p className={`relationship relationship-${result.relationship}`}>
        <strong>{RELATIONSHIP_LABEL[result.relationship]}.</strong> {result.relationshipReason}
      </p>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <td />
              <th scope="col">
                <span className="tape tape-tilt-0">{result.a.name}</span>
              </th>
              <th scope="col">
                <span className="tape tape-tilt-1">{result.b.name}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.a}</td>
                <td>{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.clashes.length > 0 && (
        <ul className="clash-list">
          {result.clashes.map((clash) => (
            <li key={clash} className="caution">
              <TriangleAlert size={18} aria-hidden="true" />
              <p>{clash}</p>
            </li>
          ))}
        </ul>
      )}

      {result.advice && (
        <p className="result-advice">
          <strong>Advice:</strong> {result.advice}
        </p>
      )}
      <p className="result-foot">Compared by {result.agentLabel}. Nothing in your project was changed.</p>
    </div>
  );
}
