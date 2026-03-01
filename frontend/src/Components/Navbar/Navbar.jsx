import React, { useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'

export const Navbar = () => {
    const [menu, setMenu] = useState('home')


  return (
    <div className='navbar'>
        <a href='' className='logo'>Afric<span>Food</span></a>

         <ul className='navbar-menu'>
                <li onClick={()=>setMenu("home")} className= {menu==="home" ? "active":""}>Home</li>
                <li onClick={()=>setMenu("menu")}  className= {menu==="menu"? "active":""}>Menu</li>
                <li onClick={()=>setMenu("Mobile-App")}  className= {menu==="Mobile-App"? "active": ""}>Mobile-App</li>
                <li onClick={()=>setMenu("contact-us")}  className= {menu==="contact-us"? "active": ""}>Contact us</li>
            </ul>
            <div className='navbar-right'>
                <img src={assets.investigation} className='search' alt='search logo'/>
                <div className='navbar-search-icon'>
                <img src={assets.shopping} alt='logo'/> 
                <div className='dot'></div>
                </div>
                <button>Sign in</button>
            </div>
    </div>
  )
}


export default Navbar