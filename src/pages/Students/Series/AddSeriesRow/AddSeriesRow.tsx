import { useNavigate } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Icon } from '@/shared/ui';
import { routes } from '@/shared/routing';
import styles from './AddSeriesRow.module.scss';

interface AddSeriesRowProps {
  studentId: string;
}

/** Dashed row at the end of the series list — opens the unified create form, preselected to this student with "Щотижня" already on. */
export function AddSeriesRow({ studentId }: AddSeriesRowProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={styles['add']}
      onClick={() => navigate(routes.lessons.new({ studentId, repeat: 'weekly' }))}
    >
      <Icon name="add" size={20} />
      {m.series_add_action()}
    </button>
  );
}
