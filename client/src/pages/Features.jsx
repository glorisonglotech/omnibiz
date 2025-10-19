import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Features from '@/components/Features';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Zap, 
  Shield, 
  Smartphone, 
  Cloud, 
  BarChart3, 
  Users, 
  Headphones, 
  Globe,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

function FeaturesPage() {
  const benefits = [
    {
      icon: Zap,
      title: "Boost Productivity",
      description: "Automate routine tasks and streamline workflows to increase team efficiency by up to 40%."
    },
    {
      icon: BarChart3,
      title: "Data-Driven Insights",
      description: "Make informed decisions with real-time analytics and comprehensive business intelligence."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Enable seamless collaboration across departments with integrated communication tools."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with end-to-end encryption and compliance with global standards."
    }
  ];

  const integrations = [
    "QuickBooks", "Xero", "Shopify", "WooCommerce", "Stripe", "PayPal", 
    "Mailchimp", "Slack", "Google Workspace", "Microsoft 365", "Zapier", "API Access"
  ];

  const industries = [
    {
      name: "Retail & E-commerce",
      description: "Manage inventory, process orders, and track sales across multiple channels.",
      features: ["Multi-channel inventory", "Order management", "Customer analytics"]
    },
    {
      name: "Professional Services",
      description: "Schedule appointments, track time, and manage client relationships.",
      features: ["Appointment booking", "Time tracking", "Client portal"]
    },
    {
      name: "Manufacturing",
      description: "Optimize production, manage supply chain, and track quality metrics.",
      features: ["Production planning", "Supply chain", "Quality control"]
    },
    {
      name: "Healthcare",
      description: "Manage patient records, schedule appointments, and handle billing.",
      features: ["Patient management", "Appointment scheduling", "Billing integration"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Powerful <span className="text-green-500">Features</span> for Modern Business
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover how ominbiz can transform your business operations with our comprehensive 
            suite of integrated tools and intelligent automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features Component */}
      <Features />

      {/* Key Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Businesses Choose ominbiz
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of businesses that have transformed their operations with our platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="text-center hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <IconComponent className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Tailored for Your Industry
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ominbiz adapts to your specific industry needs with customizable workflows and features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {industries.map((industry, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{industry.name}</CardTitle>
                  <CardDescription>{industry.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {industry.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Seamless Integrations
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect ominbiz with your favorite tools and services for a unified business ecosystem.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {integrations.map((integration, index) => (
              <Card key={index} className="text-center p-4 hover:shadow-md transition-shadow">
                <CardContent className="p-2">
                  <span className="text-sm font-medium text-muted-foreground">{integration}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              Don't see your tool? We offer custom integrations and a powerful API.
            </p>
            <Link to="/contact">
              <Button variant="outline">
                Request Integration
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Built for Scale and Performance
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade infrastructure that grows with your business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Cloud className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Cloud-Native</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built on modern cloud infrastructure for reliability and scalability.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Smartphone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Mobile-First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Responsive design that works perfectly on all devices and screen sizes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Global CDN</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Fast loading times worldwide with our global content delivery network.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Headphones className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Round-the-clock customer support to help you succeed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that have streamlined their operations with ominbiz. 
            Start your free trial today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                Start Free Trial - No Credit Card Required
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline">
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default FeaturesPage;
