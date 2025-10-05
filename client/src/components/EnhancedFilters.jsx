import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Tag, 
  Users,
  Package,
  MapPin,
  Clock,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const EnhancedFilters = ({ 
  onFiltersChange, 
  availableFilters = [], 
  initialFilters = {},
  className = "" 
}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  // Default filter configurations
  const defaultFilters = {
    search: { type: 'text', label: 'Search', placeholder: 'Search...' },
    category: { 
      type: 'select', 
      label: 'Category', 
      options: ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports'] 
    },
    status: { 
      type: 'select', 
      label: 'Status', 
      options: ['All', 'Active', 'Inactive', 'Pending', 'Completed'] 
    },
    dateRange: { type: 'dateRange', label: 'Date Range' },
    priceRange: { 
      type: 'range', 
      label: 'Price Range', 
      min: 0, 
      max: 1000, 
      step: 10,
      format: (value) => `$${value}`
    },
    tags: { 
      type: 'multiSelect', 
      label: 'Tags', 
      options: ['Featured', 'Sale', 'New', 'Popular', 'Limited'] 
    },
    location: { 
      type: 'select', 
      label: 'Location', 
      options: ['All Locations', 'New York', 'Los Angeles', 'Chicago', 'Houston'] 
    },
    assignee: { 
      type: 'select', 
      label: 'Assignee', 
      options: ['All Users', 'John Doe', 'Jane Smith', 'Mike Johnson'] 
    }
  };

  const filterConfig = { ...defaultFilters, ...availableFilters };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilter = (key) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    setDateRange({ from: null, to: null });
    onFiltersChange?.({});
    toast.success('All filters cleared');
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key];
      return value && value !== '' && value !== 'All' && 
             (Array.isArray(value) ? value.length > 0 : true);
    }).length;
  };

  const renderFilter = (key, config) => {
    const value = filters[key];

    switch (config.type) {
      case 'text':
        return (
          <div key={key} className="space-y-2">
            <Label>{config.label}</Label>
            <Input
              placeholder={config.placeholder}
              value={value || ''}
              onChange={(e) => updateFilter(key, e.target.value)}
            />
          </div>
        );

      case 'select':
        return (
          <div key={key} className="space-y-2">
            <Label>{config.label}</Label>
            <Select value={value || 'All'} onValueChange={(val) => updateFilter(key, val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'multiSelect':
        const selectedValues = value || [];
        return (
          <div key={key} className="space-y-2">
            <Label>{config.label}</Label>
            <div className="space-y-2">
              {config.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${key}-${option}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...selectedValues, option]
                        : selectedValues.filter(v => v !== option);
                      updateFilter(key, newValues);
                    }}
                  />
                  <Label htmlFor={`${key}-${option}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'range':
        const rangeValue = value || [config.min, config.max];
        return (
          <div key={key} className="space-y-2">
            <Label>{config.label}</Label>
            <div className="px-2">
              <Slider
                value={rangeValue}
                onValueChange={(val) => updateFilter(key, val)}
                min={config.min}
                max={config.max}
                step={config.step}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{config.format ? config.format(rangeValue[0]) : rangeValue[0]}</span>
                <span>{config.format ? config.format(rangeValue[1]) : rangeValue[1]}</span>
              </div>
            </div>
          </div>
        );

      case 'dateRange':
        return (
          <div key={key} className="space-y-2">
            <Label>{config.label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range || { from: null, to: null });
                    updateFilter(key, range);
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      default:
        return null;
    }
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Filters</CardTitle>
                <div className="flex items-center space-x-2">
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-8 px-2 text-xs"
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Apply filters to refine your results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(filterConfig).map(([key, config]) =>
                renderFilter(key, config)
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || value === '' || value === 'All' || 
                (Array.isArray(value) && value.length === 0)) return null;

            const config = filterConfig[key];
            let displayValue = value;
            
            if (Array.isArray(value)) {
              displayValue = value.join(', ');
            } else if (config?.type === 'range') {
              displayValue = `${config.format ? config.format(value[0]) : value[0]} - ${config.format ? config.format(value[1]) : value[1]}`;
            } else if (config?.type === 'dateRange' && value?.from) {
              displayValue = value.to 
                ? `${format(value.from, "MMM dd")} - ${format(value.to, "MMM dd")}`
                : format(value.from, "MMM dd");
            }

            return (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                <span className="text-xs">
                  {config?.label}: {displayValue}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => clearFilter(key)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnhancedFilters;
