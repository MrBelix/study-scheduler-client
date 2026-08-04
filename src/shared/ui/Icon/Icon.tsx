import { icons, type IconName } from './icons';

interface IconProps {
  name: IconName;
  size?: number;
  /** Render the FILL 1 variant (falls back to the default path if none exists). */
  filled?: boolean;
  className?: string;
}

/** Material Symbols Rounded glyph — 960×960 viewBox, filled with `currentColor`. */
export function Icon({ name, size = 24, filled, className }: IconProps) {
  const icon = icons[name];
  const d = (filled && icon.dFill) || icon.d;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
