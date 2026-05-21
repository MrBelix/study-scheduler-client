// MD3 students list — large top bar, M3 search, filter chips,
// student rows with colored avatars, FAB Extended for adding a student.
import {
  Add, FilterList, MoreVert, Search,
} from '@mui/icons-material'
import {
  Box, Chip, Fab, IconButton, InputBase,
  List, ListItem, ListItemAvatar, ListItemText, Stack, Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  StudentAvatar, balanceColor, balanceLabel,
} from '../../md3/components'
import { md3Light } from '../../md3/theme'
import { STUDENTS, type Student } from './mock'

// ────────────────────────────────────────────────────────────────────
// M3 Large Top App Bar — icon row + title + subtitle stacked.
// ────────────────────────────────────────────────────────────────────
const LargeTopBar = ({
  title, subtitle, trailing,
}: { title: string; subtitle?: string; trailing?: React.ReactNode }) => (
  <Box sx={{ flexShrink: 0, paddingInline: '4px', paddingBottom: '20px', backgroundColor: md3Light.surface }}>
    <Stack direction="row" alignItems="center" sx={{ height: 64, gap: '4px' }}>
      <Box sx={{ width: 4 }} />
      <Box sx={{ flex: 1 }} />
      {trailing}
    </Stack>
    <Typography sx={{ paddingInline: '12px', marginTop: '24px', fontSize: 28, lineHeight: '36px', fontWeight: 400, color: md3Light.onSurface }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography sx={{ paddingInline: '16px', paddingTop: '2px', fontSize: 14, lineHeight: '20px', letterSpacing: '0.25px', color: md3Light.onSurfaceVariant }}>
        {subtitle}
      </Typography>
    )}
  </Box>
)

const SearchBar = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <Box
    sx={{
      margin: '8px 16px 0',
      height: 56,
      borderRadius: '28px',
      backgroundColor: md3Light.surfaceContainerHigh,
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px 0 16px',
      gap: '16px',
      color: md3Light.onSurfaceVariant,
    }}
  >
    <Search />
    <InputBase
      placeholder="Знайти учня…"
      value={value}
      onChange={e => onChange(e.target.value)}
      sx={{ flex: 1, fontSize: 16, lineHeight: '24px', letterSpacing: '0.5px', color: md3Light.onSurface }}
    />
    <IconButton size="small"><FilterList /></IconButton>
  </Box>
)

type Filter = 'all' | 'debt' | 'no_schedule' | 'new'

const FILTERS: { id: Filter; label: (s: Student[]) => string; predicate: (s: Student) => boolean }[] = [
  { id: 'all',         label: s => `Усі · ${s.length}`,                                   predicate: () => true                    },
  { id: 'debt',        label: s => `Боргують · ${s.filter(x => x.balance < 0).length}`,   predicate: s => s.balance < 0            },
  { id: 'no_schedule', label: s => `Без розкладу · ${s.filter(x => x.next === '—').length}`, predicate: s => s.next === '—'        },
  { id: 'new',         label: () => 'Нові',                                                predicate: s => s.lessons < 5            },
]

export const StudentsPage = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const filtered = STUDENTS
    .filter(FILTERS.find(f => f.id === filter)!.predicate)
    .filter(s => s.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <>
      <LargeTopBar
        title="Учні"
        subtitle={`${STUDENTS.length} активних`}
        trailing={<>
          <IconButton><Search /></IconButton>
          <IconButton><MoreVert /></IconButton>
        </>}
      />

      <SearchBar value={query} onChange={setQuery} />

      <Stack direction="row" spacing={1} sx={{ padding: '14px 16px 4px', overflowX: 'auto' }}>
        {FILTERS.map(f => (
          <Chip
            key={f.id}
            label={f.label(STUDENTS)}
            clickable
            variant={filter === f.id ? 'filled' : 'outlined'}
            onClick={() => setFilter(f.id)}
          />
        ))}
      </Stack>

      <List sx={{ marginTop: '8px', paddingBlock: 0 }}>
        {filtered.map(s => (
          <ListItem
            key={s.id}
            onClick={() => navigate(`/students/${s.id}`)}
            sx={{
              minHeight: 72,
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
            }}
          >
            <ListItemAvatar>
              <StudentAvatar name={s.name} color={s.color} />
            </ListItemAvatar>
            <ListItemText
              primary={s.name}
              secondary={
                s.subjects.length === 1
                  ? `${s.subjects[0].name} · ${s.next}`
                  : `${s.subjects[0].name} +${s.subjects.length - 1} · ${s.next}`
              }
              primaryTypographyProps={{ fontSize: 16, lineHeight: '24px', letterSpacing: '0.5px' }}
              secondaryTypographyProps={{ fontSize: 14, lineHeight: '20px', letterSpacing: '0.25px', color: md3Light.onSurfaceVariant }}
            />
            <Typography sx={{ color: balanceColor(s.balance), fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
              {balanceLabel(s.balance)}
            </Typography>
          </ListItem>
        ))}
      </List>

      {/* Spacer so FAB doesn't overlap last row */}
      <Box sx={{ height: 100 }} />

      <Fab
        variant="extended"
        color="primary"
        onClick={() => navigate('/students/create')}
        sx={{
          position: 'fixed',
          right: 16,
          bottom: `calc(96px + var(--tg-safe-area-inset-bottom, 0px))`,
          backgroundColor: md3Light.primaryContainer,
          color: md3Light.onPrimaryContainer,
          borderRadius: '16px',
          height: 56,
          '&:hover': { backgroundColor: md3Light.primaryContainer },
        }}
      >
        <Add sx={{ marginRight: 1 }} />
        Учень
      </Fab>
    </>
  )
}
