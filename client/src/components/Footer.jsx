import React, { useState } from 'react'

const Footer = () => {
  const [footerData, setFooterData] = useState({});

  return (
    <div className='footer'>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">OmniBiz</h3>
            <p className="text-sm text-muted-foreground">
              Streamline your business operations with our comprehensive management platform.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Features</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary">Inventory Management</a></li>
              <li><a href="#" className="hover:text-primary">E-commerce</a></li>
              <li><a href="#" className="hover:text-primary">Appointments</a></li>
              <li><a href="#" className="hover:text-primary">Finance</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary">About</a></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
              <li><a href="#" className="hover:text-primary">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 OmniBiz. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Footer
