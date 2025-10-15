import React from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingCart,
  Package,
  Calendar,
  DollarSign,
  BarChart3,
  Users,
  Shield,
  Smartphone,
  Clock,
  TrendingUp,
  FileText,
  Settings
} from 'lucide-react'

function Features() {
  const featureData = [
    {
      id: 1,
      icon: Package,
      title: "Inventory Management",
      description: "Track stock levels, manage suppliers, and automate reordering with real-time inventory updates.",
      features: ["Real-time tracking", "Low stock alerts", "Supplier management", "Barcode scanning"]
    },
    {
      id: 2,
      icon: ShoppingCart,
      title: "E-Commerce Integration",
      description: "Seamlessly connect your online store with inventory and order management systems.",
      features: ["Multi-platform sync", "Order processing", "Product catalog", "Payment integration"]
    },
    {
      id: 3,
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Manage bookings, send reminders, and optimize your schedule with intelligent calendar management.",
      features: ["Online booking", "SMS reminders", "Calendar sync", "Staff scheduling"]
    },
    {
      id: 4,
      icon: DollarSign,
      title: "Financial Management",
      description: "Handle invoicing, track expenses, and monitor cash flow with comprehensive financial tools.",
      features: ["Invoice generation", "Expense tracking", "Payment processing", "Financial reports"]
    },
    {
      id: 5,
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Make data-driven decisions with detailed analytics and AI-powered business insights.",
      features: ["Sales analytics", "Performance metrics", "Trend analysis", "Custom reports"]
    },
    {
      id: 6,
      icon: Users,
      title: "Customer Management",
      description: "Build stronger relationships with comprehensive customer profiles and communication tools.",
      features: ["Customer profiles", "Communication history", "Loyalty programs", "Feedback management"]
    },
    {
      id: 7,
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with data encryption and compliance with industry standards.",
      features: ["Data encryption", "Access controls", "Audit trails", "GDPR compliance"]
    },
    {
      id: 8,
      icon: Smartphone,
      title: "Mobile Access",
      description: "Manage your business on-the-go with our responsive mobile interface and dedicated apps.",
      features: ["Mobile responsive", "Offline access", "Push notifications", "Cross-platform"]
    }
  ]

  const additionalFeatures = [
    { icon: Clock, title: "24/7 Support", description: "Round-the-clock customer support" },
    { icon: TrendingUp, title: "Scalable", description: "Grows with your business needs" },
    { icon: FileText, title: "Documentation", description: "Comprehensive guides and tutorials" },
    { icon: Settings, title: "Customizable", description: "Tailor the platform to your workflow" }
  ]

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Powerful <span className='text-green-400'>Features </span> for Your Business
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to streamline operations, boost productivity, and grow your business in one comprehensive platform.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
          {featureData.map((feature) => {
            const IconComponent = feature.icon
            return (
              <div
                key={feature.id}
                className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 group"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg mr-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <IconComponent className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                </div>

                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {feature.description}
                </p>

                <ul className="space-y-2">
                  {feature.features.map((item, index) => (
                    <li key={index} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Additional Features */}
        <div className="bg-muted/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            Why Choose OmniBiz?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                    <IconComponent className="h-8 w-8 text-green-500" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to Transform Your Business?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that have streamlined their operations with OmniBiz.
            Start your free trial today and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <button className="bg-green-500 text-white px-8 py-3 rounded-lg font-medium cursor-pointer hover:bg-green-400  transition-colors duration-200">
                Start Free Trial
              </button>
            </Link>
            <Link to="/contact">
              <button className="border border-input px-8 py-3 rounded-lg  cursor-pointer font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
                Schedule Demo
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features