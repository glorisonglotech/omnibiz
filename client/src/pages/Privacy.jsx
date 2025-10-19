import React from 'react';
import { Shield, Lock, Eye, FileText, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function Privacy() {
  const sections = [
    {
      icon: FileText,
      title: "Information We Collect",
      content: [
        "Personal information (name, email, phone number, business details)",
        "Account credentials and authentication data",
        "Payment and billing information",
        "Business data (inventory, orders, customers, transactions)",
        "Usage data and analytics",
        "Device information and IP addresses",
        "Cookies and tracking technologies"
      ]
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        "Provide and maintain our services",
        "Process transactions and payments",
        "Send important updates and notifications",
        "Improve and optimize our platform",
        "Provide customer support",
        "Detect and prevent fraud",
        "Comply with legal obligations",
        "Personalize your experience"
      ]
    },
    {
      icon: Shield,
      title: "Data Security",
      content: [
        "Industry-standard encryption (SSL/TLS)",
        "Secure data centers with 24/7 monitoring",
        "Regular security audits and updates",
        "Access controls and authentication",
        "Data backup and disaster recovery",
        "Employee training on data protection",
        "Compliance with GDPR and data protection laws"
      ]
    },
    {
      icon: Lock,
      title: "Your Rights",
      content: [
        "Access your personal data",
        "Correct inaccurate information",
        "Request data deletion",
        "Export your data",
        "Opt-out of marketing communications",
        "Withdraw consent",
        "Lodge a complaint with supervisory authorities"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <Shield className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Privacy <span className="text-green-500">Policy</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Introduction */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed">
                At ominbiz, we are committed to protecting your privacy and ensuring the security of your personal 
                and business data. This Privacy Policy describes how we collect, use, store, and share information 
                when you use our platform. By using ominbiz, you agree to the practices described in this policy.
              </p>
            </CardContent>
          </Card>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <IconComponent className="h-5 w-5 text-green-600" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.content.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Data Sharing */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">
                    <strong>Service Providers:</strong> With trusted third-party vendors who help us provide our services (payment processors, hosting providers, analytics services)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">
                    <strong>Legal Requirements:</strong> When required by law or to protect our rights and safety
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">
                    <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookies through your browser settings.
              </p>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Types of cookies we use:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Essential cookies (required for platform functionality)</li>
                  <li>• Analytics cookies (help us understand usage patterns)</li>
                  <li>• Preference cookies (remember your settings)</li>
                  <li>• Marketing cookies (deliver relevant content)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We retain your information for as long as necessary to provide our services and comply with legal obligations. When you close your account, we will delete or anonymize your data within 90 days, except where we are required to retain it for legal or regulatory purposes.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          {/* International Data Transfers */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
              </p>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through our platform. Your continued use of ominbiz after changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-green-800">
                If you have questions about this Privacy Policy or how we handle your data, please contact us:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-green-800">
                  <Mail className="h-4 w-4" />
                  <span>privacy@ominbiz.com</span>
                </div>
                <div className="flex items-center gap-3 text-green-800">
                  <Phone className="h-4 w-4" />
                  <span>+254 700 000 000</span>
                </div>
                <div className="flex items-center gap-3 text-green-800">
                  <FileText className="h-4 w-4" />
                  <span>Data Protection Officer: dpo@ominbiz.com</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Privacy;
