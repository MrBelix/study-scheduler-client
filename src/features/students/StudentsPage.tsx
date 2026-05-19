import {Avatar, Cell, IconButton, LargeTitle, Section} from "@telegram-apps/telegram-ui";
import {Icon28AddCircle} from "@telegram-apps/telegram-ui/dist/icons/28/add_circle";

const getInitials = (str: string) => str.split(' ').slice(0, 2).map(w => w[0]).join('');
interface Student {
    name: string,
    credits: number,
}

const CreditTransaction = ({amount} : {amount: number}) => {
    const isPositive = amount > 0;
    const isZero = amount === 0;

    const color = isZero
        ? 'var(--tg-theme-text-color)'
        : isPositive
            ? 'var(--tgui--green)'
            : 'var(--tgui--destructive_text_color)';

    const sign = isZero ? '' : isPositive ? '+' : '−';
    const formattedAmount = Math.abs(amount).toLocaleString('uk-UA').replace(',', ' ');

    return (<span style={{ color, fontWeight: 600 }}>{sign}₴{formattedAmount}</span>);
};
const PageHeader = () => (
    <section className="d-flex justify-space-between align-items-center">
        <LargeTitle>Учні</LargeTitle>
        <IconButton size="s">
            <Icon28AddCircle />
        </IconButton>
    </section>);

const StudentItem = ({name, credits}: Student) => (<Cell
    after={<CreditTransaction amount={credits}/>}
    before={<Avatar size={40} acronym={getInitials(name)}/>}>
    {name}
</Cell>)

const StudentsList = () => {
    const items = [
        {name: "Анна Коваленко", credits: -1200},
        {name: "Максим Іщенко", credits: 550},
        {name: "Софія Бондар", credits: 0},
    ]
    return <Section style={{marginBlockStart: 32}}>
        {items.map(({name, credits}) => <StudentItem name={name} credits={credits}/>)}
    </Section>
};

export const StudentsPage = () => (<>
        <PageHeader/>
        <StudentsList/>
    </>)