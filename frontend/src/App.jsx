import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'

import DashboardPage from './features/dashboard/pages/DashboardPage'
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import useAuthStore from './stores/AuthStore'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    async function refreshToken() {
      try {
        const response = await fetch('http://localhost:3000/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        })

        if (response.ok) {
          const results = await response.json()
          setAccessToken(results.accessToken)
        } else {
          console.log('Refresh token invalid or expired');
          if (location.pathname === '/register' || location.pathname === '/login') {
            return
          }
          navigate('/login')
        }
      } catch (err) {
        console.error('Failed to refresh token', err);
        if (location.pathname === '/register' || location.pathname === '/login') {
          return
        }
        navigate('/login')
      }
    }
    if (!accessToken) {
      refreshToken()
    }
  }, [accessToken, setAccessToken, navigate])

  return (
    <>
      <Routes>
        <Route path='/' element={<DashboardPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </>
  )
}
