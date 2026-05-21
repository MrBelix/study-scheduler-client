// Round avatar with the person's initials (first letter of first two
// words). Used in lists and as the hero on detail pages.
import { Avatar } from '@mui/material'

export const StudentAvatar = ({
  name,
  color,
  size = 40,
}: {
  name: string
  color: string
  size?: number
}) => {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('')
  return (
    <Avatar sx={{ width: size, height: size, bgcolor: color, color: '#fff', fontSize: size * 0.36 }}>
      {initials}
    </Avatar>
  )
}
