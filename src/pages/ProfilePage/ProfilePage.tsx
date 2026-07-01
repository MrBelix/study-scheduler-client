import { type ReactNode } from 'react';
import { NavHeader, Section, Cell, Avatar } from '@/shared/ui';
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
  return (
    <div className={styles['profile']}>
      <NavHeader title="Профіль" />

      <div className={styles['profile__header']}>
        <Avatar name="Олена Гриценко" size={88} />
        <div className={styles['profile__name']}>Олена Гриценко</div>
        <div className={styles['profile__username']}>@olena_tutor</div>
      </div>

      <Section header="Налаштування">
        <Cell
          inset={56}
          leading={
            <Tile color="#8e8e93">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.9" />
              <path d="M12 3.5v17" stroke="currentColor" strokeWidth="1.9" />
              <path d="M12 3.5a8.5 8.5 0 010 17" fill="currentColor" />
            </Tile>
          }
          title="Тема"
          value="Авто"
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
          title="Мова"
          value="Українська"
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
          title="Політика скасування"
          chevron
        />
      </Section>

      <Section header="Про застосунок">
        <Cell title="Версія" value="1.0.0" />
      </Section>

      <div className={styles['profile__footer']}>
        Тема й мова визначаються Telegram. StudyScheduler · Mini App у Telegram
      </div>
    </div>
  );
}
