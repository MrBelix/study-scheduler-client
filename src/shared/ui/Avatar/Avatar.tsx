import { type CSSProperties } from 'react';
import { avatarGradient, avatarInitials } from '../tokens/colors';
import styles from './Avatar.module.scss';

interface AvatarProps {
  name: string;
  /** Diameter in px. */
  size?: number;
}

/** Circular avatar — deterministic gradient + initials from the name. */
export function Avatar({ name, size = 42 }: AvatarProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    fontSize: Math.round(size * 0.38),
    background: avatarGradient(name),
  };
  return (
    <span className={styles.avatar} style={style}>
      {avatarInitials(name)}
    </span>
  );
}
