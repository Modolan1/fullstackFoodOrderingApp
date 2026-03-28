import React, { useContext } from 'react'
import { assets } from '../../../assets/assets'
import './Navbar.css'
import { AdminContext } from '../../../Context/AdminContext'

const Navbar = () => {
  const { adminUser, logout } = useContext(AdminContext)

  return (
    <div className='navbar'>
     <a href='/' className='logo'>Afric<span>Food</span></a>
      <div className='navbar-admin'>
        <div className='navbar-admin-meta'>
          <span>{adminUser?.name || 'Admin'}</span>
          <small>{adminUser?.email}</small>
        </div>
        <img className='profile' src={assets.avatar} alt='profile pic'/>
        <button type='button' onClick={logout}>Logout</button>
      </div>
    </div>
  
  )
}

export default Navbar