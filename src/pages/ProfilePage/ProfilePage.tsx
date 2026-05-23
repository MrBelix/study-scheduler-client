import { Section } from '../../shared/ui/Section/Section';
import { Cell } from '../../shared/ui/Cell/Cell';
import styles from './ProfilePage.module.scss';

function ChevronRight() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
      <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className={styles['profile-page__cell-icon']} width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className={styles['profile-page__cell-icon']} width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className={styles['profile-page__cell-icon']} width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className={styles['profile-page__cell-icon']} width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

export function ProfilePage() {
  return (
    <div className={styles['profile-page']}>
      <div className={styles['profile-page__avatar-section']}>
        <div className={styles['profile-page__avatar']}>ОК</div>
        <div className={styles['profile-page__name']}>Олена Коваленко</div>
        <div className={styles['profile-page__role']}>Репетитор · Математика та фізика</div>
      </div>

      <Section>
        <Cell title="Telegram" subtitle="@tutor_olena" />
        <Cell title="Телефон" subtitle="+380 93 123-45-67" />
        <Cell title="Email" subtitle="o.kovalenko@gmail.com" />
      </Section>

      <Section header="Налаштування">
        <Cell
          before={<BellIcon />}
          title="Сповіщення"
          after={<ChevronRight />}
          onClick={() => {}}
        />
        <Cell
          before={<MoonIcon />}
          title="Тема"
          after={
            <span className={styles['profile-page__value-hint']}>
              Автоматично <ChevronRight />
            </span>
          }
          onClick={() => {}}
        />
        <Cell
          before={<GlobeIcon />}
          title="Мова"
          after={
            <span className={styles['profile-page__value-hint']}>
              Українська <ChevronRight />
            </span>
          }
          onClick={() => {}}
        />
        <Cell
          before={<InfoIcon />}
          title="Про застосунок"
          after={<ChevronRight />}
          onClick={() => {}}
        />
      </Section>
    </div>
  );
}
