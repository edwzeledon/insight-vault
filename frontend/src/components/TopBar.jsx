import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/AuthStore'

export default function TopBar() {
  const navigate = useNavigate()
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken)

  async function handleLogout() {
    try {
      const response = await fetch('http://localhost:3000/auth/logout', {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        clearAccessToken()
        navigate('/login')
      }
    } catch (err) {
      console.log('error logging out: ', err)
    }
  }

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm">
      {/* Logo/Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">CI</span>
        </div>
        <span className="font-semibold text-foreground">Competitor Intelligence</span>
      </div>

      {/* spacer (date filter moved to Company header) */}
      <div />

      {/* Logout Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}
