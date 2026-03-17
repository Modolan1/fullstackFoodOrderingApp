import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className='footer-content'>
         <div className='footer-content-left'>
            <img src={assets.logo} alt='logo'/>
            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aspernatur magnam neque facere nobis omnis fugit ab sapiente, quam perspiciatis at minima! Molestias quidem temporibus doloribus, itaque unde non dignissimos minima.</p>
            <div className='footer-social-icons'>
                <img src={assets.facebooks_icons} alt=''/>
                <img src={assets.facebooks_icons} alt=''/>
                <img src={assets.facebooks_icons} alt=''/>

            </div>

         </div>

         
         <div className='footer-content-center'>
            <h2>Company</h2>
            <ul>
                <li>Home</li>
                <li>About us</li>
                <li>Delivery</li>
                <li>Privacy policy</li>
            </ul>
         </div>

         <div className='footer-content-right'>
            <h2>GET IN TOUCH</h2>
            <ul> 
             <li>+1234567666</li>
             <li>modolan.com</li>
                
             </ul>



         </div>
        </div>
      <hr/>
      <p className="footer-copyright">Copyright 2024 @ Modolan.com - All Right Reserved.</p>
    </div>
  )
}

export default Footer