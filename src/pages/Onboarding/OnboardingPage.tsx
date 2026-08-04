import { useState } from 'react';
import { routes } from '@/shared/routing';
import { LanguageStep } from './LanguageStep/LanguageStep';
import { TimezoneStep } from './TimezoneStep/TimezoneStep';
import { FirstStudentStep } from './FirstStudentStep/FirstStudentStep';
import { FirstLessonsStep } from './FirstLessonsStep/FirstLessonsStep';
import styles from './OnboardingPage.module.scss';

interface OnboardingStudent {
  id: string;
  name: string;
  rate: number;
}

/**
 * First-run wizard (O1–O4), shown full-screen outside AppLayout/the router
 * when no profile exists yet — the `RootGate` in App.tsx mounts this instead
 * of `AppRoutes` while `GET /profile` 404s.
 *
 * Steps: language (O1, local-only, no back — Telegram's back button starts
 * appearing from O2 per the etalon) → time zone (O2 — the step that actually
 * saves the profile, so a tutor who quits right after it re-opens straight
 * into the app instead of restarting onboarding) → first student (O3,
 * skippable) → first lessons (O4, only reachable once O3 created a student;
 * skipping O3 skips straight to `onDone`, matching the etalon's "student step
 * only" flow — there's no "no student" variant of O4 in the design).
 *
 * Each step 1-3 owns its own `useBackButton` wiring and steps back into the
 * previous one via `onBack`. Going back from O4 lands on O3 with the already
 * -created student passed as `initialStudent`, which switches O3 into PATCH
 * (update) mode instead of re-running `POST /students` — otherwise "Далі"
 * would create a duplicate student every time a tutor backs out of O4.
 *
 * `onDone` hands control back to the app; an optional `path` lands the router
 * on a specific screen once it mounts (used by O4's "set one manually" exit).
 */
export function OnboardingPage({ onDone }: { onDone: (path?: string) => void }) {
  const [step, setStep] = useState(0);
  const [student, setStudent] = useState<OnboardingStudent | null>(null);

  return (
    <div className={styles.page}>
      {step === 0 && <LanguageStep onNext={() => setStep(1)} />}
      {step === 1 && <TimezoneStep onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && (
        <FirstStudentStep
          initialStudent={student}
          onSaved={(next) => {
            setStudent(next);
            setStep(3);
          }}
          onSkip={() => onDone()}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && student && (
        <FirstLessonsStep
          studentId={student.id}
          studentName={student.name}
          onFinish={() => onDone()}
          onManual={() => onDone(routes.lessons.new({ studentId: student.id }))}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  );
}
