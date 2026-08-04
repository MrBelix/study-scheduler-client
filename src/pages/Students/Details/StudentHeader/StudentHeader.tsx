import { Avatar } from '@/shared/ui';
import { m } from '@/paraglide/messages';
import { money } from '@/shared/lib';
import styles from './StudentHeader.module.scss';

interface StudentHeaderProps {
  name: string;
  rate: number;
}

/** Avatar + name + rate line — top of the student detail page. */
export function StudentHeader({ name, rate }: StudentHeaderProps) {
  return (
    <div className={styles['header']}>
      <Avatar name={name} size={56} />
      <div className={styles['headerText']}>
        <span className={styles['name']}>{name}</span>
        <span className={styles['rate']}>{rate ? m.detail_header_rate({ money: money(rate) }) : m.value_none()}</span>
      </div>
    </div>
  );
}
