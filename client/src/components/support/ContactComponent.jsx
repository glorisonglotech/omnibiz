import React from 'react';
import { Phone, Mail, Video, Send, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const ContactComponent = ({ onSendQuickContact }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Get in touch with us through any of these channels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Phone Support</p>
              <p className="text-sm text-muted-foreground mt-1">+254 700 123 456</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Available 24/7</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Email Support</p>
              <p className="text-sm text-muted-foreground mt-1">support@omnibiz.com</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Response within 2 hours</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Video Support</p>
              <p className="text-sm text-muted-foreground mt-1">Schedule a video call</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Mon-Fri 9AM-6PM EAT</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Office Location</p>
              <p className="text-sm text-muted-foreground mt-1">
                123 Business Street<br />
                Nairobi, Kenya 00100
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Mon-Fri 8AM-5PM EAT</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Contact</CardTitle>
          <CardDescription>Send us a message and we'll create a ticket for you</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSendQuickContact} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-subject">Subject *</Label>
              <Input 
                id="contact-subject"
                name="subject"
                placeholder="How can we help?" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message *</Label>
              <Textarea 
                id="contact-message"
                name="message"
                placeholder="Describe your issue or question in detail..." 
                rows={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email (Optional)</Label>
              <Input 
                id="contact-email"
                name="email"
                type="email"
                placeholder="your.email@example.com" 
              />
            </div>
            <Button type="submit" className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> For urgent issues, please call our 24/7 support line or use the live chat feature for immediate assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactComponent;
