import { useEffect, useState } from 'react';
import { m } from '@/paraglide/messages';
import { SectionLabel, Cell, BottomSheet, SearchInput, Skeleton, Icon, Button, showToast } from '@/shared/ui';
import { useLocale } from '@/shared/i18n';
import { haptic, useBackButton } from '@/shared/tg';
import { cx } from '@/shared/lib';
import { useSaveProfile, useTimeZones } from '@/features/profile/queries';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { StepHeading } from '../StepHeading/StepHeading';
import { StepActions } from '../StepActions/StepActions';
import styles from './TimezoneStep.module.scss';

const REMIND_CHOICES = [0, 15, 30, 60];

function currentTimeIn(zone: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: zone }).format(new Date());
  } catch {
    return '';
  }
}

/**
 * O2 — confirms the device time zone and a reminder lead time, then saves the
 * profile. This is the step that actually creates it: the `PUT /profile` call
 * below is what flips `GET /profile` from 404 to 200, so a tutor who quits the
 * wizard right after this step re-opens straight into the real app (skipping
 * O3/O4) instead of restarting onboarding (design-system.html O2 "Онбординг —
 * часовий пояс"). `onBack` returns to O1 via Telegram's native BackButton,
 * which starts appearing from this step per the etalon.
 */
export function TimezoneStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { locale } = useLocale();
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [zone, setZone] = useState(detected);
  const [remind, setRemind] = useState(15);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState('');

  const { data: timeZones } = useTimeZones();
  const saveProfile = useSaveProfile();

  useBackButton(onBack);

  useEffect(() => {
    if (saveProfile.isError) showToast(m.form_error_save());
  }, [saveProfile.isError]);

  // Server-provided IANA ids with the detected zone pinned first, but only when
  // the server advertises it (offering an unresolvable id guarantees a 400).
  const options = timeZones
    ? timeZones.includes(detected)
      ? [detected, ...timeZones.filter((z) => z !== detected)]
      : timeZones
    : [];
  const q = query.trim().toLowerCase();
  const zones = options.filter((z) => !q || z.toLowerCase().includes(q));

  const pickZone = (z: string) => {
    haptic('light');
    setZone(z);
    setSheetOpen(false);
    setQuery('');
  };

  const continueNext = () => {
    if (saveProfile.isPending) return;
    saveProfile.mutate(
      { timeZoneId: zone, languageCode: locale, remindMinutes: remind },
      { onSuccess: onNext },
    );
  };

  return (
    <div className={styles.step}>
      <div className={styles.scroll}>
        <ProgressBar step={1} total={4} />
        <StepHeading title={m.onboarding_tz_title()} subtitle={m.onboarding_tz_subtitle()} />

        <div className={styles.card}>
          <span className={styles.cardIcon}>
            <Icon name="public" size={24} />
          </span>
          <span className={styles.cardCol}>
            <span className={styles.cardZone}>{zone}</span>
            <span className={styles.cardHint}>
              {zone === detected
                ? m.onboarding_tz_current_auto({ time: currentTimeIn(zone, locale) })
                : m.onboarding_tz_current_manual({ time: currentTimeIn(zone, locale) })}
            </span>
          </span>
          <span className={styles.cardCheck}>
            <Icon name="check" size={16} filled />
          </span>
        </div>

        <Button variant="tinted" fullWidth icon="search" onClick={() => setSheetOpen(true)}>
          {m.onboarding_tz_pick_other()}
        </Button>

        <div className={styles.reminder}>
          <SectionLabel>{m.onboarding_reminder_section()}</SectionLabel>
          <div className={styles.reminderChips}>
            {REMIND_CHOICES.map((minutes) => (
              <button
                key={minutes}
                type="button"
                className={cx(styles.chip, remind === minutes && styles['chip--active'])}
                onClick={() => setRemind(minutes)}
              >
                {minutes === 0
                  ? m.profile_reminders_off()
                  : minutes === 60
                    ? m.onboarding_reminder_hour()
                    : m.minutes({ count: minutes })}
              </button>
            ))}
          </div>
          <span className={styles.reminderFooter}>{m.onboarding_reminder_footer()}</span>
        </div>
      </div>

      <StepActions>
        <Button fullWidth onClick={continueNext} loading={saveProfile.isPending}>
          {m.onboarding_continue()}
        </Button>
      </StepActions>

      {sheetOpen && (
        <BottomSheet title={m.profile_timezone()} onClose={() => setSheetOpen(false)} fullHeight>
          <SearchInput value={query} onChange={setQuery} placeholder={m.search_placeholder()} />
          <div className={styles.sheetList}>
            {!timeZones ? (
              Array.from({ length: 8 }, (_, i) => (
                <Cell key={i} title={<Skeleton width={i % 2 ? '45%' : '60%'} />} />
              ))
            ) : (
              zones.map((z) => (
                <Cell
                  key={z}
                  title={z}
                  value={z === zone ? '✓' : undefined}
                  valueColor="var(--ds-color-accent)"
                  onClick={() => pickZone(z)}
                />
              ))
            )}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
