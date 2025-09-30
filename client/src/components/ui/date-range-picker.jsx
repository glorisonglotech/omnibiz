import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DatePickerWithRange({ date, setDate, className, ...props }) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateRange = () => {
    if (!date) return 'Pick a date range';
    if (date.from && date.to) {
      return `${formatDate(date.from)} - ${formatDate(date.to)}`;
    }
    if (date.from) {
      return `${formatDate(date.from)} - ...`;
    }
    return 'Pick a date range';
  };

  const handleDateChange = (field, value) => {
    const newDate = { ...date };
    newDate[field] = new Date(value);
    
    // Ensure from date is before to date
    if (newDate.from && newDate.to && newDate.from > newDate.to) {
      if (field === 'from') {
        newDate.to = newDate.from;
      } else {
        newDate.from = newDate.to;
      }
    }
    
    setDate(newDate);
  };

  const getDateInputValue = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const presetRanges = [
    {
      label: 'Last 7 days',
      range: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date()
      }
    },
    {
      label: 'Last 30 days',
      range: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date()
      }
    },
    {
      label: 'Last 90 days',
      range: {
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: new Date()
      }
    },
    {
      label: 'This month',
      range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date()
      }
    }
  ];

  return (
    <div className={cn("relative", className)} {...props}>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="mr-2 h-4 w-4" />
        {formatDateRange()}
        <ChevronDown className="ml-auto h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-[300px] rounded-md border bg-white p-4 shadow-lg dark:bg-gray-800">
          {/* Preset Ranges */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Quick Select</h4>
            <div className="grid grid-cols-2 gap-2">
              {presetRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setDate(preset.range);
                    setIsOpen(false);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Inputs */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">From Date</label>
              <input
                type="date"
                value={getDateInputValue(date?.from)}
                onChange={(e) => handleDateChange('from', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">To Date</label>
              <input
                type="date"
                value={getDateInputValue(date?.to)}
                onChange={(e) => handleDateChange('to', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-4 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDate(null);
                setIsOpen(false);
              }}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
