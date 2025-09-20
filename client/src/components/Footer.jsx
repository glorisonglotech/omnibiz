import React, { useState } from 'react'
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Send,
  Zap
} from 'lucide-react'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  const footerSections = {
    features: [
      { name: 'Inventory Management', href: '/inventory' },
      { name: 'E-commerce Integration', href: '/ecommerce' },
      { name: 'Appointment Scheduling', href: '/appointments' },
      { name: 'Financial Management', href: '/finance' },
      { name: 'Analytics & Reports', href: '/analytics' },
      { name: 'Customer Management', href: '/customers' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Team', href: '/team' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press Kit', href: '/press' },
      { name: 'Contact', href: '/contact' },
      { name: 'Blog', href: '/blog' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Community', href: '/community' },
      { name: 'Status Page', href: '/status' },
      { name: 'Report Bug', href: '/bug-report' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR Compliance', href: '/gdpr' },
      { name: 'Security', href: '/security' },
      { name: 'Accessibility', href: '/accessibility' }
    ]
  }

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/omnibiz' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/omnibiz' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/omnibiz' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/omnibiz' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/omnibiz' }
  ]

  const contactInfo = [
    { icon: Phone, text: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: Mail, text: 'hello@omnibiz.com', href: 'mailto:hello@omnibiz.com' },
    { icon: MapPin, text: '123 Business Ave, Suite 100, New York, NY 10001', href: '#' }
  ]

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">OmniBiz</h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Streamline your business operations with our comprehensive management platform.
              From inventory to customer relations, we've got everything you need to grow your business.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              {contactInfo.map((contact, index) => {
                const IconComponent = contact.icon
                return (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    <IconComponent className="w-4 h-4 text-primary flex-shrink-0" />
                    {contact.href.startsWith('http') || contact.href.startsWith('mailto') || contact.href.startsWith('tel') ? (
                      <a href={contact.href} className="text-muted-foreground hover:text-primary transition-colors">
                        {contact.text}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">{contact.text}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Features</h4>
            <ul className="space-y-3">
              {footerSections.features.map((item, index) => (
                <li key={index}>
                  <a href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerSections.company.map((item, index) => (
                <li key={index}>
                  <a href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              {footerSections.support.map((item, index) => (
                <li key={index}>
                  <a href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerSections.legal.map((item, index) => (
                <li key={index}>
                  <a href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Stay Updated</h4>
              <p className="text-muted-foreground">
                Get the latest updates, tips, and insights delivered to your inbox.
              </p>
            </div>
            <div>
              <form onSubmit={handleSubscribe} className="flex space-x-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Subscribe</span>
                </button>
              </form>
              {subscribed && (
                <p className="text-green-600 text-sm mt-2">Thank you for subscribing!</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              <p>&copy; 2024 OmniBiz. All rights reserved.</p>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label={social.name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                )
              })}
            </div>

            {/* Additional Info */}
            <div className="text-sm text-muted-foreground">
              <p>Made with ❤️ for businesses worldwide</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
