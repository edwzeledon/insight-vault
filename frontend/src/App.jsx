import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'

import './App.css'
import Dashboard from './Dashboard'

export default function App() {

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path='/' Component={ Dashboard } />
          {/* <Route path='/competitors' Component={Navbar} />
          <Route path='/sources' Component={Navbar} />
          <Route path='/alerts' Component={Navbar} /> */}
        </Routes>
      </HashRouter>
    </>
  )
}
