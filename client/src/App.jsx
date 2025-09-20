import React, { useEffect } from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
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
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Index/>}/>
          <Route path='/splash' element={<SplashScreen/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/loginpage' element={<LoginPage/>}/>
          <Route path='/signup' element={<SignupPage/>}/>
          <Route path='/register' element={<Register/>}/>

          {/* Protected Routes */}
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage/>
              </Layout>
            </ProtectedRoute>
          }/>
          <Route path='/inventory' element={
            <ProtectedRoute>
              <Layout>
                <InventoryPage/>
              </Layout>
            </ProtectedRoute>
          }/>
          <Route path='/products' element={
            <ProtectedRoute>
              <Layout>
                <ProductsPage/>
              </Layout>
            </ProtectedRoute>
          }/>
          <Route path='/ecommerce' element={
            <ProtectedRoute>
              <Layout>
                <ECommercePage/>
              </Layout>
            </ProtectedRoute>
          }/>
          <Route path='/appointments' element={
            <ProtectedRoute>
              <Layout>
                <AppointmentPage/>
              </Layout>
            </ProtectedRoute>
          }/>
          <Route path='/finance' element={
            <ProtectedRoute>
              <Layout>
                <FinancePage/>
              </Layout>
            </ProtectedRoute>
          }/>
          <Route path='/profile' element={
            <ProtectedRoute>
              <Layout>
                <Profile/>
              </Layout>
            </ProtectedRoute>
          }/>
          <Route path='/settings' element={
            <ProtectedRoute>
              <Layout>
                <Settings/>
              </Layout>
            </ProtectedRoute>
          }/>
          <Route path='*' element={<NotFound/>}/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
