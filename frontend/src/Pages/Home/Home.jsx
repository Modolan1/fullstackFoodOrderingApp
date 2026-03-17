import React, { use, useState } from 'react'
import './Home.css'
import Header from '../../Components/Header/Header'
import EXploreMenu from '../../Components/ExploreMenu/EXploreMenu'
import FoodDisplay from '../../Components/FoodDisplay/FoodDisplay'
import AppDownload from '../../Components/AppDownload'

export const Home = () => {
  
  const [ category, setCategory] = useState("All");


  return (
    <div>
        <Header/>
        <EXploreMenu category={category} setCategory={setCategory}/>
        <FoodDisplay category={category}/>
        <AppDownload/>
    </div>
  )
}

export default Home