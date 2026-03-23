
import React, { useContext } from 'react'
import Navbar from './components/sidebar/Navbar/Navbar'
import Sidebar from './components/sidebar/Sidebar'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Reports from './pages/Reports/Reports'
import Login from './pages/Login/Login'
import { AdminContext } from './Context/AdminContext'

const App = () => {
  const { adminUser, authLoading } = useContext(AdminContext)

  if (authLoading) {
    return <div className='app-loading'>Checking admin session...</div>
  }

  if (!adminUser) {
    return <Login />
  }

  return (
    <div className='app-shell'>
      <Navbar/>
      <hr/>
      <div className="app-content">
        <Sidebar/>
        <main className='app-main'>
          <Routes>
            <Route path='/' element={<Add/>}/>
            <Route path='/add' element={<Add/>}/>
            <Route path='/list' element={<List/>}/>
            <Route path='/orders' element={<Orders/>}/>
            <Route path='/reports' element={<Reports/>}/>
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App