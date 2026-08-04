import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './BottomSheet.module.scss';

interface BottomSheetProps {
  /** Centered header line; also labels the dialog for screen readers. */
  title?: string;
  onClose: () => void;
  /** Fixed 70vh height — for sheets whose inner list should fill the sheet. */
  fullHeight?: boolean;
  children: ReactNode;
}

/**
 * Modal bottom sheet: dimmed backdrop + slide-up panel. Mount it
 * conditionally (`{open && <BottomSheet …>}`). While mounted it locks body
 * scroll, moves focus into the panel (restored on close) and closes on
 * Escape or a backdrop tap.
 *
 * Rendered via a portal to `document.body` so its `position: fixed` backdrop
 * is never trapped inside a scrolling ancestor (iOS/WebKit clips `fixed`
 * descendants of elements with `-webkit-overflow-scrolling: touch` to that
 * ancestor's box instead of the real viewport).
 */
export function BottomSheet({ title, onClose, fullHeight, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Focus hand-off + body scroll lock for the lifetime of the sheet.
  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    sheetRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className={styles['bottom-sheet__backdrop']} onClick={onClose}>
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={
          fullHeight ? `${styles['bottom-sheet']} ${styles['bottom-sheet--full']}` : styles['bottom-sheet']
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles['bottom-sheet__handle']} aria-hidden="true" />
        {title && (
          <div id={titleId} className={styles['bottom-sheet__title']}>
            {title}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
