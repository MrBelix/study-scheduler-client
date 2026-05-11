import { useState } from 'react'
import {
  AppRoot,
  List,
  Section,
  Cell,
  Button,
  Title,
  Caption,
  Avatar,
  Placeholder,
  Card,
} from '@telegram-apps/telegram-ui'
import {
  useSignal,
  initData,
  miniApp,
  themeParams,
} from '@telegram-apps/sdk-react'

function App() {
  const [count, setCount] = useState(0)

  // Реактивні значення з Telegram SDK.
  const user = useSignal(initData.user)
  const isDark = useSignal(miniApp.isDark)
  const tp = useSignal(themeParams.state)

  const platform: 'ios' | 'base' =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod|macintosh/i.test(navigator.userAgent)
      ? 'ios'
      : 'base'

  return (
    <AppRoot appearance={isDark ? 'dark' : 'light'} platform={platform}>
      <Placeholder
        header="Telegram Mini App"
        description="React + Vite + @telegram-apps/telegram-ui"
      />

      <List>
        <Section header="Користувач" footer="Дані отримано з initData Telegram">
          {user ? (
            <Cell
              before={
                <Avatar
                  size={48}
                  fallbackIcon={<span>{user.first_name?.[0] ?? '?'}</span>}
                />
              }
              subtitle={user.username ? `@${user.username}` : 'Без username'}
            >
              {user.first_name} {user.last_name ?? ''}
            </Cell>
          ) : (
            <Cell subtitle="Запустіть застосунок у Telegram">
              Користувач не визначений
            </Cell>
          )}
        </Section>

        <Section header="Демо UI компонентів">
          <Cell subtitle="Натисніть, щоб збільшити лічильник">
            <Button size="m" onClick={() => setCount((c) => c + 1)}>
              Лічильник: {count}
            </Button>
          </Cell>
          <Cell subtitle={`Поточна тема: ${isDark ? 'темна' : 'світла'}`}>
            Telegram theme
          </Cell>
        </Section>

        <Section header="Тема Telegram">
          <Card style={{ padding: 16, margin: 12 }}>
            <Title level="3">Параметри теми</Title>
            <Caption>BG: {tp.bgColor ?? '—'}</Caption>
            <br />
            <Caption>Text: {tp.textColor ?? '—'}</Caption>
            <br />
            <Caption>Accent: {tp.accentTextColor ?? '—'}</Caption>
          </Card>
        </Section>
      </List>
    </AppRoot>
  )
}

export default App
