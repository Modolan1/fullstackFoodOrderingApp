import React from 'react'
import './ExploreMenu.css'
import { Menulist } from '../../assets/assets'

const EXploreMenu = ({category, setCategory}) => {
  return (
    <div className='explore-menu' id='explore-meu'>
        <h2>Explore Our Menu</h2>
        <p className='explore-menu-text'>If you are looking for West African continental dishes, think about Jollof life. Nothing is more deserving than having healthy nutrition, essential for sustaining a healthy lifestyle and treats. Jollof life offers more than just Nigerian cuisine; we have a variety of sumptuous delicacies for your delight.
            chooose from our diverse menu featuring delectable array
        </p>
        <div className='explore-menu-list'>
            {Menulist.map((item, index)=>{
                return (
                <div onClick={()=>setCategory(prev=>prev===item.menu_name? "All":item.menu_name)} key ={index} className='explore-menu-list-item'>
                    <img className={category===item.menu_name?"active":""} src={item.menu_image} alt='menu image'/>
                    <p>{item.menu_name}</p>
                </div>
                )
            })}
        </div>
        <hr/>
    </div>
  )
}

export default EXploreMenu