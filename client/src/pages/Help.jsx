import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Search,
  BookOpen,
  Video,
  FileText,
  Users,
  Settings,
  CreditCard,
  BarChart3,
  Package,
  MapPin,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: '',
    message: '',
    priority: 'medium'
  });

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpen,
      faqs: [
        {
          question: 'How do I set up my OmniBiz account?',
          answer: 'To set up your account, click on Sign Up, fill in your business details, verify your email, and complete the onboarding process.'
        },
        {
          question: 'What features are included in the free plan?',
          answer: 'The free plan includes basic inventory management, up to 100 products, basic reporting, and email support.'
        },
        {
          question: 'How do I add my first product?',
          answer: 'Go to Products > Add Product, fill in the product details including name, price, category, and stock quantity.'
        }
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory Management',
      icon: Package,
      faqs: [
        {
          question: 'How do I track stock levels?',
          answer: 'Stock levels are automatically updated when you make sales or receive inventory. You can also manually adjust stock in the Inventory section.'
        },
        {
          question: 'Can I set up low stock alerts?',
          answer: 'Yes, you can set reorder levels for each product. When stock falls below this level, you\'ll receive notifications.'
        },
        {
          question: 'How do I manage multiple locations?',
          answer: 'Go to Locations to add and manage multiple business locations. Each location can have separate inventory tracking.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      icon: CreditCard,
      faqs: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept M-Pesa, PayPal, Visa, Mastercard, and bank transfers for subscription payments.'
        },
        {
          question: 'How do I set up M-Pesa integration?',
          answer: 'Go to Settings > Payment Integration, enter your M-Pesa business details, and follow the verification process.'
        },
        {
          question: 'Can I process customer payments through the system?',
          answer: 'Yes, you can process payments through our integrated payment gateway for both online and in-person sales.'
        }
      ]
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: BarChart3,
      faqs: [
        {
          question: 'How do I generate sales reports?',
          answer: 'Go to Finances > Reports to generate various sales reports including daily, weekly, monthly, and custom date ranges.'
        },
        {
          question: 'Can I export data to Excel?',
          answer: 'Yes, all reports can be exported to Excel, PDF, or CSV formats for further analysis.'
        },
        {
          question: 'How do I track business performance?',
          answer: 'Use the Dashboard overview and AI Insights section to monitor key performance indicators and business trends.'
        }
      ]
    }
  ];

  const supportChannels = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageSquare,
      action: 'Start Chat',
      available: '24/7'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our experts',
      icon: Phone,
      action: 'Call Now',
      available: 'Mon-Fri 8AM-6PM'
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: Mail,
      action: 'Send Email',
      available: 'Response within 24hrs'
    },
    {
      title: 'Video Tutorial',
      description: 'Watch step-by-step guides',
      icon: Video,
      action: 'Watch Now',
      available: 'On-demand'
    }
  ];

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportForm.subject || !supportForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Simulate support ticket submission
    toast.success('Support ticket submitted successfully! We\'ll get back to you within 24 hours.');
    setSupportForm({
      subject: '',
      category: '',
      message: '',
      priority: 'medium'
    });
  };

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
          <p className="text-muted-foreground">
            Get help with OmniBiz features and find answers to common questions
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Support Center
        </Badge>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for help articles, features, or common issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="support">Contact Support</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          {/* Support Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {supportChannels.map((channel, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <channel.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">{channel.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{channel.description}</p>
                  <Badge variant="outline" className="text-xs mb-3">{channel.available}</Badge>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      switch(channel.title) {
                        case 'Live Chat':
                          // Open chat widget or redirect to chat page
                          toast.success('Opening live chat...');
                          window.open('https://tawk.to/chat/omnibiz', '_blank');
                          break;
                        case 'Phone Support':
                          // Open phone dialer
                          window.location.href = 'tel:+254700000000';
                          toast.success('Opening phone dialer...');
                          break;
                        case 'Email Support':
                          // Open email client
                          window.location.href = 'mailto:support@omnibiz.com?subject=Support Request';
                          toast.success('Opening email client...');
                          break;
                        case 'Video Tutorial':
                          // Open video tutorials page
                          window.open('/tutorials', '_blank');
                          toast.success('Opening video tutorials...');
                          break;
                        default:
                          toast.info(`${channel.title} feature coming soon!`);
                      }
                    }}
                  >
                    {channel.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Categories */}
          <div className="space-y-6">
            {(searchQuery ? filteredFAQs : faqCategories).map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.faqs.map((faq, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        {faq.question}
                      </h4>
                      <p className="text-muted-foreground text-sm pl-6">{faq.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Ticket</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message and we'll help you out.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Subject *</label>
                    <Input
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={supportForm.category}
                      onChange={(e) => setSupportForm({...supportForm, category: e.target.value})}
                    >
                      <option value="">Select a category</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="feature">Feature Request</option>
                      <option value="general">General Question</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={supportForm.priority}
                    onChange={(e) => setSupportForm({...supportForm, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Message *</label>
                  <Textarea
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                    placeholder="Please describe your issue in detail..."
                    rows={5}
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Support Ticket
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Step-by-step video guides for all OmniBiz features
                </p>
                <Button variant="outline" className="w-full">
                  Watch Tutorials
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive guides and API documentation
                </p>
                <Button variant="outline" className="w-full">
                  Read Docs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with other OmniBiz users and share tips
                </p>
                <Button variant="outline" className="w-full">
                  Join Community
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Help;
