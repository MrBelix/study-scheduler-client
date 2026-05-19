import { Tabbar } from '@telegram-apps/telegram-ui'
import type { ReactNode, SVGProps } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

type TabId = 'home' | 'students' | 'schedule' | 'finance' | 'settings'

const tabs: { id: TabId; path: string; label: string }[] = [
  { id: 'students', path: '/students', label: 'Учні'     },
  { id: 'schedule', path: '/schedule', label: 'Розклад'  },
  { id: 'home',     path: '/',         label: 'Сьогодні' },
  { id: 'finance',  path: '/finance',  label: 'Фінанси'  },
  { id: 'settings', path: '/settings', label: 'Налаш.'   },
]

function pathToTab(pathname: string): TabId {
  if (pathname.startsWith('/students')) return 'students'
  if (pathname.startsWith('/schedule')) return 'schedule'
  if (pathname.startsWith('/finance'))  return 'finance'
  if (pathname.startsWith('/settings')) return 'settings'
  return 'home'
}

// Icons — 28×28 as required by Tabbar.Item
type Icon = (p: SVGProps<SVGSVGElement>) => ReactNode

const HomeIcon: Icon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" width={28} height={28} {...p}>
    <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-3v-7H8v7H5a2 2 0 0 1-2-2v-9Z"
      stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
  </svg>
)
const PeopleIcon: Icon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" width={28} height={28} {...p}>
    <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7"/>
    <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M3 19c.4-3 3-5 6-5s5.6 2 6 5M15 19c.4-2.4 2.2-4 4.5-4S23 16.4 23 19"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
)
const CalIcon: Icon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" width={28} height={28} {...p}>
    <rect x="3.2" y="5" width="17.6" height="16" rx="2.6" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M3.2 10h17.6M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
)
const WalletIcon: Icon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" width={28} height={28} {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2.6" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M16 12.5h2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M3 9.5h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3" stroke="currentColor" strokeWidth="1.7"/>
  </svg>
)
const GearIcon: Icon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" width={28} height={28} {...p}>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M19.4 13.6c.04-.5.08-1.05.08-1.6s-.04-1.1-.08-1.6l2.1-1.6-2-3.5-2.5 1c-.8-.6-1.7-1.05-2.6-1.4L14 2.5h-4l-.4 2.4c-.9.3-1.8.8-2.6 1.4l-2.5-1-2 3.5 2.1 1.6c-.04.5-.08 1.05-.08 1.6s.04 1.1.08 1.6L2.5 15.2l2 3.5 2.5-1c.8.6 1.7 1.05 2.6 1.4l.4 2.4h4l.4-2.4c.9-.3 1.8-.8 2.6-1.4l2.5 1 2-3.5-2.1-1.6Z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)

function tabIcon(id: TabId): ReactNode {
  if (id === 'home')     return <HomeIcon />
  if (id === 'students') return <PeopleIcon />
  if (id === 'schedule') return <CalIcon />
  if (id === 'finance')  return <WalletIcon />
  return <GearIcon />
}

export const AppLayout = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const active = pathToTab(pathname)

  return (
    <div className="app-layout">
      <main className="app-layout__content">
        <Outlet />
      </main>
      <Tabbar className="app-tabbar">
        {tabs.map(({ id, path, label }) => (
          <Tabbar.Item
            key={id}
            text={label}
            selected={active === id}
            onClick={() => navigate(path)}
          >
            {tabIcon(id)}
          </Tabbar.Item>
        ))}
      </Tabbar>
    </div>
  )
}
