import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Id of the heading inside that names the drawer. */
  labelledBy: string;
  children: ReactNode;
}

const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea, [tabindex="0"]';

/** Details slide over the page from the right, only while something is selected. */
export function Drawer({ open, onClose, labelledBy, children }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) {
      returnTo.current = document.activeElement as HTMLElement | null;
      drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    } else if (!open && wasOpen.current) {
      returnTo.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Leave Escape to an open dialog (like the approval dialog) first.
        if (document.querySelector('dialog[open]')) return;
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      // Keep keyboard focus inside the drawer while it's open.
      const items = [...drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <div className="drawer" role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={drawerRef}>
        {children}
      </div>
    </>
  );
}
