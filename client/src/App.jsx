import React, { useEffect } from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Index from './pages/Index'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardPage from './pages/DashboardPage'
import InventoryPage from './pages/InventoryPage'
import ECommercePage from './pages/ECommercePage'
import AppointmentPage from './pages/AppointmentPage'
import FinancePage from './pages/FinancePage'
import ProductsPage from './pages/ProductsPage'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import SplashScreen from './pages/SplashScreen'
import NotFound from './pages/NotFound'

function App() {
  // Set the app title
  useEffect(() => {
    document.title = 'OmniBiz - Complete Business Management Solution'
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Index/>}/>
        <Route path='/splash' element={<SplashScreen/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/loginpage' element={<LoginPage/>}/>
        <Route path='/signup' element={<SignupPage/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/dashboard' element={<DashboardPage/>}/>
        <Route path='/inventory' element={<InventoryPage/>}/>
        <Route path='/products' element={<ProductsPage/>}/>
        <Route path='/ecommerce' element={<ECommercePage/>}/>
        <Route path='/appointments' element={<AppointmentPage/>}/>
        <Route path='/finance' element={<FinancePage/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/settings' element={<Settings/>}/>
        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
