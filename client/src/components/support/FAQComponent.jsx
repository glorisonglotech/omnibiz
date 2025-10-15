import React from 'react';
import { Search, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const FAQComponent = ({
  faqItems = [],
  searchQuery = '',
  onSearchChange,
  onMarkHelpful
}) => {
  const filteredFAQs = faqItems.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={onSearchChange}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No FAQs found matching "{searchQuery}"</p>
              <p className="text-sm mt-2">Try adjusting your search</p>
            </div>
          ) : (
            filteredFAQs.map(faq => (
              <div key={faq.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-2 flex items-start gap-2">
                      <span className="text-primary">Q:</span>
                      <span>{faq.question}</span>
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 ml-6">
                      <span className="text-green-600 font-medium">A:</span> {faq.answer}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground ml-6">
                      <Badge variant="secondary">{faq.category}</Badge>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {faq.helpful}
                      </span>
                      <span>{faq.views} views</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onMarkHelpful(faq.id, true)}
                      title="Mark as helpful"
                      className="hover:bg-green-50 hover:text-green-600"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onMarkHelpful(faq.id, false)}
                      title="Mark as not helpful"
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FAQComponent;
