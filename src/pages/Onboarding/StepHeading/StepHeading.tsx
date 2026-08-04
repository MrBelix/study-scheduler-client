import styles from './StepHeading.module.scss';

interface StepHeadingProps {
  title: string;
  subtitle: string;
}

/** Title + subtitle block shared by every onboarding step (design-system.html O1–O4). */
export function StepHeading({ title, subtitle }: StepHeadingProps) {
  return (
    <div className={styles.heading}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
}
