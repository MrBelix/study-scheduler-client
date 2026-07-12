import { useState, type ReactNode } from 'react';
import { m } from '@/paraglide/messages';
import { Section, Cell, Avatar, SearchInput, BottomSheet, Skeleton } from '@/shared/ui';
import { useLocale, LOCALE_NAMES } from '@/shared/i18n';
import { haptic, getTelegramUser, openTelegramLink } from '@/shared/tg';
import { useProfile, useSaveProfile, useTimeZones } from '@/features/profile/queries';
import { version as appVersion } from '../../../package.json';
import styles from './ProfilePage.module.scss';

// @username of the notifications bot — used to deep-link the tutor back into
// its chat when notifications got disabled (see the reconnect prompt below).
const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME;

function Tile({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className={styles['profile__tile']} style={{ background: color }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        {children}
      </svg>
    </span>
  );
}

export function ProfilePage() {
  const { locale, setLocale } = useLocale();
  const { data: profile, isNotFound } = useProfile();
  const { data: timeZones } = useTimeZones();
  const saveProfile = useSaveProfile();

  // Every save PUTs the full profile, so acting before the stored profile is known
  // (still loading, or failed to load) would silently overwrite the stored time
  // zone with the device one. Only a confirmed 404 (onboarding) may proceed without it.
  const profileReady = profile !== undefined || isNotFound;

  const [tzSheetOpen, setTzSheetOpen] = useState(false);
  const [tzQuery, setTzQuery] = useState('');
  const [remindSheetOpen, setRemindSheetOpen] = useState(false);

  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // PUT always requires a time zone; before the profile exists, fall back to
  // the device zone (same as toggleLanguage below).
  const currentZone = () => profile?.timeZoneId ?? detected;

  // Language lives in the member settings on the server. The first save may
  // happen before a time zone was ever chosen — default it to the device zone
  // (PUT requires one; it is also what the onboarding would have suggested).
  const toggleLanguage = () => {
    if (!profileReady) return;
    haptic('light');
    const next = locale === 'uk' ? 'en' : 'uk';
    setLocale(next);
    saveProfile.mutate({ timeZoneId: currentZone(), languageCode: next });
  };

  // Bot reminder lead time: 0 = off (an omitted field keeps the stored value).
  const REMIND_CHOICES = [0, 15, 30, 60];
  const remindLabel = (minutes: number | null) =>
    minutes ? m.profile_reminders_before({ minutes }) : m.profile_reminders_off();

  const pickRemind = (minutes: number) => {
    if (!profileReady) return;
    haptic('light');
    saveProfile.mutate({ timeZoneId: currentZone(), remindMinutes: minutes });
    setRemindSheetOpen(false);
  };

  const toggleAfterLesson = () => {
    if (!profileReady) return;
    haptic('light');
    saveProfile.mutate({ timeZoneId: currentZone(), notifyAfterLesson: !(profile?.notifyAfterLesson ?? true) });
  };

  const pickTimeZone = (zone: string) => {
    if (!profileReady) return;
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

  // Notifications are only relevant if some notification is actually enabled.
  const notificationsEnabled =
    (profile?.remindMinutes != null && profile.remindMinutes !== 0) || !!profile?.notifyAfterLesson;
  const showBotDisconnected = !!profile && !profile.botReachable && notificationsEnabled;

  const reconnectBot = () => {
    haptic('medium');
    openTelegramLink(`https://t.me/${BOT_USERNAME}?start=notify`);
  };

  return (
    <div className={styles['profile']}>
      {displayName && (
        <div className={styles['profile__header']}>
          <Avatar name={displayName} size={88} />
          <div className={styles['profile__name']}>{displayName}</div>
          {tgUser?.username && <div className={styles['profile__username']}>@{tgUser.username}</div>}
        </div>
      )}

      {showBotDisconnected && (
        <Section>
          <Cell
            leading={
              <Tile color="var(--ds-color-danger)">
                <path
                  d="M12 8v5M12 16.5h.01"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
                <path
                  d="M10.6 4.3a1.6 1.6 0 012.8 0l7.7 13.4a1.6 1.6 0 01-1.4 2.4H4.3a1.6 1.6 0 01-1.4-2.4l7.7-13.4z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </Tile>
            }
            title={<span style={{ color: 'var(--ds-color-danger)', fontWeight: 600 }}>{m.profile_bot_disconnected()}</span>}
            subtitle={m.profile_bot_reconnect()}
            chevron
            onClick={reconnectBot}
          />
        </Section>
      )}

      <Section
        header={m.profile_settings()}
        footer={saveProfile.isError ? undefined : `${m.profile_timezone_footer()} ${m.profile_notifications_footer()}`}
      >
        <Cell
          inset={56}
          leading={
            <Tile color="#5856d6">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.9" />
              <path d="M12 7v5l3.2 2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            </Tile>
          }
          title={m.profile_timezone()}
          value={profile?.timeZoneId ?? m.value_none()}
          chevron
          onClick={() => setTzSheetOpen(true)}
        />
        <Cell
          inset={56}
          leading={
            <Tile color="#34c759">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.9" />
              <path
                d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </Tile>
          }
          title={m.profile_language()}
          value={LOCALE_NAMES[locale]}
          chevron
          onClick={toggleLanguage}
        />
        <Cell
          inset={56}
          leading={
            <Tile color="#af52de">
              <path
                d="M12 4a5.5 5.5 0 015.5 5.5c0 3.6 1 5 2 6H4.5c1-1 2-2.4 2-6A5.5 5.5 0 0112 4z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M10 18.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </Tile>
          }
          title={m.profile_reminders()}
          value={remindLabel(profile?.remindMinutes ?? null)}
          chevron
          onClick={() => setRemindSheetOpen(true)}
        />
        <Cell
          inset={56}
          leading={
            <Tile color="#30b0c7">
              <path
                d="M5 6.5h9M5 12h9M5 17.5h5"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
              <path d="M16 16.5l2 2 3.5-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </Tile>
          }
          title={m.profile_after_lesson()}
          value={(profile?.notifyAfterLesson ?? true) ? m.toggle_on() : m.toggle_off()}
          chevron
          onClick={toggleAfterLesson}
        />
        <Cell
          inset={56}
          leading={
            <Tile color="#8e8e93">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.9" />
              <path d="M12 3.5v17" stroke="currentColor" strokeWidth="1.9" />
              <path d="M12 3.5a8.5 8.5 0 010 17" fill="currentColor" />
            </Tile>
          }
          title={m.profile_theme()}
          value={m.profile_theme_auto()}
          chevron
        />
        <Cell
          inset={56}
          leading={
            <Tile color="#ff9500">
              <path
                d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </Tile>
          }
          title={m.profile_cancellation_policy()}
          chevron
        />
      </Section>
      {saveProfile.isError && <div className={styles['profile__error']}>{m.form_error_save()}</div>}

      <Section header={m.profile_about()}>
        <Cell title={m.profile_version()} value={appVersion} />
      </Section>

      <div className={styles['profile__footer']}>{m.profile_footer()}</div>

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
    </div>
  );
}
