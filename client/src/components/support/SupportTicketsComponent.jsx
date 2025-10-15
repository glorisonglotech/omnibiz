import React from 'react';
import { Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const SupportTicketsComponent = ({
  tickets = [],
  newTicket,
  isCreateTicketOpen,
  onCreateTicketOpenChange,
  onTicketChange,
  onCreateTicket
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'in-progress':
        return 'default';
      case 'resolved':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Support Tickets</h2>
        <Dialog open={isCreateTicketOpen} onOpenChange={onCreateTicketOpenChange}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue and we'll get back to you as soon as possible.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-subject">Subject *</Label>
                <Input
                  id="ticket-subject"
                  placeholder="Brief description of your issue"
                  value={newTicket?.subject || ''}
                  onChange={(e) => onTicketChange({ ...newTicket, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-priority">Priority</Label>
                <Select 
                  value={newTicket?.priority || 'medium'} 
                  onValueChange={(value) => onTicketChange({ ...newTicket, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-description">Description *</Label>
                <Textarea
                  id="ticket-description"
                  placeholder="Provide detailed information about your issue"
                  rows={5}
                  value={newTicket?.description || ''}
                  onChange={(e) => onTicketChange({ ...newTicket, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onCreateTicketOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={onCreateTicket}>
                Create Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any support tickets yet
            </p>
            <Button onClick={() => onCreateTicketOpenChange(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map(ticket => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(ticket.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{ticket.subject}</h3>
                      <p className="text-sm text-muted-foreground mb-2">Ticket #{ticket.id}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getStatusColor(ticket.status)} className="capitalize">
                          {ticket.status}
                        </Badge>
                        <Badge variant={getPriorityColor(ticket.priority)} className="capitalize">
                          {ticket.priority} priority
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground ml-4">
                    <p className="font-medium text-foreground">
                      {ticket.agent || 'Unassigned'}
                    </p>
                    <p className="text-xs mt-1">
                      Created: {new Date(ticket.created).toLocaleDateString()}
                    </p>
                    <p className="text-xs">
                      Updated: {new Date(ticket.lastUpdate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportTicketsComponent;
