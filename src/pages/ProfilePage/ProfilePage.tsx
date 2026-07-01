import { type ReactNode } from 'react';
import { m } from '@/paraglide/messages';
import { Section, Cell, Avatar } from '@/shared/ui';
import { useLocale, LOCALE_NAMES } from '@/shared/i18n';
import { haptic } from '@/shared/tg';
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

  const toggleLanguage = () => {
    haptic('light');
    setLocale(locale === 'uk' ? 'en' : 'uk');
  };

  return (
    <div className={styles['profile']}>
      <div className={styles['profile__header']}>
        <Avatar name="Олена Гриценко" size={88} />
        <div className={styles['profile__name']}>Олена Гриценко</div>
        <div className={styles['profile__username']}>@olena_tutor</div>
      </div>

      <Section header={m.profile_settings()}>
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

      <Section header={m.profile_about()}>
        <Cell title={m.profile_version()} value="1.0.0" />
      </Section>

      <div className={styles['profile__footer']}>{m.profile_footer()}</div>
    </div>
  );
}
