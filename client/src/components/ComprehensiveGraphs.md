# ComprehensiveGraphs Component Documentation

## Overview

The `ComprehensiveGraphs` component is a powerful, reusable charting solution built with Recharts that provides interactive data visualization capabilities across the OmniBiz application. It supports multiple chart types, real-time updates, and comprehensive customization options.

## Features

- **Multiple Chart Types**: Line, Area, Bar, Pie, and Composed charts
- **Real-time Updates**: Auto-refresh functionality with configurable intervals
- **Interactive Controls**: Chart type switching, time range selection
- **Data Export**: CSV export functionality
- **Responsive Design**: Works seamlessly across all screen sizes
- **Custom Styling**: Adaptive color schemes based on data context
- **Error Handling**: Graceful handling of missing or invalid data

## Installation

The component requires the following dependencies:
```bash
pnpm add recharts
```

## Basic Usage

```jsx
import ComprehensiveGraphs from '@/components/ComprehensiveGraphs';

// Basic line chart
<ComprehensiveGraphs
  title="Sales Trends"
  description="Monthly sales performance"
  type="line"
  data={salesData}
  height={300}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | Array | null | Chart data array |
| `type` | String | 'line' | Chart type: 'line', 'area', 'bar', 'pie', 'composed' |
| `title` | String | 'Analytics Chart' | Chart title |
| `description` | String | '' | Chart description |
| `height` | Number | 300 | Chart height in pixels |
| `showControls` | Boolean | true | Show/hide chart controls |
| `autoRefresh` | Boolean | false | Enable auto-refresh |
| `refreshInterval` | Number | 30000 | Refresh interval in milliseconds |
| `className` | String | '' | Additional CSS classes |
| `onDataUpdate` | Function | null | Callback when data updates |

## Chart Types

### Line Chart
Best for showing trends over time.
```jsx
<ComprehensiveGraphs
  type="line"
  data={trendData}
  title="Revenue Trends"
/>
```

### Area Chart
Ideal for showing cumulative values and filled areas.
```jsx
<ComprehensiveGraphs
  type="area"
  data={cumulativeData}
  title="Cumulative Sales"
/>
```

### Bar Chart
Perfect for comparing discrete categories.
```jsx
<ComprehensiveGraphs
  type="bar"
  data={categoryData}
  title="Sales by Category"
/>
```

### Pie Chart
Great for showing proportions and distributions.
```jsx
<ComprehensiveGraphs
  type="pie"
  data={distributionData}
  title="Market Share"
  showControls={false}
/>
```

### Composed Chart
Combines multiple chart types for complex data visualization.
```jsx
<ComprehensiveGraphs
  type="composed"
  data={complexData}
  title="Revenue vs Profit"
/>
```

## Data Format

The component expects data in the following format:

```javascript
const chartData = [
  {
    name: 'Jan',           // X-axis label
    date: '2024-01-01',    // Optional: ISO date string
    value: 1000,           // Primary value
    revenue: 1200,         // Optional: additional metrics
    profit: 300,
    orders: 45,
    customers: 23
  },
  // ... more data points
];
```

## Real-time Updates

Enable auto-refresh for live data updates:

```jsx
<ComprehensiveGraphs
  title="Live Sales Data"
  type="line"
  data={liveData}
  autoRefresh={true}
  refreshInterval={5000}  // Update every 5 seconds
  onDataUpdate={(newData) => {
    console.log('Data updated:', newData);
  }}
/>
```

## Custom Hooks Integration

Use with the provided `useGraphData` hook for API integration:

```jsx
import { useGraphData, dataTransformers } from '@/hooks/useGraphData';

const MyComponent = () => {
  const { data, loading, refresh } = useGraphData(
    '/api/sales-data',
    {
      autoRefresh: true,
      refreshInterval: 30000,
      transform: dataTransformers.salesData
    }
  );

  return (
    <ComprehensiveGraphs
      title="Sales Performance"
      type="area"
      data={data}
      loading={loading}
    />
  );
};
```

## Color Schemes

The component automatically applies color schemes based on the chart title:

- **Profit/Revenue**: Green color scheme
- **Loss/Expense**: Red color scheme  
- **Default**: Primary green scheme
- **Rainbow**: Multi-color scheme for pie charts

## Styling

The component uses Tailwind CSS and shadcn/ui components. You can customize the appearance by:

1. **CSS Classes**: Pass additional classes via the `className` prop
2. **Theme Variables**: Modify CSS custom properties
3. **Component Styling**: Override default styles in your CSS

## Examples

### Financial Dashboard
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <ComprehensiveGraphs
    title="Revenue vs Expenses"
    type="composed"
    data={financialData}
    height={350}
    autoRefresh={true}
  />
  
  <ComprehensiveGraphs
    title="Expense Categories"
    type="pie"
    data={expenseCategories}
    height={350}
    showControls={false}
  />
</div>
```

### Sales Analytics
```jsx
<ComprehensiveGraphs
  title="Sales Trends"
  description="Monthly sales performance with growth indicators"
  type="area"
  data={salesTrends}
  height={400}
  autoRefresh={true}
  refreshInterval={60000}
/>
```

### Customer Insights
```jsx
<ComprehensiveGraphs
  title="Customer Demographics"
  type="pie"
  data={demographicsData}
  height={300}
  showControls={false}
/>
```

## Best Practices

1. **Data Consistency**: Ensure data follows the expected format
2. **Performance**: Use appropriate refresh intervals for auto-refresh
3. **Accessibility**: Provide meaningful titles and descriptions
4. **Responsive Design**: Test charts on different screen sizes
5. **Error Handling**: Handle empty or invalid data gracefully

## Troubleshooting

### Common Issues

1. **Chart not rendering**: Check data format and ensure it's not null/undefined
2. **Auto-refresh not working**: Verify `autoRefresh` is true and `refreshInterval` is set
3. **Export not working**: Ensure data is available and properly formatted
4. **Styling issues**: Check Tailwind CSS classes and component structure

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug-graphs', 'true');
```

## Integration Examples

The component is already integrated across the OmniBiz application:

- **Dashboard**: Main overview charts
- **Analytics**: Detailed performance metrics
- **Finances**: Revenue, expenses, and profit analysis
- **AI Insights**: Predictive analytics and trends
- **Graphs Showcase**: Comprehensive demonstration of all features

## API Integration

The component works seamlessly with the provided data hooks:

```javascript
import { useMultipleGraphData, dataTransformers } from '@/hooks/useGraphData';

const endpoints = {
  sales: { 
    endpoint: '/api/sales', 
    transform: dataTransformers.salesData 
  },
  revenue: { 
    endpoint: '/api/revenue', 
    transform: dataTransformers.financialTrends 
  }
};

const { data, loading, refresh } = useMultipleGraphData(endpoints, {
  autoRefresh: true,
  refreshInterval: 30000
});
```

## Future Enhancements

Planned features for future versions:

- Additional chart types (Scatter, Radar, Treemap)
- Advanced filtering and drill-down capabilities
- Custom color palette selection
- Animation and transition effects
- PDF export functionality
- Real-time collaboration features
