import React from 'react';
import { Users, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const SupportAgentsSidebar = ({
  supportAgents = [],
  activeAgent,
  onSelectAgent
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'away':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'away':
        return 'Away';
      default:
        return 'Offline';
    }
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Support Team
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] px-4">
          <div className="space-y-3 pb-4">
            {supportAgents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No agents available</p>
              </div>
            ) : (
              supportAgents.map(agent => (
                <div
                  key={agent.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    activeAgent?.id === agent.id 
                      ? 'bg-primary/10 border-primary shadow-sm' 
                      : 'hover:bg-muted border-transparent hover:border-muted-foreground/20'
                  }`}
                  onClick={() => onSelectAgent(agent)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {agent.name?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div 
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(agent.status)} ${
                          agent.status === 'online' ? 'animate-pulse' : ''
                        }`} 
                        title={getStatusText(agent.status)}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm truncate">{agent.name}</p>
                        {activeAgent?.id === agent.id && (
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
                      
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {agent.rating?.toFixed(1) || '5.0'}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({agent.reviewsCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {agent.specialties && agent.specialties.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {agent.specialties.slice(0, 3).map((specialty, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="text-xs py-0 px-1.5"
                        >
                          {specialty}
                        </Badge>
                      ))}
                      {agent.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs py-0 px-1.5">
                          +{agent.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {agent.languages && agent.languages.length > 0 && (
                    <div className="mt-1.5 text-xs text-muted-foreground">
                      🌐 {agent.languages.join(', ')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SupportAgentsSidebar;
