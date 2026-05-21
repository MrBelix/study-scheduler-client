import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarMonth, CalendarMonthOutlined,
  Group, GroupOutlined,
  Home, HomeOutlined,
  Settings, SettingsOutlined,
  Wallet, WalletOutlined,
} from '@mui/icons-material'
import { MdNavBar, type NavItem } from '../ui'

type TabId = 'home' | 'students' | 'schedule' | 'finance' | 'settings'

function pathToTab(pathname: string): TabId {
  if (pathname.startsWith('/students')) return 'students'
  if (pathname.startsWith('/schedule')) return 'schedule'
  if (pathname.startsWith('/finance'))  return 'finance'
  if (pathname.startsWith('/settings')) return 'settings'
  return 'home'
}

export const AppLayout = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const active = pathToTab(pathname)

  const items: NavItem[] = [
    { id: 'home',     label: 'Сьогодні', icon: <Home />,          iconOutline: <HomeOutlined />,          onClick: () => navigate('/')         },
    { id: 'students', label: 'Учні',     icon: <Group />,         iconOutline: <GroupOutlined />,         onClick: () => navigate('/students') },
    { id: 'schedule', label: 'Розклад',  icon: <CalendarMonth />, iconOutline: <CalendarMonthOutlined />, onClick: () => navigate('/schedule') },
    { id: 'finance',  label: 'Фінанси',  icon: <Wallet />,        iconOutline: <WalletOutlined />,        onClick: () => navigate('/finance')  },
    { id: 'settings', label: 'Більше',   icon: <Settings />,      iconOutline: <SettingsOutlined />,      onClick: () => navigate('/settings') },
  ]

  return (
    <div className="app-layout">
      <main className="app-layout__content">
        <Outlet />
      </main>
      <div className="app-layout__nav">
        <MdNavBar items={items} activeId={active} />
      </div>
    </div>
  )
}
