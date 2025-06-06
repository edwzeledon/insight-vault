import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'

import './App.css'
import Dashboard from './Dashboard'
import Login from './Login'
import Register from './Register'
import useAuthStore from './authStore'

export default function App() {

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
        }
      } catch (err) {
        console.error('Failed to refresh token', err);
      }
    }
    if (!accessToken) {
      refreshToken()
    }
  }, [accessToken, setAccessToken])

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path='/' Component={Dashboard} />
          <Route path='/login' Component={Login} />
          <Route path='/register' Component={Register} />
          {/* <Route path='/competitors' Component={Navbar} />
          <Route path='/sources' Component={Navbar} />
          <Route path='/alerts' Component={Navbar} /> */}
        </Routes>
      </HashRouter>
    </>
  )
}
