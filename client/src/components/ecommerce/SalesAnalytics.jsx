import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  Calendar,
  BarChart3
} from "lucide-react";

const SalesAnalytics = ({ orders = [], timeFrame = "month" }) => {
  // Calculate analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const startOfPeriod = new Date();
    
    // Set start date based on timeframe
    switch(timeFrame) {
      case "week":
        startOfPeriod.setDate(now.getDate() - 7);
        break;
      case "month":
        startOfPeriod.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startOfPeriod.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startOfPeriod.setMonth(now.getMonth() - 1);
    }

    const currentOrders = orders.filter(o => new Date(o.date) >= startOfPeriod);
    const previousStart = new Date(startOfPeriod);
    previousStart.setTime(previousStart.getTime() - (now.getTime() - startOfPeriod.getTime()));
    const previousOrders = orders.filter(o => {
      const date = new Date(o.date);
      return date >= previousStart && date < startOfPeriod;
    });

    const currentRevenue = currentOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const previousRevenue = previousOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100)
      : 100;

    const ordersGrowth = previousOrders.length > 0
      ? ((currentOrders.length - previousOrders.length) / previousOrders.length * 100)
      : 100;

    const avgOrderValue = currentOrders.length > 0
      ? currentRevenue / currentOrders.length
      : 0;

    const previousAvgValue = previousOrders.length > 0
      ? previousRevenue / previousOrders.length
      : 0;
    
    const avgValueGrowth = previousAvgValue > 0
      ? ((avgOrderValue - previousAvgValue) / previousAvgValue * 100)
      : 100;

    // Get unique customers
    const uniqueCustomers = new Set(
      currentOrders.map(o => o.customer?.email).filter(Boolean)
    ).size;

    const previousCustomers = new Set(
      previousOrders.map(o => o.customer?.email).filter(Boolean)
    ).size;

    const customerGrowth = previousCustomers > 0
      ? ((uniqueCustomers - previousCustomers) / previousCustomers * 100)
      : 100;

    // Order status distribution
    const statusDistribution = currentOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Top products (from items in orders)
    const productSales = {};
    currentOrders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!productSales[item.name]) {
            productSales[item.name] = { count: 0, revenue: 0 };
          }
          productSales[item.name].count += item.quantity || 1;
          productSales[item.name].revenue += (item.price * item.quantity) || 0;
        });
      }
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      currentRevenue,
      revenueGrowth,
      ordersCount: currentOrders.length,
      ordersGrowth,
      avgOrderValue,
      avgValueGrowth,
      uniqueCustomers,
      customerGrowth,
      statusDistribution,
      topProducts,
      conversionRate: 3.2, // Placeholder - would need traffic data
      fulfillmentRate: currentOrders.length > 0 
        ? (currentOrders.filter(o => o.status === "Delivered").length / currentOrders.length * 100)
        : 0
    };
  }, [orders, timeFrame]);

  const StatCard = ({ title, value, icon: Icon, growth, subtitle, variant = "default" }) => {
    const isPositive = growth >= 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <Card className="hover:shadow-lg transition-shadow border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${
            variant === "revenue" ? "text-green-600" :
            variant === "orders" ? "text-blue-600" :
            variant === "customers" ? "text-purple-600" :
            "text-muted-foreground"
          }`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {growth !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendIcon className="h-3 w-3" />
              {Math.abs(growth).toFixed(1)}% from last {timeFrame}
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${analytics.currentRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          growth={analytics.revenueGrowth}
          variant="revenue"
        />
        <StatCard
          title="Orders"
          value={analytics.ordersCount}
          icon={ShoppingCart}
          growth={analytics.ordersGrowth}
          subtitle={`${analytics.statusDistribution.Delivered || 0} delivered`}
          variant="orders"
        />
        <StatCard
          title="Avg. Order Value"
          value={`$${analytics.avgOrderValue.toFixed(2)}`}
          icon={BarChart3}
          growth={analytics.avgValueGrowth}
        />
        <StatCard
          title="Customers"
          value={analytics.uniqueCustomers}
          icon={Users}
          growth={analytics.customerGrowth}
          subtitle={`${analytics.conversionRate}% conversion`}
          variant="customers"
        />
      </div>

      {/* Additional Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Status Distribution */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Order Status
            </CardTitle>
            <CardDescription>Current {timeFrame} breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.statusDistribution).map(([status, count]) => {
                const percentage = (count / analytics.ordersCount * 100).toFixed(1);
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Badge variant={
                          status === "Delivered" ? "default" :
                          status === "Shipped" ? "secondary" :
                          status === "Cancelled" ? "destructive" :
                          "outline"
                        }>
                          {status}
                        </Badge>
                      </span>
                      <span className="font-semibold">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          status === "Delivered" ? "bg-green-500" :
                          status === "Shipped" ? "bg-blue-500" :
                          status === "Cancelled" ? "bg-red-500" :
                          "bg-yellow-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top Performing Products
            </CardTitle>
            <CardDescription>By revenue this {timeFrame}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No product data available
                </p>
              ) : (
                analytics.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.count} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        ${product.revenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-accent/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Fulfillment Rate</div>
              <div className="text-2xl font-bold text-green-600">
                {analytics.fulfillmentRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Orders delivered successfully
              </div>
            </div>
            <div className="p-4 bg-accent/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Conversion Rate</div>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.conversionRate}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Visitors to customers
              </div>
            </div>
            <div className="p-4 bg-accent/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Revenue per Customer</div>
              <div className="text-2xl font-bold text-purple-600">
                ${analytics.uniqueCustomers > 0 
                  ? (analytics.currentRevenue / analytics.uniqueCustomers).toFixed(2) 
                  : '0.00'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Average customer value
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesAnalytics;
