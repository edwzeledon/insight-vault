import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom'

export default function Navbar() {
    const location = useLocation()
    const [navItems, setNavItems] = useState([
        { to: '/', name: 'Dashboard' },
        { to: '/competitors', name: 'Competitors' },
        { to: '/sources', name: 'Sources' },
        { to: '/reports', name: 'Reports' },
        { to: '/alerts', name: 'Alerts' }
    ])

    return (
        <nav className="navbar navbar-expand bg-dark navbar-dark">
            <div className="container-fluid">
                <NavLink className="navbar-brand fs-4" to='/'> Insight Vault </NavLink>
                <div className="navbar-nav">
                    {
                        navItems.map(nav => {
                            return (
                                <NavLink key={nav.name} to={nav.to} className='nav-link'> {nav.name}</NavLink>
                            )
                        })
                    }
                </div>
            </div>
        </nav>
    );
}