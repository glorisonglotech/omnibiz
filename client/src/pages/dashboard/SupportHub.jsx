import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, Video, Users, BookOpen, Github, 
  Mail, Phone, Headphones, Star 
} from 'lucide-react';

// Import support components
import FeedbackSystem from '@/components/support/FeedbackSystem';
import CommunitySupport from '@/components/support/CommunitySupport';
import VideoDemos from '@/components/support/VideoDemos';

const SupportHub = () => {
  const [activeTab, setActiveTab] = useState('feedback');

  const supportStats = [
    {
      title: 'Active Tickets',
      value: '12',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Response Time',
      value: '2.5h',
      icon: Headphones,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Video Tutorials',
      value: '24',
      icon: Video,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Community Members',
      value: '1,234',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Support Hub</h1>
        <p className="text-muted-foreground">
          Get help, access resources, and connect with the community
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {supportStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Support Center</CardTitle>
          <CardDescription>
            Choose a support option that works best for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feedback" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback & Support
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2">
                <Video className="h-4 w-4" />
                Video Tutorials
              </TabsTrigger>
              <TabsTrigger value="community" className="gap-2">
                <Users className="h-4 w-4" />
                Community
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feedback" className="mt-6">
              <FeedbackSystem />
            </TabsContent>

            <TabsContent value="videos" className="mt-6">
              <VideoDemos />
            </TabsContent>

            <TabsContent value="community" className="mt-6">
              <CommunitySupport />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-sm text-muted-foreground">
                ominbizsolutions@gmail.com
              </p>
              <Badge variant="outline">Response within 24h</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Phone Support</h3>
              <p className="text-sm text-muted-foreground">
                +254 758 175 275
              </p>
              <Badge variant="outline">Mon-Fri 9AM-5PM</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                <Github className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold">GitHub</h3>
              <p className="text-sm text-muted-foreground">
                github.com/omnibiz
              </p>
              <Badge variant="outline">Open Source</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportHub;
