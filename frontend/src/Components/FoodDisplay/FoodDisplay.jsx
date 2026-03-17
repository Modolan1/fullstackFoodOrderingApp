import React, { useContext } from 'react'
import './FoodDisplay.css'
import { Food_List } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({category}) => {

    const {Food_List} = useContext(StoreContext)
  return (
    <div className='food_display' id='food_display'>
        <h2>Top Dishes near you</h2>
        <div className='food-display-list'>
            {Food_List.map((item,index)=>{
                {console.log(category,item.category);}
                if(category="All"|| category===item.category){
                    
                return <FoodItem key={index} id={item._id} name={item.name} description={item.description} price={item.price} image={item.image}/>
            }
        }

            )} 

        </div>
        
    </div>
  )
}

export default FoodDisplay