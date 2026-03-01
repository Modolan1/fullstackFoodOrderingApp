import React, { useState } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'

const FoodItem = ( {id,name,price,description,category,image}) => {
  const [itemCount,setItemCount] = useState(0)
  return (
    <div className='food-item'>
      <div className='food-item-img-container'>
        <img className='food-item-image' src={image }alt=""/>
        
        { !itemCount 
        ?<button className='add' onClick={()=>setItemCount(prev=>prev+1)} type='button'>+</button>:
        <div className='food-item-counter'>
          <button onClick={()=>setItemCount(prev=>Math.max(prev-1,0))} type='button'>-</button>
          <p>{itemCount}</p>
          <button onClick={()=>setItemCount(prev=>prev+1)} type='button'>+</button>
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