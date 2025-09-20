import React from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
// import Index from './pages/Index'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import NotFound from './pages/NotFound'
import DashboardLayout from './pages/DashboardLayout'
import Inventory from './pages/dashboard/Inventory'
import Dashboard from './pages/Dashboard'
import Index from './pages/Index'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Index/>}/>
        <Route path='/loginpage' element={<LoginPage/>}/>
        <Route path='/signup' element={<SignupPage/>}/>
         <Route path="/dashboardlayout" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
          </Route>
        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
