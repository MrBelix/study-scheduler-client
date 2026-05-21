import {Button, FixedLayout, Input, LargeTitle, Section} from "@telegram-apps/telegram-ui";

const CreateStudentForm = () => (<Section header="Персональна інформація">
    <div>
        <Input header="Імя"/>
        <Input header="опис"/>
        <FixedLayout>
            <Button size="l" mode="filled" stretched={true}>Додати учня</Button>
        </FixedLayout>
    </div>
</Section>)

export const CreateStudentPage = () => {
    
    return (<section>
        <LargeTitle>Новий учень</LargeTitle>
        <CreateStudentForm />
    </section>);
}