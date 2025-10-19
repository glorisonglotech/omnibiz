import React from 'react';
import { Target, Users, Award, Lightbulb, Heart, Globe, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import glorison from '@/assets/glorison.jpg'
import dan from '@/assets/dan.jpg'

function About() {
  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "We're committed to empowering businesses with tools that drive real growth and success."
    },
    {
      icon: Users,
      title: "Customer-Centric",
      description: "Every decision we make is guided by what's best for our customers and their businesses."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We continuously innovate to stay ahead of business needs and technological advances."
    },
    {
      icon: Heart,
      title: "Passion",
      description: "We're passionate about helping businesses thrive in an increasingly digital world."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Businesses" },
    { number: "50+", label: "Countries Served" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "24/7", label: "Customer Support" }
  ];

  const team = [
    {
      name: "Daniel Ndk",
      role: "CEO & Founder",
      image: dan,
      bio: "Visionary leader driving innovation and growth in business management solutions."
    },
    {
      name: "Glorison Ouma",
      role: "CTO & Co-Founder",
      image: glorison,
      bio: "Technology expert passionate about building scalable, intelligent solutions for businesses."
    },
    {
      name: "Mr Timothy Ndala",
      role: "Head of Operations",
      image: "https://tse1.mm.bing.net/th/id/OIP.w-L3HP_7QYalYXw7apT2tAHaHx?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
      bio: "Operations strategist ensuring seamless business workflows and customer success."
    },
    {
      name: "David Kamau",
      role: "Head of Product Development",
      image: "https://th.bing.com/th/id/R.9a5877425188cdd10fd29f9178b680f6?rik=F%2fI%2bWzCaY1cPrw&riu=http%3a%2f%2fart.beopenfuture.com%2fwp-content%2fuploads%2fAlex-Ayivi.jpg&ehk=L0n3vEqGR9PpE9zPHHwZvTSZYPdDlCzbovMdLkQPoyI%3d&risl=&pid=ImgRaw&r=0",
      bio: "Product innovator focused on delivering exceptional user experiences and features."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Company Founded",
      description: "Started with a vision to simplify business operations for SMEs"
    },
    {
      year: "2021",
      title: "First 1,000 Customers",
      description: "Reached our first major milestone with businesses across 10 countries"
    },
    {
      year: "2022",
      title: "Series A Funding",
      description: "Raised $10M to accelerate product development and global expansion"
    },
    {
      year: "2023",
      title: "AI Integration",
      description: "Launched AI-powered insights and automation features"
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Now serving 10,000+ businesses across 50+ countries"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            About <span className="text-green-500">ominbiz</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            We're on a mission to empower businesses worldwide with intelligent, 
            integrated solutions that drive growth and operational excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                Get in Touch
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

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To democratize access to enterprise-grade business management tools, 
                  enabling businesses of all sizes to operate efficiently, make data-driven 
                  decisions, and achieve sustainable growth in the digital economy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To become the world's most trusted business management platform, 
                  powering millions of businesses globally and fostering economic growth 
                  through technology innovation and exceptional user experiences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do and shape our company culture.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <IconComponent className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The passionate individuals behind OminBiz, dedicated to your business success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-green-600 font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Journey</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Key milestones in our mission to transform business operations worldwide.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      {milestone.year.slice(-2)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{milestone.title}</h3>
                      <span className="text-sm text-green-600 font-medium">{milestone.year}</span>
                    </div>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Join Our Journey?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're looking to streamline your business operations or join our team, 
            we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                Start Your Free Trial
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default About;
