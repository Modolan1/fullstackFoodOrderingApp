import React, { useState, useContext } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'

const FoodItem = ( {id,name,price,description,category,image}) => {
  
  const {cartItems, addtoCart, removeFromCart} = useContext(StoreContext);
  return (
    <div className='food-item'>
      <div className='food-item-img-container'>
        <img className='food-item-image' src={image }alt=""/>
        
        { !cartItems[id]
        ?<button className='add' onClick={()=> addtoCart(id)} type='button'>+</button>:
        <div className='food-item-counter'>
          <button onClick={()=>removeFromCart(id)} type='button'>-</button>
          <p>{cartItems[id]}</p>
          <button onClick={()=>addtoCart(id)} type='button'>+</button>
          </div>
        
          }
      </div>
      <div className='food-item-info'>
        <div className='food-item-name-rating'>
        <p>{name}</p>
        <img src={assets.rating_starts} className="image"></img>
        </div>
       <p className="food-item-description">{description}</p>
       <p className="food-item-price">${price}</p>
      </div>
    </div>
  )
}

export default FoodItem