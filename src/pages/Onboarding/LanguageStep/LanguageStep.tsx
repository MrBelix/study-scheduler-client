import { m } from '@/paraglide/messages';
import { Section, Cell, Icon, Button } from '@/shared/ui';
import { useLocale, LOCALE_NAMES, type AppLocale } from '@/shared/i18n';
import { haptic, getTelegramUser } from '@/shared/tg';
import { cx } from '@/shared/lib';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { StepHeading } from '../StepHeading/StepHeading';
import { StepActions } from '../StepActions/StepActions';
import styles from './LanguageStep.module.scss';

const LOCALES: AppLocale[] = ['uk', 'en'];

/**
 * O1 — confirms the Telegram-detected app language before anything else; a
 * confirmation step rather than a blank pick, since Telegram already told us
 * (design-system.html O1 "Онбординг — мова").
 */
export function LanguageStep({ onNext }: { onNext: () => void }) {
  const { locale, setLocale } = useLocale();
  const firstName = getTelegramUser()?.first_name;

  const pick = (next: AppLocale) => {
    if (next === locale) return;
    haptic('light');
    setLocale(next);
  };

  return (
    <div className={styles.step}>
      <div className={styles.scroll}>
        <ProgressBar step={0} total={4} />
        <StepHeading
          title={firstName ? m.onboarding_welcome_title({ name: firstName }) : m.onboarding_welcome_title_generic()}
          subtitle={m.onboarding_welcome_subtitle()}
        />

        <Section header={m.onboarding_language_section()} footer={m.onboarding_language_footer()}>
          {LOCALES.map((code) => (
            <Cell
              key={code}
              title={LOCALE_NAMES[code]}
              value={
                <span className={cx(styles.mark, code === locale && styles['mark--active'])}>
                  {code === locale && <Icon name="check" size={16} filled />}
                </span>
              }
              onClick={() => pick(code)}
            />
          ))}
        </Section>
      </div>

      <StepActions>
        <Button fullWidth onClick={onNext}>
          {m.onboarding_continue()}
        </Button>
      </StepActions>
    </div>
  );
}
