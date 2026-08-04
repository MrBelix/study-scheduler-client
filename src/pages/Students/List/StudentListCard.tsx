import { useNavigate } from 'react-router-dom';
import { Section, Cell, Avatar } from '@/shared/ui';
import type { Student } from '@/shared/api';
import { routes } from '@/shared/routing';
import { formatNextLesson } from '@/features/students/model';

interface StudentListCardProps {
  students: Student[];
  /** De-emphasize every row — the archived view. */
  dimmed?: boolean;
}

/** Section of student rows — avatar, name, next-lesson subtitle, chevron to the detail page. */
export function StudentListCard({ students, dimmed }: StudentListCardProps) {
  const navigate = useNavigate();
  return (
    <Section>
      {students.map((student) => (
        <Cell
          key={student.id}
          leading={<Avatar name={student.name} size={42} />}
          title={student.name}
          subtitle={formatNextLesson(student.nextLesson)}
          chevron
          inset={70}
          minHeight={60}
          dimmed={dimmed}
          onClick={() => navigate(routes.students.details(student.id))}
        />
      ))}
    </Section>
  );
}
