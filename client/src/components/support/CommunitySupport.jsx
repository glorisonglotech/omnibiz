import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, ThumbsUp, ThumbsDown, Search, TrendingUp, 
  Users, BookOpen, Video, Github, Twitter, Linkedin, Mail,
  Star, Award, CheckCircle, MessageSquare, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const CommunitySupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discussions');

  // Sample community data
  const discussions = [
    {
      id: 1,
      title: 'How to integrate payment gateway?',
      author: 'John Doe',
      avatar: 'JD',
      replies: 12,
      likes: 24,
      status: 'answered',
      category: 'Integration',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      title: 'Best practices for inventory management',
      author: 'Jane Smith',
      avatar: 'JS',
      replies: 8,
      likes: 15,
      status: 'open',
      category: 'Best Practices',
      timestamp: '5 hours ago'
    },
    {
      id: 3,
      title: 'Video call feature not working',
      author: 'Mike Johnson',
      avatar: 'MJ',
      replies: 5,
      likes: 7,
      status: 'resolved',
      category: 'Technical',
      timestamp: '1 day ago'
    }
  ];

  const topContributors = [
    { name: 'Sarah Wilson', posts: 145, reputation: 2840, avatar: 'SW' },
    { name: 'David Brown', posts: 128, reputation: 2350, avatar: 'DB' },
    { name: 'Emma Davis', posts: 98, reputation: 1920, avatar: 'ED' }
  ];

  const resources = [
    {
      title: 'Getting Started Guide',
      type: 'Documentation',
      icon: BookOpen,
      link: '#',
      description: 'Complete guide to get started with OmniBiz'
    },
    {
      title: 'Video Tutorials',
      type: 'Video',
      icon: Video,
      link: '#',
      description: 'Step-by-step video tutorials'
    },
    {
      title: 'GitHub Repository',
      type: 'Code',
      icon: Github,
      link: 'https://github.com/omnibiz',
      description: 'Contribute to our open-source project'
    },
    {
      title: 'API Documentation',
      type: 'Technical',
      icon: BookOpen,
      link: '#',
      description: 'Complete API reference and examples'
    }
  ];

  const socialLinks = [
    { name: 'GitHub', icon: Github, link: 'https://github.com/omnibiz-solutions', color: 'text-gray-800' },
    { name: 'Twitter', icon: Twitter, link: 'https://twitter.com/omnibiz_solutions', color: 'text-blue-500' },
    { name: 'LinkedIn', icon: Linkedin, link: 'https://linkedin.com/company/omnibiz-solutions', color: 'text-blue-700' },
    { name: 'Email', icon: Mail, link: 'mailto:ominbizsolutions@gmail.com', color: 'text-red-600' }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      answered: 'bg-green-100 text-green-800',
      open: 'bg-blue-100 text-blue-800',
      resolved: 'bg-purple-100 text-purple-800'
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Community Support</h2>
          <p className="text-muted-foreground">
            Connect with other users, share knowledge, and get help
          </p>
        </div>
        <Button>
          <MessageCircle className="mr-2 h-4 w-4" />
          Start Discussion
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions, documentation, and more..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Discussions</p>
                <p className="text-2xl font-bold">892</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resources</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contributors</p>
                <p className="text-2xl font-bold">342</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Discussions</CardTitle>
              <CardDescription>Join the conversation and help others</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="discussions">Discussions</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                </TabsList>

                <TabsContent value="discussions" className="space-y-4">
                  {discussions.map((discussion) => (
                    <Card key={discussion.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback>{discussion.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold hover:text-primary">
                                  {discussion.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  by {discussion.author} • {discussion.timestamp}
                                </p>
                              </div>
                              {getStatusBadge(discussion.status)}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <Badge variant="outline">{discussion.category}</Badge>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {discussion.replies} replies
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {discussion.likes} likes
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="resources" className="space-y-4">
                  {resources.map((resource, index) => {
                    const Icon = resource.icon;
                    return (
                      <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{resource.title}</h4>
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {resource.description}
                              </p>
                              <Badge variant="outline" className="mt-2">
                                {resource.type}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </TabsContent>

                <TabsContent value="videos" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Video className="h-12 w-12 text-primary" />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-1">Video Tutorial {i}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Learn how to use OmniBiz effectively
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">12:34</span>
                            <Button size="sm" variant="ghost">Watch</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Contributors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topContributors.map((contributor, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{contributor.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{contributor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {contributor.posts} posts • {contributor.reputation} rep
                    </p>
                  </div>
                  <Star className="h-4 w-4 text-yellow-500" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connect With Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(social.link, '_blank')}
                  >
                    <Icon className={`mr-2 h-4 w-4 ${social.color}`} />
                    {social.name}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask a Question
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Read Documentation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunitySupport;
