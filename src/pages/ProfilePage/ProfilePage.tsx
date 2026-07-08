import { useState, type ReactNode } from 'react';
import { m } from '@/paraglide/messages';
import { Section, Cell, Avatar, SearchInput, BottomSheet, Skeleton } from '@/shared/ui';
import { useLocale, LOCALE_NAMES } from '@/shared/i18n';
import { haptic, getTelegramUser } from '@/shared/tg';
import { useProfile, useSaveProfile, useTimeZones } from '@/features/profile/queries';
import { version as appVersion } from '../../../package.json';
import styles from './ProfilePage.module.scss';

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
  const { data: profile } = useProfile();
  const { data: timeZones } = useTimeZones();
  const saveProfile = useSaveProfile();

  const [tzSheetOpen, setTzSheetOpen] = useState(false);
  const [tzQuery, setTzQuery] = useState('');

  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Language lives in the member settings on the server. The first save may
  // happen before a time zone was ever chosen — default it to the device zone
  // (PUT requires one; it is also what the onboarding would have suggested).
  const toggleLanguage = () => {
    haptic('light');
    const next = locale === 'uk' ? 'en' : 'uk';
    setLocale(next);
    saveProfile.mutate({ timeZoneId: profile?.timeZoneId ?? detected, languageCode: next });
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

  return (
    <div className={styles['profile']}>
      {displayName && (
        <div className={styles['profile__header']}>
          <Avatar name={displayName} size={88} />
          <div className={styles['profile__name']}>{displayName}</div>
          {tgUser?.username && <div className={styles['profile__username']}>@{tgUser.username}</div>}
        </div>
      )}

      <Section
        header={m.profile_settings()}
        footer={saveProfile.isError ? undefined : m.profile_timezone_footer()}
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
