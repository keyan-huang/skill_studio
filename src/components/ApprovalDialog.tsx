import { useEffect, useId, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export interface ApprovalRequest {
  agentLabel: string;
  action: string;
  /** Plain list of exactly what will be sent. */
  sending: string[];
}

interface Props {
  request: ApprovalRequest | null;
  onAllow: (remember: boolean) => void;
  onCancel: () => void;
}

/** Asks before anything is sent to the project's AI agent. */
export function ApprovalDialog({ request, onAllow, onCancel }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [remember, setRemember] = useState(false);
  const titleId = useId();
  const rememberId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (request && !dialog.open) {
      setRemember(false);
      dialog.showModal();
    } else if (!request && dialog.open) {
      dialog.close();
    }
  }, [request]);

  return (
    <dialog
      ref={dialogRef}
      className="approval"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      {request && (
        <>
          <div className="approval-head">
            <ShieldCheck size={22} aria-hidden="true" />
            <h2 id={titleId}>Ask {request.agentLabel}?</h2>
          </div>
          <p>
            To {request.action}, Skill Studio will send this to {request.agentLabel}:
          </p>
          <ul className="approval-list">
            {request.sending.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="field-hint">
            It uses your own {request.agentLabel} plan, usually one request. {request.agentLabel} can only read what's
            sent here. It can't open your files, change anything, or run commands.
          </p>
          <label className="check" htmlFor={rememberId}>
            <input
              id={rememberId}
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Don't ask again for this project
          </label>
          <div className="approval-actions">
            <button type="button" className="button button-quiet" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="button" onClick={() => onAllow(remember)} autoFocus>
              Allow and ask
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
