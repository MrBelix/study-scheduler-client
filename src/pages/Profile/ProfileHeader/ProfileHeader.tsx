import { m } from '@/paraglide/messages';
import { Avatar } from '@/shared/ui';
import { getAppLocale } from '@/shared/i18n';
import { pluralUk } from '@/shared/lib';
import styles from './ProfileHeader.module.scss';

interface ProfileHeaderProps {
  name: string;
  /** Two-letter override (first + last initial) — falls back to Avatar's own single-letter derivation. */
  initials?: string;
  username?: string;
  /** Active students count — omitted from the subtitle while the list hasn't loaded yet. */
  studentsCount?: number;
}

/** "5 студентів" — locale-aware (uk has 3 plural forms, en just 2). */
function studentsCountLabel(count: number): string {
  if (getAppLocale() === 'uk') {
    return pluralUk(count, {
      one: m.profile_students_count_one({ count }),
      few: m.profile_students_count_few({ count }),
      many: m.profile_students_count_many({ count }),
    });
  }
  return count === 1 ? m.profile_students_count_one({ count }) : m.profile_students_count_many({ count });
}

/** Avatar + name + "@username · N студентів" — top of the profile page (design-system.html F10). */
export function ProfileHeader({ name, initials, username, studentsCount }: ProfileHeaderProps) {
  const parts: string[] = [];
  if (username) parts.push(`@${username}`);
  if (studentsCount != null) parts.push(studentsCountLabel(studentsCount));
  const subtitle = parts.join(' · ');

  return (
    <div className={styles['header']}>
      <Avatar name={name} initials={initials} size={56} />
      <div className={styles['headerText']}>
        <span className={styles['name']}>{name}</span>
        {subtitle && <span className={styles['subtitle']}>{subtitle}</span>}
      </div>
    </div>
  );
}
