import { useEffect, useState } from 'react';
import { m } from '@/paraglide/messages';
import { Section, Cell, Tile, Switch, SearchInput, BottomSheet, Skeleton, EmptyState, showToast } from '@/shared/ui';
import { useLocale, LOCALE_NAMES, type AppLocale } from '@/shared/i18n';
import { haptic, getTelegramUser, openTelegramLink } from '@/shared/tg';
import { useProfile, useSaveProfile, useTimeZones } from '@/features/profile/queries';
import { useStudents } from '@/features/students/queries';
import { version as appVersion } from '../../../package.json';
import { ProfileHeader } from './ProfileHeader/ProfileHeader';
import { ProfileSkeleton } from './ProfileSkeleton/ProfileSkeleton';
import { ReconnectBotBanner } from './ReconnectBotBanner/ReconnectBotBanner';
import styles from './ProfilePage.module.scss';

// @username of the notifications bot — used to deep-link the tutor back into
// its chat when notifications got disabled (see ReconnectBotBanner below).
const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME;

// Divider inset for the 30px icon-tile settings rows: 16 (gutter) + 30 (icon)
// + 12 (gap) — see design-system.html "SectionLabel + Card + Row".
const ROW_INSET = 58;

export function ProfilePage() {
  const { locale, setLocale } = useLocale();
  const { data: profile, isPending, isError, isNotFound, refetch } = useProfile();
  const { data: timeZones } = useTimeZones();
  const { data: students } = useStudents();
  const saveProfile = useSaveProfile();

  const [tzSheetOpen, setTzSheetOpen] = useState(false);
  const [tzQuery, setTzQuery] = useState('');
  const [remindSheetOpen, setRemindSheetOpen] = useState(false);
  const [langSheetOpen, setLangSheetOpen] = useState(false);

  useEffect(() => {
    if (saveProfile.isError) showToast(m.form_error_save());
  }, [saveProfile.isError]);

  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // PUT always requires a time zone; before the profile exists (404 —
  // onboarding), fall back to the device zone (same as pickLanguage below).
  const currentZone = () => profile?.timeZoneId ?? detected;

  const LANGUAGES: AppLocale[] = ['uk', 'en'];

  // Language lives in the member settings on the server. The first save may
  // happen before a time zone was ever chosen — default it to the device zone
  // (PUT requires one; it is also what the onboarding would have suggested).
  const pickLanguage = (next: AppLocale) => {
    haptic('light');
    setLocale(next);
    saveProfile.mutate({ timeZoneId: currentZone(), languageCode: next });
    // Picking a *different* language changes `App.tsx`'s `RouterProvider
    // key={locale}`, which remounts the routed tree (this page included) and
    // takes the sheet down for free. Re-picking the *active* language is a
    // no-op state update though — no remount then — so this close is kept
    // explicit for that case rather than relied upon.
    setLangSheetOpen(false);
  };

  // Bot reminder lead time: 0 = off (an omitted field keeps the stored value).
  const REMIND_CHOICES = [0, 15, 30, 60];
  const remindLabel = (minutes: number | null) =>
    minutes ? m.profile_reminders_before({ minutes }) : m.profile_reminders_off();

  const pickRemind = (minutes: number) => {
    haptic('light');
    saveProfile.mutate({ timeZoneId: currentZone(), remindMinutes: minutes });
    setRemindSheetOpen(false);
  };

  const setAfterLesson = (checked: boolean) => {
    haptic('light');
    saveProfile.mutate({ timeZoneId: currentZone(), notifyAfterLesson: checked });
  };

  const pickTimeZone = (zone: string) => {
    haptic('light');
    saveProfile.mutate({ timeZoneId: zone, languageCode: profile?.languageCode ?? locale });
    setTzSheetOpen(false);
    setTzQuery('');
  };

  // Server-provided IANA ids (the source of truth for what PUT accepts), with
  // the device-detected zone pinned first — but only when the server actually
  // advertises it: offering an id the backend can't resolve turns the top pick
  // into a guaranteed 400.
  const options = timeZones
    ? timeZones.includes(detected)
      ? [detected, ...timeZones.filter((z) => z !== detected)]
      : timeZones
    : [];
  const q = tzQuery.trim().toLowerCase();
  const zones = options.filter((z) => !q || z.toLowerCase().includes(q));

  // Real Telegram identity from init data — not editable in-app.
  const tgUser = getTelegramUser();
  const displayName = [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(' ');
  const initials = `${tgUser?.first_name?.[0] ?? ''}${tgUser?.last_name?.[0] ?? ''}`.toUpperCase() || undefined;

  // Notifications are only relevant if some notification is actually enabled.
  const notificationsEnabled =
    (profile?.remindMinutes != null && profile.remindMinutes !== 0) || !!profile?.notifyAfterLesson;
  const showBotDisconnected = !!profile && !profile.botReachable && notificationsEnabled;

  const reconnectBot = () => {
    haptic('medium');
    openTelegramLink(`https://t.me/${BOT_USERNAME}?start=notify`);
  };

  if (isPending) return <ProfileSkeleton />;

  if (isError && !isNotFound) {
    return (
      <EmptyState
        variant="secondary"
        icon="cloud_off"
        tone="warn"
        title={m.error_generic()}
        action={{ label: m.retry(), onClick: () => refetch() }}
      />
    );
  }

  return (
    <div className={styles['profile']}>
      {displayName && (
        <ProfileHeader name={displayName} initials={initials} username={tgUser?.username} studentsCount={students?.length} />
      )}

      <Section header={m.profile_worktime_section()} footer={m.profile_worktime_caption()}>
        <Cell
          leading={<Tile tone="purple" icon="public" />}
          inset={ROW_INSET}
          title={m.profile_timezone()}
          value={profile?.timeZoneId ?? m.value_none()}
          chevron
          onClick={() => setTzSheetOpen(true)}
        />
      </Section>

      {showBotDisconnected && <ReconnectBotBanner onClick={reconnectBot} />}

      <Section header={m.profile_reminders_section()}>
        <Cell
          leading={<Tile tone="accent" icon="notifications" />}
          inset={ROW_INSET}
          title={m.profile_reminders()}
          value={remindLabel(profile?.remindMinutes ?? null)}
          chevron
          onClick={() => setRemindSheetOpen(true)}
        />
        <Cell
          leading={<Tile tone="ok" icon="fact_check" />}
          inset={ROW_INSET}
          title={m.profile_after_lesson()}
          subtitle={m.profile_after_lesson_hint()}
          plainTitle
          value={
            <Switch
              checked={profile?.notifyAfterLesson ?? true}
              onChange={setAfterLesson}
              disabled={saveProfile.isPending}
            />
          }
        />
      </Section>

      <Section header={m.profile_app_section()} footer={m.profile_theme_caption()}>
        <Cell
          leading={<Tile tone="ok" icon="language" />}
          inset={ROW_INSET}
          title={m.profile_language()}
          value={LOCALE_NAMES[locale]}
          chevron
          onClick={() => setLangSheetOpen(true)}
        />
        <Cell
          leading={<Tile tone="neutral" icon="info" />}
          inset={ROW_INSET}
          title={m.profile_version()}
          value={appVersion}
        />
      </Section>

      {remindSheetOpen && (
        <BottomSheet title={m.profile_reminders()} onClose={() => setRemindSheetOpen(false)}>
          <div className={styles['profile__sheet-list']}>
            {REMIND_CHOICES.map((minutes) => (
              <Cell
                key={minutes}
                title={remindLabel(minutes || null)}
                value={(profile?.remindMinutes ?? 0) === minutes ? '✓' : undefined}
                valueColor="var(--ds-color-accent)"
                onClick={() => pickRemind(minutes)}
              />
            ))}
          </div>
        </BottomSheet>
      )}

      {tzSheetOpen && (
        <BottomSheet title={m.profile_timezone()} onClose={() => setTzSheetOpen(false)} fullHeight>
          <SearchInput value={tzQuery} onChange={setTzQuery} placeholder={m.search_placeholder()} />
          <div className={styles['profile__sheet-list']}>
            {!timeZones ? (
              Array.from({ length: 8 }, (_, i) => (
                <Cell key={i} title={<Skeleton width={i % 2 ? '45%' : '60%'} />} />
              ))
            ) : (
              zones.map((zone) => (
                <Cell
                  key={zone}
                  title={zone}
                  value={zone === profile?.timeZoneId ? '✓' : undefined}
                  valueColor="var(--ds-color-accent)"
                  onClick={() => pickTimeZone(zone)}
                />
              ))
            )}
          </div>
        </BottomSheet>
      )}

      {langSheetOpen && (
        <BottomSheet title={m.profile_language()} onClose={() => setLangSheetOpen(false)}>
          <div className={styles['profile__sheet-list']}>
            {LANGUAGES.map((code) => (
              <Cell
                key={code}
                title={LOCALE_NAMES[code]}
                value={code === locale ? '✓' : undefined}
                valueColor="var(--ds-color-accent)"
                onClick={() => pickLanguage(code)}
              />
            ))}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
