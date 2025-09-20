import React from 'react'
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
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Index/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/loginpage' element={<LoginPage/>}/>
        <Route path='/signup' element={<SignupPage/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/dashboard' element={<DashboardPage/>}/>
        <Route path='/inventory' element={<InventoryPage/>}/>
        <Route path='/ecommerce' element={<ECommercePage/>}/>
        <Route path='/appointments' element={<AppointmentPage/>}/>
        <Route path='/finance' element={<FinancePage/>}/>
        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
