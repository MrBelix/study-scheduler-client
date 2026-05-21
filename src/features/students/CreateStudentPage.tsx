// MD3 add-student form — avatar with editable swatch, name & nickname
// text fields, color swatch picker, subjects list, recurring-schedule
// toggle, day chips, time/notification rows, full-width submit.
import {
  ArrowBack, Check, Edit, NotificationsActive,
  Repeat, Schedule,
} from '@mui/icons-material'
import {
  Avatar, Box, Button, Chip, IconButton, List, ListItem, ListItemAvatar,
  ListItemText, Stack, Switch, TextField, Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionHeader } from '../../md3/components'
import { md3Light } from '../../md3/theme'
import { COLORS } from './mock'

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'] as const
type Day = (typeof DAYS)[number]

const TopBar = ({ onBack, title }: { onBack: () => void; title: string }) => (
  <Stack direction="row" alignItems="center" sx={{
    height: 64, paddingInline: '4px', backgroundColor: md3Light.surface, flexShrink: 0, gap: '4px',
  }}>
    <IconButton onClick={onBack}><ArrowBack /></IconButton>
    <Typography sx={{ flex: 1, fontSize: 22, lineHeight: '28px', marginLeft: '12px' }}>
      {title}
    </Typography>
  </Stack>
)

const SubjectTile = ({ letter, tint }: { letter: string; tint: 'primary' | 'tertiary' | 'neutral' }) => {
  const bg = tint === 'primary' ? md3Light.primaryContainer
    : tint === 'tertiary' ? md3Light.tertiaryContainer
    : md3Light.surfaceContainerHigh
  const fg = tint === 'primary' ? md3Light.onPrimaryContainer
    : tint === 'tertiary' ? md3Light.onTertiaryContainer
    : md3Light.onSurfaceVariant
  return (
    <Box sx={{
      width: 40, height: 40, borderRadius: '12px',
      background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 500, fontSize: 16,
    }}>
      {letter}
    </Box>
  )
}

