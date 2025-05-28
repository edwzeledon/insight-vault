import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'

import './App.css'
import Dashboard from './Dashboard'
import Login from './Login'
import Register from './Register'

export default function App() {

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path='/' Component={ Dashboard } />
          <Route path='/login' Component={ Login } />
          <Route path='/register' Component={ Register } />
          {/* <Route path='/competitors' Component={Navbar} />
          <Route path='/sources' Component={Navbar} />
          <Route path='/alerts' Component={Navbar} /> */}
        </Routes>
      </HashRouter>
    </>
  )
}
