import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Video, Play, Search, Clock, Eye, ThumbsUp, Share2, Download,
  BookOpen, Code, Zap, Shield, Users, TrendingUp, Star, Filter
} from 'lucide-react';

const VideoDemos = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const videoCategories = [
    { id: 'all', name: 'All Videos', icon: Video, count: 24 },
    { id: 'getting-started', name: 'Getting Started', icon: Zap, count: 8 },
    { id: 'features', name: 'Features', icon: Star, count: 12 },
    { id: 'integration', name: 'Integration', icon: Code, count: 4 }
  ];

  const videos = [
    {
      id: 1,
      title: 'Getting Started with OmniBiz',
      description: 'Complete walkthrough of OmniBiz platform setup and configuration',
      thumbnail: 'https://via.placeholder.com/640x360?text=Getting+Started',
      duration: '12:34',
      views: 1234,
      likes: 98,
      category: 'getting-started',
      level: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      tags: ['setup', 'basics', 'tutorial'],
      publishedAt: '2024-01-15'
    },
    {
      id: 2,
      title: 'Inventory Management Tutorial',
      description: 'Learn how to effectively manage your inventory with real-time tracking',
      thumbnail: 'https://via.placeholder.com/640x360?text=Inventory+Management',
      duration: '18:45',
      views: 2456,
      likes: 156,
      category: 'features',
      level: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      tags: ['inventory', 'products', 'management'],
      publishedAt: '2024-01-20'
    },
    {
      id: 3,
      title: 'Setting Up Payment Integration',
      description: 'Step-by-step guide to integrate payment gateways',
      thumbnail: 'https://via.placeholder.com/640x360?text=Payment+Setup',
      duration: '15:20',
      views: 3421,
      likes: 234,
      category: 'integration',
      level: 'Advanced',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      tags: ['payments', 'integration', 'api'],
      publishedAt: '2024-02-01'
    },
    {
      id: 4,
      title: 'Client Storefront Customization',
      description: 'Customize your client-facing storefront with themes and branding',
      thumbnail: 'https://via.placeholder.com/640x360?text=Storefront+Custom',
      duration: '10:15',
      views: 1876,
      likes: 142,
      category: 'features',
      level: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      tags: ['storefront', 'customization', 'branding'],
      publishedAt: '2024-02-05'
    },
    {
      id: 5,
      title: 'Advanced Analytics Dashboard',
      description: 'Master the analytics dashboard and generate insightful reports',
      thumbnail: 'https://via.placeholder.com/640x360?text=Analytics',
      duration: '22:10',
      views: 2987,
      likes: 198,
      category: 'features',
      level: 'Advanced',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      tags: ['analytics', 'reports', 'insights'],
      publishedAt: '2024-02-10'
    },
    {
      id: 6,
      title: 'Service Booking System',
      description: 'Set up and manage service bookings with calendar integration',
      thumbnail: 'https://via.placeholder.com/640x360?text=Booking+System',
      duration: '16:30',
      views: 2145,
      likes: 167,
      category: 'features',
      level: 'Intermediate',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      tags: ['services', 'bookings', 'appointments'],
      publishedAt: '2024-02-12'
    },
    {
      id: 7,
      title: 'Real-time Notifications Setup',
      description: 'Configure real-time notifications for orders, bookings, and updates',
      thumbnail: 'https://via.placeholder.com/640x360?text=Notifications',
      duration: '08:45',
      views: 1654,
      likes: 123,
      category: 'features',
      level: 'Beginner',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      tags: ['notifications', 'realtime', 'setup'],
      publishedAt: '2024-02-15'
    },
    {
      id: 8,
      title: 'API Integration Guide',
      description: 'Complete guide to integrating external services via API',
      thumbnail: 'https://via.placeholder.com/640x360?text=API+Integration',
      duration: '25:00',
      views: 4321,
      likes: 289,
      category: 'integration',
      level: 'Advanced',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      tags: ['api', 'integration', 'development'],
      publishedAt: '2024-02-18'
    }
  ];

  const tutorials = [
    {
      id: 1,
      title: 'Quick Start Guide',
      description: '5-minute guide to get started',
      duration: '5:00',
      icon: Zap
    },
    {
      id: 2,
      title: 'Security Best Practices',
      description: 'Secure your business data',
      duration: '12:00',
      icon: Shield
    },
    {
      id: 3,
      title: 'Team Collaboration',
      description: 'Work efficiently with your team',
      duration: '10:00',
      icon: Users
    },
    {
      id: 4,
      title: 'Sales Optimization',
      description: 'Boost your sales with analytics',
      duration: '15:00',
      icon: TrendingUp
    }
  ];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || video.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getLevelBadge = (level) => {
    const styles = {
      Beginner: 'bg-green-100 text-green-800',
      Intermediate: 'bg-yellow-100 text-yellow-800',
      Advanced: 'bg-red-100 text-red-800'
    };
    return <Badge className={styles[level]}>{level}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Video Tutorials & Demos</h2>
          <p className="text-muted-foreground">
            Learn OmniBiz with step-by-step video guides
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Resources
          </Button>
          <Button>
            <BookOpen className="mr-2 h-4 w-4" />
            Documentation
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {videoCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeCategory === category.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-sm text-muted-foreground">{category.count} videos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Video Library</CardTitle>
              <CardDescription>
                {filteredVideos.length} videos available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVideos.map((video) => (
                  <Card
                    key={video.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedVideo(video)}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20">
                      <div className="absolute inset-0 flex items-center justify-center group">
                        <div className="bg-black/60 rounded-full p-4 group-hover:scale-110 transition-transform">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                        {video.duration}
                      </div>
                      {getLevelBadge(video.level)}
                    </div>

                    {/* Content */}
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 line-clamp-2">{video.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {video.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {video.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {video.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {video.duration}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {video.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Tutorials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Tutorials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tutorials.map((tutorial) => {
                const Icon = tutorial.icon;
                return (
                  <div
                    key={tutorial.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{tutorial.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tutorial.description}
                        </p>
                        <span className="text-xs text-primary mt-1 inline-block">
                          {tutorial.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Popular Videos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Most Popular</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {videos.slice(0, 3).sort((a, b) => b.views - a.views).map((video) => (
                <div
                  key={video.id}
                  className="flex gap-3 cursor-pointer hover:bg-muted p-2 rounded transition-colors"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="w-20 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded flex items-center justify-center">
                    <Play className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.views} views</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Video Player Dialog */}
      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedVideo.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getLevelBadge(selectedVideo.level)}
                    <span className="text-sm text-muted-foreground">
                      {selectedVideo.views} views • {selectedVideo.publishedAt}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {selectedVideo.likes}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground">{selectedVideo.description}</p>

                <div className="flex gap-2">
                  {selectedVideo.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default VideoDemos;
