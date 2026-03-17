import React, { useContext, useMemo, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import { Link } from 'react-router-dom'

export const Navbar = ({ setShowLogin }) => {
    const [menu, setMenu] = useState('home')
    const [showCartPopup, setShowCartPopup] = useState(false)
  const { Food_List, cartItems, currentUser, logout } = useContext(StoreContext)

    const cartList = useMemo(
      () => Food_List.filter((item) => (cartItems[item._id] || 0) > 0),
      [Food_List, cartItems]
    )

    const cartCount = useMemo(
      () => cartList.reduce((sum, item) => sum + (cartItems[item._id] || 0), 0),
      [cartList, cartItems]
    )

    const subtotal = useMemo(
      () => cartList.reduce((sum, item) => sum + item.price * (cartItems[item._id] || 0), 0),
      [cartList, cartItems]
    )


  return (
    <>
    {showCartPopup && <div className='cart-popup-overlay' onClick={() => setShowCartPopup(false)}></div>}
    <div className='navbar'>
        <a href='/' className='logo'>Afric<span>Food</span></a>

         <ul className='navbar-menu'>
                <a href='/' onClick={() => setMenu('home')} className={menu === 'home' ? 'active' : ''}>Home</a>
                <a href='#explore-menu' onClick={() => setMenu('menu')} className={menu === 'menu' ? 'active' : ''}>Menu</a>
                <a href='#app-download' onClick={() => setMenu('Mobile-App')} className={menu === 'Mobile-App' ? 'active' : ''}>Mobile-App</a>
                <a href='#footer' onClick={() => setMenu('contact-us')} className={menu === 'contact-us' ? 'active' : ''}>Contact us</a>
            </ul>
            <div className='navbar-right'>
                <img src={assets.investigation} className='search' alt='search logo'/>
                <div className='navbar-search-icon'>
                <img src={assets.shopping} alt='logo' onClick={() => setShowCartPopup((prev) => !prev)}/>
                {cartCount > 0 && <div className='dot'></div>}
                {showCartPopup && (
                  <div className='cart-popup' onClick={(e) => e.stopPropagation()}>
                    <h4>Your Cart</h4>
                    {cartList.length === 0 ? (
                      <p className='cart-popup-empty'>Your cart is empty.</p>
                    ) : (
                      <>
                        <div className='cart-popup-items'>
                          {cartList.map((item) => (
                            <div className='cart-popup-item' key={item._id}>
                              <span>{item.name}</span>
                              <span>x {cartItems[item._id]}</span>
                            </div>
                          ))}
                        </div>
                        <div className='cart-popup-total'>
                          <span>Subtotal</span>
                          <span>${subtotal}</span>
                        </div>
                      </>
                    )}
                    <Link to='/cart' className='cart-popup-btn' onClick={() => setShowCartPopup(false)}>Open Cart</Link>
                  </div>
                )}
                </div>
                {currentUser ? (
                  <div className='navbar-account'>
                    <span className='navbar-account-name'>Hi, {currentUser.name.split(' ')[0]}</span>
                    <button onClick={logout} type='button'>Logout</button>
                  </div>
                ) : (
                  <button onClick={() => setShowLogin(true)}>Sign in</button>
                )}
            </div>
    </div>
    </>
  )
}


export default Navbar