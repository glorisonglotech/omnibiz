import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Upload, 
  Download, 
  FileText, 
  Settings, 
  TrendingUp,
  Package,
  ShoppingBag,
  BarChart,
  Users,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

const QuickActions = ({ onAddProduct, onImport, onExport, onGenerateReport }) => {
  const actions = [
    {
      icon: Plus,
      label: "Add Product",
      description: "Add new product to inventory",
      onClick: onAddProduct,
      variant: "default",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      icon: Upload,
      label: "Import Products",
      description: "Bulk import from CSV/Excel",
      onClick: onImport,
      variant: "outline"
    },
    {
      icon: Download,
      label: "Export Data",
      description: "Download products & orders",
      onClick: onExport,
      variant: "outline"
    },
    {
      icon: FileText,
      label: "Generate Report",
      description: "Sales & inventory reports",
      onClick: onGenerateReport,
      variant: "outline"
    },
    {
      icon: TrendingUp,
      label: "Analytics",
      description: "View detailed insights",
      onClick: () => {
        const section = document.getElementById('analytics-section');
        section?.scrollIntoView({ behavior: 'smooth' });
      },
      variant: "outline"
    },
    {
      icon: Settings,
      label: "Store Settings",
      description: "Configure your store",
      onClick: () => toast.info("Store settings coming soon!"),
      variant: "outline"
    }
  ];

  const stats = [
    { icon: ShoppingBag, label: "Orders Today", value: "12", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Package, label: "Low Stock Items", value: "8", color: "text-yellow-600", bg: "bg-yellow-50" },
    { icon: Users, label: "New Customers", value: "5", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: DollarSign, label: "Today's Revenue", value: "$1.2k", color: "text-green-600", bg: "bg-green-50" }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                onClick={action.onClick}
                className={`h-auto flex-col items-start gap-2 p-4 ${action.color || ''}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <action.icon className="h-5 w-5" />
                  <span className="font-semibold">{action.label}</span>
                </div>
                <span className="text-xs text-left opacity-80 font-normal">
                  {action.description}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;
