import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, MessageCircle, Headphones, Calendar, Mail, Phone, Users, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const CommunicationHub = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    openTickets: 0,
    unreadMessages: 0,
    todayAppointments: 0
  });

  useEffect(() => {
    fetchCommunicationStats();
  }, []);

  const fetchCommunicationStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [sessions, tickets, appointments] = await Promise.allSettled([
        api.get('/sessions?upcoming=true', { headers }),
        api.get('/support/tickets?status=open', { headers }),
        api.get('/appointments', { headers })
      ]);

      setStats({
        upcomingSessions: sessions.status === 'fulfilled' ? sessions.value?.data?.length || 0 : 0,
        openTickets: tickets.status === 'fulfilled' ? tickets.value?.data?.length || 0 : 0,
        unreadMessages: 0, // Implement when message system is ready
        todayAppointments: appointments.status === 'fulfilled' 
          ? (appointments.value?.data?.filter(a => {
              const appointmentDate = new Date(a.date);
              const today = new Date();
              return appointmentDate.toDateString() === today.toDateString();
            }).length || 0)
          : 0
      });
    } catch (error) {
      console.error('Error fetching communication stats:', error);
    }
  };

  const communicationChannels = [
    {
      icon: Video,
      title: 'Live Sessions',
      description: 'Schedule and host video meetings',
      href: '/dashboard/sessions',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      stat: stats.upcomingSessions,
      statLabel: 'upcoming',
      badge: 'New',
      badgeColor: 'bg-green-500'
    },
    {
      icon: Headphones,
      title: 'Support Tickets',
      description: 'Manage customer support requests',
      href: '/dashboard/support',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      stat: stats.openTickets,
      statLabel: 'open'
    },
    {
      icon: MessageCircle,
      title: 'Messages',
      description: 'Chat with clients and team',
      href: '/dashboard/messages',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      stat: stats.unreadMessages,
      statLabel: 'unread'
    },
    {
      icon: Calendar,
      title: 'Appointments',
      description: 'View and manage bookings',
      href: '/dashboard/appointments',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      stat: stats.todayAppointments,
      statLabel: 'today'
    }
  ];

  const quickActions = [
    {
      icon: Video,
      label: 'Schedule Session',
      onClick: () => navigate('/dashboard/sessions'),
      variant: 'default'
    },
    {
      icon: MessageCircle,
      label: 'New Ticket',
      onClick: () => navigate('/dashboard/support'),
      variant: 'outline'
    },
    {
      icon: Mail,
      label: 'Send Email',
      onClick: () => window.location.href = 'mailto:',
      variant: 'outline'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Communication Hub
            </CardTitle>
            <CardDescription>
              Manage all your client communications in one place
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard/support')}
          >
            View All
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Communication Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {communicationChannels.map((channel) => (
            <Card
              key={channel.title}
              className="cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group"
              onClick={() => navigate(channel.href)}
            >
              <CardContent className="p-4">
                <div className={`${channel.bgColor} rounded-lg p-3 w-fit mb-3 group-hover:scale-110 transition-transform`}>
                  <channel.icon className={`h-6 w-6 ${channel.color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  {channel.title}
                  {channel.badge && (
                    <Badge className={`${channel.badgeColor} text-white text-[10px] px-1.5 py-0`}>
                      {channel.badge}
                    </Badge>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {channel.description}
                </p>
                {channel.stat !== undefined && (
                  <div className="text-lg font-bold">
                    {channel.stat}
                    <span className="text-xs text-muted-foreground font-normal ml-1">
                      {channel.statLabel}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                size="sm"
                onClick={action.onClick}
                className="gap-2"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Communication Tips */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Communication Tips
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use Live Sessions for face-to-face client meetings</li>
            <li>• Create support tickets for trackable customer issues</li>
            <li>• Schedule appointments for structured consultations</li>
            <li>• Response time affects customer satisfaction</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunicationHub;