export const CreateStudentPage = () => {
  const navigate = useNavigate()
  const [colorIdx, setColorIdx]   = useState(5)
  const [recur, setRecur]         = useState(true)
  const [notif, setNotif]         = useState(true)
  const [days, setDays]           = useState<Record<Day, boolean>>({
    Пн: false, Вт: true, Ср: false, Чт: true, Пт: false, Сб: false, Нд: false,
  })
  const toggleDay = (d: Day) => setDays(prev => ({ ...prev, [d]: !prev[d] }))

  return (
    <>
      <TopBar onBack={() => navigate(-1)} title="Новий учень" />

      {/* Hero avatar w/ edit chip */}
      <Stack alignItems="center" sx={{ padding: '8px 16px 16px' }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar sx={{
            width: 96, height: 96, bgcolor: COLORS[colorIdx],
            color: '#fff', fontSize: 36, fontWeight: 500,
          }}>СД</Avatar>
          <IconButton sx={{
            position: 'absolute', right: -4, bottom: -4,
            width: 36, height: 36, borderRadius: '12px',
            backgroundColor: md3Light.primary, color: md3Light.onPrimary,
            '&:hover': { backgroundColor: md3Light.primary },
          }}>
            <Edit sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Stack>

      <SectionHeader>Картка</SectionHeader>
      <Stack spacing={2} sx={{ padding: '0 16px 8px' }}>
        <TextField label="Ім'я *" placeholder="Софія Дем'яненко" />
        <TextField label="Нік / клас" placeholder="оп." />
      </Stack>

      <SectionHeader>Колір у розкладі</SectionHeader>
      <Stack direction="row" spacing="14px" sx={{ padding: '8px 16px 16px', flexWrap: 'wrap', rowGap: '14px' }}>
        {COLORS.map((c, i) => (
          <Box
            key={c}
            component="button"
            onClick={() => setColorIdx(i)}
            aria-pressed={i === colorIdx}
            sx={{
              width: 36, height: 36, borderRadius: '50%',
              background: c, border: 0, cursor: 'pointer', position: 'relative',
              ...(i === colorIdx && {
                outline: `2px solid ${md3Light.primary}`,
                outlineOffset: 4,
              }),
              '&::after': i === colorIdx
                ? {
                    content: '""',
                    position: 'absolute', inset: 0,
                    borderRadius: 'inherit',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z' fill='white'/%3E%3C/svg%3E")`,
                    backgroundSize: '60%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }
                : {},
            }}
          />
        ))}
      </Stack>

      <SectionHeader>Предмети</SectionHeader>
      <List sx={{ paddingBlock: 0 }}>
        <ListItem sx={{ minHeight: 72 }}>
          <ListItemAvatar><SubjectTile letter="М" tint="primary" /></ListItemAvatar>
          <ListItemText
            primary="Математика"
            secondary="60 хв · постійний розклад"
            primaryTypographyProps={{ fontSize: 16, lineHeight: '24px', letterSpacing: '0.5px' }}
            secondaryTypographyProps={{ fontSize: 14, lineHeight: '20px', letterSpacing: '0.25px', color: md3Light.onSurfaceVariant }}
          />
          <Typography sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500, fontSize: 14 }}>₴600</Typography>
        </ListItem>
        <ListItem sx={{ minHeight: 72 }}>
          <ListItemAvatar><SubjectTile letter="У" tint="tertiary" /></ListItemAvatar>
          <ListItemText
            primary="Українська мова"
            secondary="45 хв · за запитом"
            primaryTypographyProps={{ fontSize: 16, lineHeight: '24px', letterSpacing: '0.5px' }}
            secondaryTypographyProps={{ fontSize: 14, lineHeight: '20px', letterSpacing: '0.25px', color: md3Light.onSurfaceVariant }}
          />
          <Typography sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500, fontSize: 14 }}>₴450</Typography>
        </ListItem>
        <ListItem sx={{ minHeight: 56, cursor: 'pointer' }}>
          <ListItemAvatar><SubjectTile letter="+" tint="neutral" /></ListItemAvatar>
          <ListItemText
            primary="Додати предмет"
            primaryTypographyProps={{ color: md3Light.primary, fontSize: 16, lineHeight: '24px', letterSpacing: '0.5px' }}
          />
        </ListItem>
      </List>

      <SectionHeader>Розклад</SectionHeader>
      <List sx={{ paddingBlock: 0 }}>
        <ListItem sx={{ minHeight: 72 }}>
          <ListItemAvatar><Repeat sx={{ color: md3Light.onSurfaceVariant }} /></ListItemAvatar>
          <ListItemText
            primary="Повторюваний урок"
            secondary="Створити при додаванні"
            primaryTypographyProps={{ fontSize: 16, lineHeight: '24px', letterSpacing: '0.5px' }}
            secondaryTypographyProps={{ fontSize: 14, lineHeight: '20px', letterSpacing: '0.25px', color: md3Light.onSurfaceVariant }}
          />
          <Switch checked={recur} onChange={e => setRecur(e.target.checked)} />
        </ListItem>
      </List>

      <Box sx={{ padding: '8px 16px 4px' }}>
        <Typography sx={{ fontSize: 12, lineHeight: '16px', fontWeight: 500, letterSpacing: '0.5px', color: md3Light.onSurfaceVariant, marginBottom: '8px' }}>
          Дні тижня
        </Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          {DAYS.map(d => (
            <Chip
              key={d}
              label={d}
              clickable
              variant={days[d] ? 'filled' : 'outlined'}
              onClick={() => toggleDay(d)}
            />
          ))}
        </Stack>
      </Box>

      <List sx={{ paddingBlock: 0 }}>
        <ListItem sx={{ minHeight: 72, cursor: 'pointer' }}>
          <ListItemAvatar><Schedule sx={{ color: md3Light.onSurfaceVariant }} /></ListItemAvatar>
          <ListItemText
            primary="Час"
            secondary="17:00 · 60 хв"
            primaryTypographyProps={{ fontSize: 16, lineHeight: '24px', letterSpacing: '0.5px' }}
            secondaryTypographyProps={{ fontSize: 14, lineHeight: '20px', letterSpacing: '0.25px', color: md3Light.onSurfaceVariant }}
          />
        </ListItem>
        <ListItem sx={{ minHeight: 72 }}>
          <ListItemAvatar><NotificationsActive sx={{ color: md3Light.onSurfaceVariant }} /></ListItemAvatar>
          <ListItemText
            primary="Нагадування"
            secondary="За 1 годину до уроку"
            primaryTypographyProps={{ fontSize: 16, lineHeight: '24px', letterSpacing: '0.5px' }}
            secondaryTypographyProps={{ fontSize: 14, lineHeight: '20px', letterSpacing: '0.25px', color: md3Light.onSurfaceVariant }}
          />
          <Switch checked={notif} onChange={e => setNotif(e.target.checked)} />
        </ListItem>
      </List>

      <Box sx={{ height: 100 }} />

      <Box sx={{
        position: 'sticky', bottom: 0,
        padding: '12px 16px 16px',
        backgroundColor: md3Light.surfaceContainer,
        display: 'flex',
      }}>
        <Button variant="contained" size="large" fullWidth startIcon={<Check />}
          onClick={() => navigate('/students')}>
          Додати учня
        </Button>
      </Box>
    </>
  )
}
