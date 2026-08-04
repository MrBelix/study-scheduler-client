import { type CSSProperties } from 'react';
import { avatarColor, avatarInitials } from '../tokens/colors';
import styles from './Avatar.module.scss';

interface AvatarProps {
  name: string;
  /** Diameter in px. */
  size?: number;
  /** Explicit initials override (e.g. two-letter "VB") — defaults to the single derived initial from `name`. */
  initials?: string;
}

/**
 * Initial font size per diameter — hand-tuned ramp from the design system
 * (design-system.html "Avatar": 24→11, 34→14, 42→17, 56→24), falling back to
 * a flat ratio beyond the largest defined size.
 */
function initialFontSize(size: number): number {
  if (size <= 24) return 11;
  if (size <= 34) return 14;
  if (size <= 42) return 17;
  if (size <= 56) return 24;
  return Math.round(size * 0.4);
}

/** Circular avatar — deterministic solid color + initials from the name. */
export function Avatar({ name, size = 42, initials }: AvatarProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    fontSize: initialFontSize(size),
    background: avatarColor(name),
  };
  return (
    <span className={styles.avatar} style={style}>
      {initials ?? avatarInitials(name)}
    </span>
  );
}
