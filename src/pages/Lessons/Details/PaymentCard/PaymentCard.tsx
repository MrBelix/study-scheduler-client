import { m } from '@/paraglide/messages';
import { Section, Cell, Switch } from '@/shared/ui';
import { money } from '@/shared/lib';
import styles from './PaymentCard.module.scss';

interface PaymentCardProps {
  price: number;
  paid: boolean;
  /** True while a cancelled lesson (backend refuses `isPaid: true` on one) or a save is in flight. */
  disabled: boolean;
  onTogglePaid: (checked: boolean) => void;
}

/** "ОПЛАТА" card — price row + the paid switch. See design-system.html F2 lines 490-508. */
export function PaymentCard({ price, paid, disabled, onTogglePaid }: PaymentCardProps) {
  return (
    <Section header={m.lesson_payment_section()}>
      <Cell title={m.lesson_price()} value={<span className={styles.price}>{money(price)}</span>} />
      <Cell
        title={m.lesson_paid()}
        subtitle={m.lesson_paid_hint()}
        plainTitle
        value={<Switch checked={paid} onChange={onTogglePaid} disabled={disabled} />}
      />
    </Section>
  );
}
