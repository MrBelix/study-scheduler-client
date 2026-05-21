// MD3 student detail — hero avatar, stat grid, "record payment" CTA,
// subjects list, history list.
import {
  Add, ArrowBack, CalendarMonth, Chat, Edit,
  MoreVert, NotificationsActive, Wallet,
} from '@mui/icons-material'
import {
  Box, Button, IconButton, List, ListItem, ListItemAvatar, ListItemText,
  Stack, Typography,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import {
  SectionHeader, StatCard, StudentAvatar,
  balanceLabel, formatHryvnia, md3Light,
} from '../../../shared/ui'
import { SubjectTile } from '../components/SubjectTile'
import { HISTORY, STUDENTS } from '../mock'

const TopBar = ({ onBack }: { onBack: () => void }) => (
  <Stack direction="row" alignItems="center" sx={{
    height: 64, paddingInline: '4px', backgroundColor: md3Light.surface, flexShrink: 0,
  }}>
    <IconButton onClick={onBack}><ArrowBack /></IconButton>
    <Box sx={{ flex: 1 }} />
    <IconButton><Edit /></IconButton>
    <IconButton><MoreVert /></IconButton>
  </Stack>
)

export const StudentDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const s = STUDENTS.find(x => x.id === id) ?? STUDENTS[0]

  const debtLessons = Math.abs(Math.round(s.balance / s.subjects[0].rate))

  return (
    <>
      <TopBar onBack={() => navigate(-1)} />

      <Stack alignItems="center" sx={{ padding: '8px 16px 16px' }}>
        <StudentAvatar name={s.name} color={s.color} size={96} />
        <Typography sx={{ marginTop: '12px', fontSize: 24, lineHeight: '32px', fontWeight: 400 }}>
          {s.name}
        </Typography>
        <Typography sx={{ marginTop: '4px', fontSize: 14, lineHeight: '20px', letterSpacing: '0.25px', color: md3Light.onSurfaceVariant }}>
          {s.balance < 0
            ? `борг ₴${formatHryvnia(s.balance)} · ${debtLessons} уроки`
            : s.balance > 0
              ? `передоплата ${balanceLabel(s.balance)}`
              : 'баланс нульовий'}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ marginTop: 2 }}>
          <Button variant="contained" startIcon={<Chat />}>Telegram</Button>
          <Button
            variant="contained"
            startIcon={<NotificationsActive />}
            sx={{ backgroundColor: md3Light.secondaryContainer, color: md3Light.onSecondaryContainer,
              '&:hover': { backgroundColor: md3Light.secondaryContainer } }}
          >
            Нагадати
          </Button>
          <IconButton sx={{ border: `1px solid ${md3Light.outline}` }}><Add /></IconButton>
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px 16px' }}>
        <StatCard
          variant={s.balance < 0 ? 'error' : 'tertiary'}
          label="Поточний баланс"
          value={balanceLabel(s.balance)}
          sub={s.balance < 0 ? `${debtLessons} уроки не оплачено` : 'усе сплачено'}
        />
        <StatCard
          label="Усього уроків"
          value={String(s.lessons)}
          sub="з вересня '25"
        />
      </Box>

      <Box sx={{ padding: '0 16px 16px' }}>
        <Button variant="contained" fullWidth size="large" startIcon={<Wallet />}>
          Записати оплату
        </Button>
      </Box>

      <SectionHeader>Предмети</SectionHeader>
      <List sx={{ paddingBlock: 0 }}>
        {s.subjects.map((sub, i) => (
          <ListItem key={sub.name} sx={{ minHeight: 72 }}>
            <ListItemAvatar>
              <SubjectTile
                letter={sub.name[0]}
                tint={i === 0 ? 'primary' : i === 1 ? 'tertiary' : 'neutral'}
              />
            </ListItemAvatar>
            <ListItemText
              primary={sub.name}
              secondary={i === 0 ? 'Вт, Чт · 17:00 — 60 хв' : 'Пн · 16:00 — 45 хв'}
              primaryTypographyProps={{ fontSize: 16, lineHeight: '24px', letterSpacing: '0.5px' }}
              secondaryTypographyProps={{ fontSize: 14, lineHeight: '20px', letterSpacing: '0.25px', color: md3Light.onSurfaceVariant }}
            />
            <Typography sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500, fontSize: 14 }}>
              ₴{sub.rate}
            </Typography>
          </ListItem>
        ))}
        <ListItem sx={{ minHeight: 56, cursor: 'pointer' }}>
          <ListItemAvatar><SubjectTile letter="+" tint="neutral" /></ListItemAvatar>
          <ListItemText
            primary="Додати предмет"
            primaryTypographyProps={{ color: md3Light.primary, fontSize: 16, lineHeight: '24px', letterSpacing: '0.5px' }}
          />
        </ListItem>
      </List>

      <SectionHeader>Історія</SectionHeader>
      <List sx={{ paddingBlock: 0 }}>
        {HISTORY.map((h, i) => {
          const isPay = h.kind === 'pay'
          return (
            <ListItem key={i} sx={{ minHeight: 72 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ marginRight: 2 }}>
                <Box sx={{ width: 36, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 11, lineHeight: '16px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', color: md3Light.onSurfaceVariant }}>
                    {h.day}
                  </Typography>
                  <Typography sx={{ fontSize: 14, lineHeight: '20px', fontWeight: 500 }}>
                    {h.date.split(' ')[0]}
                  </Typography>
                </Box>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '12px',
                  background: isPay ? md3Light.tertiaryContainer : md3Light.surfaceContainerHigh,
                  color: isPay ? md3Light.onTertiaryContainer : md3Light.onSurfaceVariant,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isPay ? <Wallet sx={{ fontSize: 20 }} /> : <CalendarMonth sx={{ fontSize: 20 }} />}
                </Box>
              </Stack>
              <ListItemText
                primary={h.label}
                secondary={h.note}
                primaryTypographyProps={{ fontSize: 16, lineHeight: '24px', letterSpacing: '0.5px' }}
                secondaryTypographyProps={{ fontSize: 14, lineHeight: '20px', letterSpacing: '0.25px', color: md3Light.onSurfaceVariant }}
              />
              <Typography sx={{
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 500,
                color: isPay ? md3Light.tertiary : md3Light.onSurface,
              }}>
                {isPay ? '+' : ''}₴{formatHryvnia(h.amount)}
              </Typography>
            </ListItem>
          )
        })}
      </List>

      <Box sx={{ height: 32 }} />
    </>
  )
}
