import { Section, Cell, Icon } from '@/shared/ui';
import styles from './ProfilePage.module.scss';

function ChevronRight() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
      <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          before={<Icon name="bell" size={22} className={styles['profile-page__cell-icon']} />}
          title="Сповіщення"
          after={<ChevronRight />}
          onClick={() => {}}
        />
        <Cell
          before={<Icon name="moon" size={22} className={styles['profile-page__cell-icon']} />}
          title="Тема"
          after={
            <span className={styles['profile-page__value-hint']}>
              Автоматично <ChevronRight />
            </span>
          }
          onClick={() => {}}
        />
        <Cell
          before={<Icon name="globe" size={22} className={styles['profile-page__cell-icon']} />}
          title="Мова"
          after={
            <span className={styles['profile-page__value-hint']}>
              Українська <ChevronRight />
            </span>
          }
          onClick={() => {}}
        />
        <Cell
          before={<Icon name="info" size={22} className={styles['profile-page__cell-icon']} />}
          title="Про застосунок"
          after={<ChevronRight />}
          onClick={() => {}}
        />
      </Section>
    </div>
  );
}
