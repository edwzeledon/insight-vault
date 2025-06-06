import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function Navbar() {
    const location = useLocation()
    const navigate = useNavigate()
    const [navItems, setNavItems] = useState([
        { to: '/', name: 'Dashboard' },
        { to: '/competitors', name: 'Competitors' },
        { to: '/sources', name: 'Sources' },
        { to: '/reports', name: 'Reports' },
        { to: '/alerts', name: 'Alerts' }
    ])

    async function handleLogout(){
        try {
            const response = await fetch('http://localhost:3000/auth/logout',{
                method: 'DELETE',
                credentials: 'include'
            })
            if (response.ok){
                navigate('/login')
            }
        } catch(err){
            console.log('error logging out: ', err)
        } 
    }

    return (
        <nav className="navbar navbar-expand navbar-dark bg-custom">
            <div className="container-fluid">
                <NavLink className="navbar-brand fs-4" to='/'> Insight Vault </NavLink>
                <div className="navbar-nav d-flex align-items-center">
                    {
                        navItems.map(nav => {
                            return (
                                <NavLink key={nav.name} to={nav.to} className='nav-link'> {nav.name}</NavLink>
                            )
                        })
                    }
                    <LogOut 
                        size={28} 
                        color={'white'} 
                        className='ms-3' 
                        style={{cursor: 'pointer'}} 
                        onClick={handleLogout}
                    />
                </div>
            </div>
        </nav>
    );
}