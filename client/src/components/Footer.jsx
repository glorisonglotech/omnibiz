import React, { useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [footerData, setFooterData] = useState({});

  return (
    <div className="footer">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-3xl font-bold mb-4">
              Omni<span className="text-green-500">Biz</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Streamline your business operations with our comprehensive
              management platform.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/features" className="hover:text-primary">
                  Inventory Management
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-primary">
                  E-commerce
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-primary">
                  Appointments
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-primary">
                  Finance
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} <span className="text-2xl font-bold">Omni<span className="text-green-500">Biz</span></span>. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
