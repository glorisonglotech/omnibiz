import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, Video, Users, MessageSquare, TrendingUp, 
  Star, Github, Twitter, Linkedin, Mail, Award
} from 'lucide-react';

// Import support components
import FeedbackSystem from '@/components/support/FeedbackSystem';
import CommunitySupport from '@/components/support/CommunitySupport';
import VideoDemos from '@/components/support/VideoDemos';

const ResourceCenter = () => {
  const [activeTab, setActiveTab] = useState('videos');

  const stats = [
    {
      title: 'Video Tutorials',
      value: '24+',
      icon: Video,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Community Members',
      value: '1,234',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Resources',
      value: '156',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Feedback Received',
      value: '89',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Learning & Resources Center
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore tutorials, join the community, and share your feedback
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button>
            <Star className="mr-2 h-4 w-4" />
            Rate Us
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
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
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Explore Resources
          </CardTitle>
          <CardDescription>
            Learn, connect, and grow with OmniBiz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="videos" className="gap-2">
                <Video className="h-4 w-4" />
                Video Tutorials
              </TabsTrigger>
              <TabsTrigger value="community" className="gap-2">
                <Users className="h-4 w-4" />
                Community
              </TabsTrigger>
              <TabsTrigger value="feedback" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="mt-6">
              <VideoDemos />
            </TabsContent>

            <TabsContent value="community" className="mt-6">
              <CommunitySupport />
            </TabsContent>

            <TabsContent value="feedback" className="mt-6">
              <FeedbackSystem />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Documentation</h3>
              <p className="text-sm text-muted-foreground">
                Complete guides and API docs
              </p>
              <Badge variant="outline">Updated Daily</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Join Community</h3>
              <p className="text-sm text-muted-foreground">
                Connect with 1,200+ users
              </p>
              <Badge variant="outline">Active Now</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Contribute</h3>
              <p className="text-sm text-muted-foreground">
                Help improve OmniBiz
              </p>
              <Badge variant="outline">Open Source</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Links Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-2">Stay Connected</h3>
              <p className="text-sm text-muted-foreground">
                Follow us on social media for updates and tips
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceCenter;
