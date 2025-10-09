import { useEffect } from 'react'
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom'

import Dashboard from '../features/dashboard/pages/Dashboard'
import Login from '../features/auth/pages/Login'
import Register from '../features/auth/pages/Register'
import useAuthStore from '../stores/AuthStore'

export default function App() {
  const navigate = useNavigate()
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
          navigate('/login')
        }
      } catch (err) {
        console.error('Failed to refresh token', err);
        navigate('/login')
      }
    }
    if (!accessToken) {
      refreshToken()
    }
  }, [accessToken, setAccessToken])

  return (
    <>
      <Routes>
        <Route path='/' Component={Dashboard} />
        <Route path='/login' Component={Login} />
        <Route path='/register' Component={Register} />
        {/* <Route path='/competitors' Component={Navbar} />
          <Route path='/sources' Component={Navbar} />
          <Route path='/alerts' Component={Navbar} /> */}
      </Routes>
    </>
  )
}
