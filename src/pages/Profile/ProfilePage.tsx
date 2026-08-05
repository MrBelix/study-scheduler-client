import { useEffect, useState } from 'react';
import { m } from '@/paraglide/messages';
import { Section, Cell, Tile, Switch, SearchInput, TextField, Button, BottomSheet, Skeleton, EmptyState, showToast } from '@/shared/ui';
import { useLocale, LOCALE_NAMES, type AppLocale } from '@/shared/i18n';
import { haptic, getTelegramUser, openTelegramLink } from '@/shared/tg';
import { pluralUk } from '@/shared/lib';
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

/** "4 уроки" — locale-aware count, reused from the schedule day-header wording (uk has 3 plural forms, en just 2). */
function lessonsCountLabel(count: number, locale: AppLocale): string {
  if (locale === 'uk') {
    return pluralUk(count, {
      one: m.schedule_lessons_count_one({ count }),
      few: m.schedule_lessons_count_few({ count }),
      many: m.schedule_lessons_count_many({ count }),
    });
  }
  return count === 1 ? m.schedule_lessons_count_one({ count }) : m.schedule_lessons_count_many({ count });
}

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
  const [agendaSheetOpen, setAgendaSheetOpen] = useState(false);
  const [agendaCustomOpen, setAgendaCustomOpen] = useState(false);
  const [agendaCustomTime, setAgendaCustomTime] = useState('');

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

  // Bot reminder lead time: the "За скільки" row only shows once reminders are on
  // (0/off is now the switch below, not a sheet choice).
  const REMIND_CHOICES = [15, 30, 60];
  const DEFAULT_REMIND_MINUTES = 30;
  const remindOn = profile?.remindMinutes != null && profile.remindMinutes !== 0;

  const pickRemind = (minutes: number) => {
    haptic('light');
    saveProfile.mutate({ timeZoneId: currentZone(), remindMinutes: minutes });
    setRemindSheetOpen(false);
  };

  const toggleRemind = (checked: boolean) => {
    haptic('light');
    saveProfile.mutate({ timeZoneId: currentZone(), remindMinutes: checked ? DEFAULT_REMIND_MINUTES : 0 });
  };

  const toggleMorningAgenda = (checked: boolean) => {
    haptic('light');
    saveProfile.mutate({ timeZoneId: currentZone(), morningAgenda: checked });
  };

  const toggleDaySummary = (checked: boolean) => {
    haptic('light');
    saveProfile.mutate({ timeZoneId: currentZone(), daySummary: checked });
  };

  const AGENDA_TIME_PRESETS = ['07:00', '08:00', '09:00', '10:00'];

  const pickAgendaTime = (time: string) => {
    haptic('light');
    saveProfile.mutate({ timeZoneId: currentZone(), morningAgendaAt: time });
    setAgendaSheetOpen(false);
    setAgendaCustomOpen(false);
  };

  const openAgendaCustom = () => {
    setAgendaCustomTime(profile?.morningAgendaAt ?? '');
    setAgendaCustomOpen(true);
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
  const notificationsEnabled = remindOn || !!profile?.daySummary || !!profile?.morningAgenda;
  const showBotDisconnected = !!profile && !profile.botReachable && notificationsEnabled;

  const closeAgendaSheet = () => {
    setAgendaSheetOpen(false);
    setAgendaCustomOpen(false);
  };

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

      <Section header={m.profile_reminders_section()} footer={m.profile_reminders_caption()}>
        <Cell
          leading={<Tile tone="accent" icon="notifications" />}
          inset={ROW_INSET}
          title={m.profile_reminders()}
          subtitle={m.profile_reminders_hint({ minutes: profile?.remindMinutes ?? DEFAULT_REMIND_MINUTES })}
          plainTitle
          dimmed={showBotDisconnected}
          value={<Switch checked={remindOn} onChange={toggleRemind} disabled={saveProfile.isPending} />}
        />
        {remindOn && (
          <Cell
            title={m.profile_reminders_amount()}
            dimmed={showBotDisconnected}
            value={m.profile_reminders_before({ minutes: profile?.remindMinutes ?? DEFAULT_REMIND_MINUTES })}
            chevron
            onClick={() => setRemindSheetOpen(true)}
          />
        )}

        <Cell
          leading={<Tile tone="warn" icon="wb_sunny" />}
          inset={ROW_INSET}
          title={m.profile_agenda()}
          subtitle={m.profile_agenda_hint()}
          plainTitle
          dimmed={showBotDisconnected}
          value={<Switch checked={!!profile?.morningAgenda} onChange={toggleMorningAgenda} disabled={saveProfile.isPending} />}
        />
        {profile?.morningAgenda && (
          <Cell
            title={m.profile_agenda_time()}
            dimmed={showBotDisconnected}
            value={profile.morningAgendaAt}
            chevron
            onClick={() => setAgendaSheetOpen(true)}
          />
        )}

        <Cell
          leading={<Tile tone="purple" icon="bedtime" />}
          inset={ROW_INSET}
          title={m.profile_summary()}
          subtitle={m.profile_summary_hint()}
          plainTitle
          dimmed={showBotDisconnected}
          value={<Switch checked={!!profile?.daySummary} onChange={toggleDaySummary} disabled={saveProfile.isPending} />}
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
        <BottomSheet title={m.profile_reminders_amount()} onClose={() => setRemindSheetOpen(false)}>
          <div className={styles['profile__sheet-list']}>
            {REMIND_CHOICES.map((minutes) => (
              <Cell
                key={minutes}
                title={m.profile_reminders_before({ minutes })}
                value={profile?.remindMinutes === minutes ? '✓' : undefined}
                valueColor="var(--ds-color-accent)"
                onClick={() => pickRemind(minutes)}
              />
            ))}
          </div>
        </BottomSheet>
      )}

      {agendaSheetOpen && (
        <BottomSheet title={m.profile_agenda_time_title()} onClose={closeAgendaSheet}>
          <div className={styles['profile__sheet-list']}>
            {AGENDA_TIME_PRESETS.map((t) => (
              <Cell
                key={t}
                title={t}
                value={t === profile?.morningAgendaAt ? '✓' : undefined}
                valueColor="var(--ds-color-accent)"
                onClick={() => pickAgendaTime(t)}
              />
            ))}
            <Cell
              title={m.profile_agenda_time_custom()}
              value={profile?.morningAgendaAt && !AGENDA_TIME_PRESETS.includes(profile.morningAgendaAt) ? '✓' : undefined}
              valueColor="var(--ds-color-accent)"
              onClick={openAgendaCustom}
            />
          </div>
          {agendaCustomOpen && (
            <div className={styles['profile__sheet-custom']}>
              <TextField header={m.profile_agenda_time_custom()} value={agendaCustomTime} onChange={setAgendaCustomTime} type="time" />
              <Button
                fullWidth
                disabled={!agendaCustomTime}
                loading={saveProfile.isPending}
                onClick={() => pickAgendaTime(agendaCustomTime)}
              >
                {m.form_save()}
              </Button>
            </div>
          )}
          <div className={styles['profile__sheet-footer']}>{m.profile_agenda_time_footer({ tz: currentZone() })}</div>
          <div className={styles['profile__sheet-footer']}>
            {m.profile_agenda_time_hint({
              time: profile?.morningAgendaAt ?? '08:00',
              count: lessonsCountLabel(profile?.tomorrowLessonsCount ?? 0, locale),
            })}
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
