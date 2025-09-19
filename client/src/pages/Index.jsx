import Features from '@/components/Features'
import Footer from '@/components/Footer'
import HeroSection from '@/components/HeroSection'
import Navbar from '@/components/Navbar'
import TestimonialsSection from '@/components/TestimonialsSection'
import React from 'react'

function Index() {
  return (
    <>
      <Navbar/>
      <HeroSection/>
      <TestimonialsSection/>
      <Features/>
      <Footer/>
    </>
  )
}

export default Index