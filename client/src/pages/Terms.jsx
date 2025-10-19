import React from 'react';
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale, CreditCard, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <FileText className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Terms of <span className="text-green-500">Service</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Please read these terms carefully before using ominbiz platform.
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
          <Alert className="mb-8 border-green-200 bg-green-50">
            <AlertTriangle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              By accessing and using ominbiz, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform.
            </AlertDescription>
          </Alert>

          {/* 1. Acceptance of Terms */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                These Terms of Service ("Terms") govern your use of the ominbiz platform and services ("Services"). By creating an account or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms.
              </p>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. Continued use of the Services after changes constitutes acceptance of the modified Terms.
              </p>
            </CardContent>
          </Card>

          {/* 2. Eligibility */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                2. Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">You must be at least 18 years old to use ominbiz</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">You must have the authority to enter into these Terms on behalf of your business</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">You must provide accurate and complete information during registration</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">You must comply with all applicable laws and regulations</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 3. Account Registration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>3. Account Registration and Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Provide accurate, current, and complete information</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Maintain and update your information to keep it accurate</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Maintain the security of your password and account</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Immediately notify us of any unauthorized access</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Be responsible for all activities under your account</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 4. Subscription and Payment */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                4. Subscription and Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Subscription Plans</h4>
                <p className="text-muted-foreground mb-3">
                  ominbiz offers various subscription tiers (Client, Standard, Professional, Premium, Enterprise) with different features and pricing.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Billing</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Subscription fees are billed in advance on a monthly or annual basis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">All fees are non-refundable except as required by law</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">You authorize us to charge your payment method automatically</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Failure to pay may result in service suspension or termination</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Free Trial</h4>
                <p className="text-muted-foreground">
                  Free trials are available for eligible plans. You will be charged automatically at the end of the trial period unless you cancel before it ends.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Acceptable Use */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Scale className="h-5 w-5 text-green-600" />
                </div>
                5. Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">You agree NOT to:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Violate any laws or regulations</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Infringe on intellectual property rights</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Upload malicious code, viruses, or harmful content</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Attempt to gain unauthorized access to our systems</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Interfere with the operation of the Services</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Use the Services for illegal or fraudulent activities</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Share your account credentials with unauthorized parties</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Reverse engineer, decompile, or disassemble the platform</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 6. Data Ownership */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>6. Data Ownership and License</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Your Data</h4>
                <p className="text-muted-foreground">
                  You retain all rights to your business data. By using ominbiz, you grant us a limited license to use, store, and process your data solely to provide and improve our Services.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Our Platform</h4>
                <p className="text-muted-foreground">
                  ominbiz and all intellectual property rights in the platform remain our property. You are granted a limited, non-exclusive, non-transferable license to use the Services.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 7. Service Availability */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>7. Service Availability and Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We strive to provide 99.9% uptime but do not guarantee uninterrupted access. We may perform maintenance, updates, or improvements that may temporarily affect service availability.
              </p>
              <p className="text-muted-foreground">
                Support is provided according to your subscription tier. Response times and support channels vary by plan.
              </p>
            </CardContent>
          </Card>

          {/* 8. Termination */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>8. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">By You</h4>
                <p className="text-muted-foreground">
                  You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of your current billing period.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">By Us</h4>
                <p className="text-muted-foreground mb-3">
                  We may suspend or terminate your account if you:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Violate these Terms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Fail to pay fees</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Engage in fraudulent or illegal activity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Pose a security risk to our platform</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 9. Disclaimers */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>9. Disclaimers and Limitations of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-900 mb-2">IMPORTANT LEGAL NOTICE</p>
                <p className="text-sm text-yellow-800">
                  THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
              </div>
              <p className="text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, ominbiz SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </CardContent>
          </Card>

          {/* 10. Indemnification */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>10. Indemnification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You agree to indemnify and hold ominbiz harmless from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Services, violation of these Terms, or infringement of any third-party rights.
              </p>
            </CardContent>
          </Card>

          {/* 11. Governing Law */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>11. Governing Law and Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                These Terms are governed by the laws of Kenya. Any disputes arising from these Terms or the Services shall be resolved through arbitration in Nairobi, Kenya, or through the courts of Kenya.
              </p>
            </CardContent>
          </Card>

          {/* 12. Changes to Terms */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>12. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify you of material changes via email or through the platform. Your continued use of the Services after such notification constitutes acceptance of the modified Terms.
              </p>
            </CardContent>
          </Card>

          {/* 13. Contact Information */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">13. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-green-800">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-green-800">
                  <FileText className="h-4 w-4" />
                  <span>legal@ominbiz.com</span>
                </div>
                <div className="flex items-center gap-3 text-green-800">
                  <Users className="h-4 w-4" />
                  <span>ominbiz Limited, Nairobi, Kenya</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-sm text-green-800">
                  By using ominbiz, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them. Thank you for choosing ominbiz!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Related Links */}
          <div className="mt-8 p-6 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-4">Related Documents</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/privacy" className="text-green-600 hover:text-green-700 font-medium">
                → Privacy Policy
              </Link>
              <Link to="/contact" className="text-green-600 hover:text-green-700 font-medium">
                → Contact Support
              </Link>
              <Link to="/pricing" className="text-green-600 hover:text-green-700 font-medium">
                → View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Terms;
