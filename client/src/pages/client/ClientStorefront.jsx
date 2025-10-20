import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  ShoppingCart, Search, Filter, Plus, Minus, Trash2, Package, User, LogOut, 
  History, ShieldCheck, Calendar, MapPin, Clock, Star, Heart, MessageCircle,
  Settings, Bell, CreditCard, Shield, Phone, Mail, Edit2, Save, Building, 
  Users as UsersIcon, Eye, DollarSign
} from "lucide-react";
import ProductDetailDialog  from "@/components/storefront/ProductDetailDialog";
import CheckoutFlow  from "@/components/storefront/CheckoutFlow";
import ServiceBookingFlow  from "@/components/storefront/ServiceBookingFlow";
import  OrderHistory  from "@/components/storefront/OrderHistory";
import  BookingHistory  from "@/components/storefront/BookingHistory";
import  LiveChatWidget  from "@/components/storefront/LiveChatWidget";
import AppointmentBooking from "@/components/storefront/AppointmentBooking";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import { useSocket } from "@/context/SocketContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ThemeSelector from "@/components/ThemeSelector";
import { AVAILABLE_THEMES } from "@/context/ThemeContext";
import { customerAPI } from "@/lib/api";

// Sample services with prices for demo/fallback
const sampleServices = [
  {
    id: 'sample-1',
    name: 'Professional Haircut & Styling',
    description: 'Expert haircut and styling service tailored to your preferences. Includes wash, cut, and blow-dry.',
    price: 1500,
    duration: '45 min',
    category: 'Hair & Beauty',
    bookings: 156,
    rating: 4.9,
    staff: 3,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500'
  },
  {
    id: 'sample-2',
    name: 'Full Body Massage',
    description: 'Relaxing full body massage to relieve stress and tension. Perfect for unwinding after a long day.',
    price: 3500,
    duration: '90 min',
    category: 'Wellness & Spa',
    bookings: 89,
    rating: 5.0,
    staff: 2,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500'
  },
  {
    id: 'sample-3',
    name: 'Manicure & Pedicure',
    description: 'Complete nail care service including filing, buffing, cuticle care, and polish application.',
    price: 2000,
    duration: '60 min',
    category: 'Hair & Beauty',
    bookings: 234,
    rating: 4.8,
    staff: 4,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500'
  },
  {
    id: 'sample-4',
    name: 'Personal Training Session',
    description: 'One-on-one fitness training with certified personal trainer. Customized workout plan included.',
    price: 2500,
    duration: '60 min',
    category: 'Fitness & Health',
    bookings: 67,
    rating: 4.9,
    staff: 5,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500'
  },
  {
    id: 'sample-5',
    name: 'Deep Tissue Massage',
    description: 'Therapeutic massage targeting deep muscle layers to relieve chronic pain and muscle tension.',
    price: 4000,
    duration: '75 min',
    category: 'Wellness & Spa',
    bookings: 112,
    rating: 5.0,
    staff: 2,
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=500'
  },
  {
    id: 'sample-6',
    name: 'Facial Treatment',
    description: 'Rejuvenating facial treatment with deep cleansing, exfoliation, and hydration for glowing skin.',
    price: 3000,
    duration: '60 min',
    category: 'Hair & Beauty',
    bookings: 145,
    rating: 4.8,
    staff: 3,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500'
  },
  {
    id: 'sample-7',
    name: 'Yoga Class',
    description: 'Group or private yoga session for flexibility, strength, and mindfulness. All levels welcome.',
    price: 1200,
    duration: '60 min',
    category: 'Fitness & Health',
    bookings: 198,
    rating: 4.9,
    staff: 2,
    image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=500'
  },
  {
    id: 'sample-8',
    name: 'Hair Coloring Service',
    description: 'Professional hair coloring with premium products. Includes consultation, application, and styling.',
    price: 4500,
    duration: '120 min',
    category: 'Hair & Beauty',
    bookings: 78,
    rating: 4.7,
    staff: 3,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500'
  },
  {
    id: 'sample-9',
    name: 'Nutritional Consultation',
    description: 'Personalized nutrition plan and dietary guidance from certified nutritionist.',
    price: 2800,
    duration: '45 min',
    category: 'Fitness & Health',
    bookings: 45,
    rating: 4.8,
    staff: 1,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500'
  },
  {
    id: 'sample-10',
    name: 'Hot Stone Massage',
    description: 'Luxurious massage using heated stones to melt away tension and promote deep relaxation.',
    price: 4500,
    duration: '90 min',
    category: 'Wellness & Spa',
    bookings: 91,
    rating: 5.0,
    staff: 2,
    image: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=500'
  },
  {
    id: 'sample-11',
    name: 'Makeup Application',
    description: 'Professional makeup for events, photoshoots, or special occasions. Includes consultation.',
    price: 3500,
    duration: '60 min',
    category: 'Hair & Beauty',
    bookings: 123,
    rating: 4.9,
    staff: 2,
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500'
  },
  {
    id: 'sample-12',
    name: 'Aromatherapy Session',
    description: 'Therapeutic treatment using essential oils to enhance physical and emotional well-being.',
    price: 3200,
    duration: '60 min',
    category: 'Wellness & Spa',
    bookings: 67,
    rating: 4.8,
    staff: 2,
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=500'
  },
  {
    id: 'sample-13',
    name: 'Group Fitness Class',
    description: 'High-energy group workout including cardio, strength training, and flexibility exercises.',
    price: 800,
    duration: '45 min',
    category: 'Fitness & Health',
    bookings: 312,
    rating: 4.7,
    staff: 3,
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500'
  },
  {
    id: 'sample-14',
    name: 'Reflexology Treatment',
    description: 'Foot reflexology targeting pressure points to promote healing and relaxation throughout the body.',
    price: 2500,
    duration: '60 min',
    category: 'Wellness & Spa',
    bookings: 89,
    rating: 4.9,
    staff: 2,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500'
  },
  {
    id: 'sample-15',
    name: 'Bridal Hair & Makeup',
    description: 'Complete bridal beauty package including hair styling, makeup, and trial session.',
    price: 8500,
    duration: '150 min',
    category: 'Hair & Beauty',
    bookings: 34,
    rating: 5.0,
    staff: 2,
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500'
  }
];

const ClientStorefront = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const { socket, connected } = useSocket();
  
  // Storefront-specific theme state (separate from main dashboard)
  const [storefrontTheme, setStorefrontTheme] = useState(() => {
    return localStorage.getItem('storefront-theme') || 'light';
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { items: cart, add: addCartItem, update: updateCartQty, remove: removeCartItem, clear: clearCart, total: cartTotal, count: cartItemCount } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showServiceBooking, setShowServiceBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("shop");
  const [locations, setLocations] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [userAccount, setUserAccount] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeDiscounts, setActiveDiscounts] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeOwner, setStoreOwner] = useState({
    businessName: "ominbiz Store",
    ownerName: "Store Owner",
  });

  // Fetch store owner data on mount
  useEffect(() => {
    const fetchStoreOwner = async () => {
      if (!inviteCode) return;
      try {
        const response = await api.get(`/public/store-owner/${inviteCode}`);
        setStoreOwner({
          businessName: response.data.businessName || response.data.name,
          ownerName: response.data.name,
          email: response.data.businessEmail,
          phone: response.data.businessPhone,
          address: response.data.businessAddress
        });
      } catch (error) {
        console.error('Error fetching store owner:', error);
        toast.error('Could not load store information');
      }
    };
    fetchStoreOwner();
  }, [inviteCode]);

  // Fetch all data from API with real-time sync
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('customerToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch products, locations, team, services, discounts in parallel
        const [productsRes, locationsRes, teamRes, servicesRes, discountsRes] = await Promise.allSettled([
          api.get("/products", { headers, params: { inviteCode } }),
          api.get("/locations", { headers }),
          api.get("/team", { headers }),
          api.get("/public/services", { params: { inviteCode } }),
          api.get("/public/discounts", { params: { inviteCode, active: true } }),
        ]);

        // Set products - ONLY show real products from this store
        if (productsRes.status === 'fulfilled' && productsRes.value.data?.length > 0) {
          setProducts(productsRes.value.data);
          console.log('✅ Loaded', productsRes.value.data.length, 'products from store');
        } else if (!inviteCode) {
          // Only use sample products if no invite code
          setProducts(sampleProducts);
          console.warn('⚠️ No invite code - showing sample products');
        } else {
          // Store has no products yet
          setProducts([]);
          console.log('ℹ️ Store has no products yet');
        }

        // Set locations
        if (locationsRes.status === 'fulfilled') {
          setLocations(locationsRes.value.data || []);
          if (locationsRes.value.data?.length > 0) {
            setSelectedLocation(locationsRes.value.data[0]);
          }
        }

        // Set team members
        if (teamRes.status === 'fulfilled') {
          setTeamMembers(teamRes.value.data || []);
        }

        // Set discounts and apply to products
        if (discountsRes.status === 'fulfilled' && discountsRes.value.data?.length > 0) {
          setActiveDiscounts(discountsRes.value.data);
          const discounted = discountsRes.value.data
            .filter(d => d.active && d.applicableProducts?.length > 0)
            .flatMap(d => d.applicableProducts.map(pid => ({ productId: pid, discount: d })));
          setDiscountedProducts(discounted);
        }

        // Set services from database with complete details
        if (servicesRes.status === 'fulfilled' && servicesRes.value.data?.length > 0) {
          const realServices = servicesRes.value.data.map((service) => ({
            _id: service._id,
            id: service._id,
            name: service.name,
            description: service.description || 'Professional service',
            price: service.price || 0,
            duration: service.duration || '60 min',
            category: service.category || 'General',
            bookings: service.bookings || 0,
            rating: service.rating || 5,
            staff: service.availableTeamMembers?.length || teamMembers.length || 1,
            image: service.image
          }));
          setServices(realServices);
          console.log('✅ Loaded', realServices.length, 'services from database');
        } else if (!inviteCode) {
          // Show sample services only if no invite code (demo mode)
          setServices(sampleServices);
          console.log('📋 Showing', sampleServices.length, 'sample services (demo mode)');
        } else {
          // Show sample services when store has no services yet
          setServices(sampleServices);
          console.log('📋 No services in database, showing', sampleServices.length, 'sample services');
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Could not load some information. Please refresh.");
        setProducts(sampleProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // Set up real-time refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [inviteCode, teamMembers.length]);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket || !connected || !inviteCode) return;

    // Join storefront room
    socket.emit('join_storefront', inviteCode);

    // Listen for product sync
    socket.on('product_sync', (data) => {
      console.log('Product sync:', data);
      if (data.type === 'insert') {
        setProducts(prev => [data.product, ...prev]);
        toast.success(`New product: ${data.product.name}`);
      } else if (data.type === 'update') {
        setProducts(prev => prev.map(p => 
          p._id === data.product._id ? data.product : p
        ));
        toast.info(`Product updated: ${data.product.name}`);
      } else if (data.type === 'delete') {
        setProducts(prev => prev.filter(p => p._id !== data.product._id));
        toast.info(`Product removed`);
      }
    });

    // Listen for service sync
    socket.on('service_sync', (data) => {
      console.log('Service sync:', data);
      if (data.type === 'insert') {
        setServices(prev => [data.service, ...prev]);
        toast.success(`New service: ${data.service.name}`);
      } else if (data.type === 'update') {
        setServices(prev => prev.map(s => 
          s._id === data.service._id ? data.service : s
        ));
        toast.info(`Service updated: ${data.service.name}`);
      } else if (data.type === 'delete') {
        setServices(prev => prev.filter(s => s._id !== data.service._id));
        toast.info(`Service removed`);
      }
    });

    // Listen for location sync
    socket.on('location_sync', (data) => {
      console.log('Location sync:', data);
      if (data.type === 'insert') {
        setLocations(prev => [data.location, ...prev]);
        toast.success(`New location: ${data.location.name}`);
      } else if (data.type === 'update') {
        setLocations(prev => prev.map(l => 
          l._id === data.location._id ? data.location : l
        ));
        toast.info(`Location updated: ${data.location.name}`);
      } else if (data.type === 'delete') {
        setLocations(prev => prev.filter(l => l._id !== data.location._id));
        toast.info(`Location removed`);
      }
    });

    // Listen for team sync
    socket.on('team_sync', (data) => {
      console.log('Team sync:', data);
      if (data.type === 'insert') {
        setTeamMembers(prev => [data.team, ...prev]);
        toast.success(`New team member: ${data.team.name}`);
      } else if (data.type === 'update') {
        setTeamMembers(prev => prev.map(t => 
          t._id === data.team._id ? data.team : t
        ));
        toast.info(`Team member updated: ${data.team.name}`);
      } else if (data.type === 'delete') {
        setTeamMembers(prev => prev.filter(t => t._id !== data.team._id));
        toast.info(`Team member removed`);
      }
    });

    // Listen for stock alerts
    socket.on('stock_alert', (data) => {
      if (data.alertType === 'out_of_stock') {
        toast.error(`Out of Stock: ${data.product.name} is currently unavailable`);
      }
    });

    // Listen for order updates
    socket.on('order_updated', (data) => {
      if (data.order.customer?.email === customer?.email) {
        toast.info(`Order Update: Your order status is ${data.order.status}`);
      }
    });

    // Clean up function
    return () => {
      if (socket && connected) {
        // Leave storefront room
        socket.emit('leave_storefront', inviteCode);
        
        // Remove all listeners
        socket.off('product_sync');
        socket.off('service_sync');
        socket.off('location_sync');
        socket.off('team_sync');
        socket.off('stock_alert');
        socket.off('order_updated');
      }
    };
  }, [socket, connected, inviteCode, customer]);

  // Handle user account button
  const handleUserAccount = () => {
    if (customer) {
      setActiveTab('account');
      toast.success(`Welcome ${customer.name}!`);
    } else {
      toast.info('Please sign in to access more features');
      navigate(`/client/login/${inviteCode}`);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (customer) {
      logout();
      clearCart();
      setWishlist([]);
      toast.success('You have been successfully logged out');
      navigate(`/client/login/${inviteCode}`);
    } else {
      toast.info('You are not currently logged in');
    }
  };

  // Handle storefront theme change (doesn't affect main dashboard)
  const handleThemeChange = (newTheme) => {
    setStorefrontTheme(newTheme);
    localStorage.setItem('storefront-theme', newTheme);
    setShowThemeSelector(false);
    toast.success(`Storefront theme: ${newTheme}`);
  };

  // Apply storefront theme on mount and changes
  useEffect(() => {
    const applyStorefrontTheme = () => {
      try {
        const currentTheme = AVAILABLE_THEMES[storefrontTheme];

        if (!currentTheme || !currentTheme.colors) {
          console.warn('Theme not found:', storefrontTheme);
          return;
        }

        // Helper to convert hex to HSL
        const hexToHSL = (hex) => {
          try {
            hex = hex.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) / 255;
            const g = parseInt(hex.substring(2, 4), 16) / 255;
            const b = parseInt(hex.substring(4, 6), 16) / 255;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            
            if (max === min) {
              h = s = 0;
            } else {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
              }
            }
            
            return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
          } catch (e) {
            console.error('Error converting hex to HSL:', hex, e);
            return '0 0% 50%';
          }
        };

        // Wait for container to be available
        const applyToContainer = () => {
          const storefrontContainer = document.querySelector('.storefront-container');
          
          if (!storefrontContainer) {
            console.warn('Storefront container not found, retrying...');
            setTimeout(applyToContainer, 100);
            return;
          }

          const primaryHSL = hexToHSL(currentTheme.colors.primary);
          const secondaryHSL = hexToHSL(currentTheme.colors.secondary);
          const accentHSL = hexToHSL(currentTheme.colors.accent);
          const backgroundHSL = currentTheme.colors.background.startsWith('#') 
            ? hexToHSL(currentTheme.colors.background) 
            : '0 0% 100%';
          const foregroundHSL = hexToHSL(currentTheme.colors.foreground);

          // Apply CSS variables
          storefrontContainer.style.setProperty('--primary', primaryHSL);
          storefrontContainer.style.setProperty('--primary-foreground', '0 0% 100%');
          storefrontContainer.style.setProperty('--secondary', secondaryHSL);
          storefrontContainer.style.setProperty('--secondary-foreground', foregroundHSL);
          storefrontContainer.style.setProperty('--accent', accentHSL);
          storefrontContainer.style.setProperty('--accent-foreground', foregroundHSL);
          storefrontContainer.style.setProperty('--background', backgroundHSL);
          storefrontContainer.style.setProperty('--foreground', foregroundHSL);
          storefrontContainer.style.setProperty('--card', backgroundHSL);
          storefrontContainer.style.setProperty('--card-foreground', foregroundHSL);
          storefrontContainer.style.setProperty('--popover', backgroundHSL);
          storefrontContainer.style.setProperty('--popover-foreground', foregroundHSL);
          storefrontContainer.style.setProperty('--muted', secondaryHSL);
          storefrontContainer.style.setProperty('--muted-foreground', '0 0% 45%');
          storefrontContainer.style.setProperty('--border', `${primaryHSL.split(' ')[0]} 30% 80%`);
          storefrontContainer.style.setProperty('--input', `${primaryHSL.split(' ')[0]} 30% 80%`);
          storefrontContainer.style.setProperty('--ring', primaryHSL);

          console.log('✅ Storefront theme applied:', storefrontTheme);
        };

        applyToContainer();
      } catch (error) {
        console.error('Error applying storefront theme:', error);
      }
    };

    applyStorefrontTheme();
  }, [storefrontTheme]);

  // Sample products as fallback
  const sampleProducts = [
    {
      id: "1",
      name: "Premium Hair Shampoo",
      description: "Nourishing shampoo for all hair types with natural ingredients",
      price: 30,
      category: "Hair Care",
      stock: 25,
      image: "/placeholder.svg",
      rating: 4.8,
      specs: ["250ml bottle", "Sulfate-free", "pH balanced", "Natural ingredients"],
      reviews: [
        { id: "r1", author: "Jane Doe", rating: 5, comment: "Best shampoo I've ever used!", date: "2025-10-10" },
        { id: "r2", author: "John Smith", rating: 4, comment: "Great product, will buy again", date: "2025-10-08" },
      ],
    },
    {
      id: "2",
      name: "Hair Styling Gel",
      description: "Strong hold gel with natural finish and no residue",
      price: 16,
      category: "Hair Care",
      stock: 40,
      image: "/placeholder.svg",
      rating: 4.5,
      specs: ["150ml", "Water-based", "Easy wash out", "Long-lasting hold"],
      reviews: [
        { id: "r3", author: "Mike Johnson", rating: 5, comment: "Perfect hold without being sticky", date: "2025-10-12" },
      ],
    },
    {
      id: "3",
      name: "Organic Face Mask",
      description: "Deep cleansing and hydrating mask with organic ingredients",
      price: 45,
      category: "Skincare",
      stock: 15,
      image: "/placeholder.svg",
      rating: 4.9,
      specs: ["100ml", "Organic certified", "Vegan", "Cruelty-free"],
      reviews: [
        { id: "r4", author: "Sarah Lee", rating: 5, comment: "My skin feels amazing!", date: "2025-10-11" },
      ],
    },
    {
      id: "4",
      name: "Professional Hair Dryer",
      description: "Fast drying with heat protection and ionic technology",
      price: 200,
      category: "Tools",
      stock: 8,
      image: "/placeholder.svg",
      rating: 4.7,
      specs: ["2200W", "Ionic technology", "3 heat settings", "Cool shot button"],
      reviews: [
        { id: "r5", author: "Emily White", rating: 5, comment: "Salon quality at home!", date: "2025-10-09" },
      ],
    },
    {
      id: "5",
      name: "Moisturizing Cream",
      description: "24-hour hydration with SPF 15 protection",
      price: 35,
      category: "Skincare",
      stock: 30,
      image: "/placeholder.svg",
      rating: 4.6,
      specs: ["50ml", "SPF 15", "Non-greasy", "Suitable for all skin types"],
      reviews: [],
    },
    {
      id: "6",
      name: "Hair Brush Set",
      description: "Professional quality brushes for all hair types",
      price: 28,
      category: "Tools",
      stock: 20,
      image: "/placeholder.svg",
      rating: 4.4,
      specs: ["3-piece set", "Bamboo handle", "Anti-static bristles", "Ergonomic design"],
      reviews: [],
    },
  ];

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    const productId = product._id || product.id;
    const availableStock = product.stockQuantity || product.stock || 0;
    
    const existingItem = cart.find((item) => (item._id || item.id) === productId);
    if (existingItem) {
      if (existingItem.quantity < availableStock) {
        updateCartQty(productId, existingItem.quantity + 1);
        toast.success(`${product.name} quantity increased`);
      } else {
        toast.error(`Stock limit reached: Only ${availableStock} available`);
      }
    } else {
      addCartItem({ ...product, _id: productId, id: productId, stock: availableStock, stockQuantity: availableStock }, 1);
      toast.success(`🛍️ ${product.name} added to cart!`);
    }
  };

  const updateQuantity = (productId, change) => {
    const item = cart.find((item) => (item._id || item.id) === productId);
    if (!item) return;
    const availableStock = item.stockQuantity || item.stock || 0;
    const newQuantity = item.quantity + change;
    
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > availableStock) {
      toast.error(`Stock limit reached: Only ${availableStock} available`);
      return;
    }

    updateCartQty(productId, newQuantity);
  };

  const removeFromCart = (productId) => {
    const item = cart.find((item) => (item._id || item.id) === productId);
    removeCartItem(productId);
    if (item) {
      toast.info(`${item.name} removed from cart`);
    }
  };

  // Wishlist functions
  const toggleWishlist = (product) => {
    const productId = product._id || product.id;
    const isInWishlist = wishlist.some(item => (item._id || item.id) === productId);
    
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => (item._id || item.id) !== productId));
      toast.info(`${product.name} removed from wishlist`);
    } else {
      setWishlist([...wishlist, product]);
      toast.success(`❤️ ${product.name} added to wishlist`);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => (item._id || item.id) === productId);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      const response = await customerAPI.updateProfile(editFormData);
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        setShowEditProfile(false);
        // Refresh customer data
        window.location.reload();
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="storefront-container min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background smooth-scroll">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{storeOwner.businessName}</h1>
                <p className="text-xs text-muted-foreground">by {storeOwner.ownerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === "orders" ? "default" : "ghost"}
                size="icon"
                onClick={() => setActiveTab("orders")}
                className="hidden sm:flex"
              >
                <History className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleUserAccount}
                title="My Account"
              >
                <User className="h-5 w-5" />
              </Button>
              <Sheet open={showThemeSelector} onOpenChange={setShowThemeSelector}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" title="Change Theme">
                    <Settings className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Theme Settings</SheetTitle>
                    <SheetDescription>
                      Choose your preferred theme
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <ThemeSelector onThemeChange={handleThemeChange} currentTheme={storefrontTheme} />
                  </div>
                </SheetContent>
              </Sheet>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                title={customer ? "Logout" : "Login"}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="shop" className="gap-1">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Shop</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-1">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="space-y-6">
            {/* Active Discounts Banner */}
            {activeDiscounts.length > 0 && (
              <Card className="glass-card bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                        <span className="text-white font-bold text-lg">%</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Special Offers Active!</h3>
                        <p className="text-sm text-muted-foreground">
                          {activeDiscounts.length} discount{activeDiscounts.length > 1 ? 's' : ''} available - Look for products with discount badges
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-4">
              <Badge variant="outline" className="gap-2 px-4 py-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                Secure Payment
              </Badge>
              <Badge variant="outline" className="gap-2 px-4 py-2">
                <Package className="h-4 w-4 text-primary" />
                Fast Delivery
              </Badge>
              <Badge variant="outline" className="gap-2 px-4 py-2">
                <ShieldCheck className="h-4 w-4 text-warning" />
                7-Day Returns
              </Badge>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-panel"
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px] glass-panel">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-lg border-white/20">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="gap-2 relative">
                      <ShoppingCart className="h-4 w-4" />
                      Cart
                      {cartItemCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center badge-pulse">
                          {cartItemCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md overflow-y-auto glass-panel">
                    <SheetHeader>
                      <SheetTitle>Shopping Cart</SheetTitle>
                      <SheetDescription>
                        {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in your cart
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      {cart.length === 0 ? (
                        <div className="text-center py-12">
                          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Your cart is empty</p>
                        </div>
                      ) : (
                        <>
                          {cart.map((item) => (
                            <Card key={item._id || item.id} className="glass-card">
                              <CardContent className="p-4">
                                <div className="flex gap-4">
                                  <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm">{item.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      KES {item.price.toFixed(2)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-7 w-7"
                                        onClick={() => updateQuantity(item.id, -1)}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-sm font-medium w-8 text-center">
                                        {item.quantity}
                                      </span>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-7 w-7"
                                        onClick={() => updateQuantity(item.id, 1)}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 ml-auto"
                                        onClick={() => removeFromCart(item.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          <div className="border-t pt-4">
                            <div className="flex justify-between text-lg font-bold mb-4">
                              <span>Total:</span>
                              <span>KES {cartTotal.toFixed(2)}</span>
                            </div>
                            <Button className="w-full" size="lg" onClick={handleCheckout}>
                              Proceed to Checkout
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product._id || product.id} 
                      className="group glass-card cursor-pointer relative overflow-hidden hover:shadow-xl transition-all duration-300"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {/* Wishlist Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                      >
                        <Heart 
                          className={`h-4 w-4 transition-all ${
                            isInWishlist(product._id || product.id) 
                              ? "fill-red-500 text-red-500" 
                              : "text-muted-foreground"
                          }`} 
                        />
                      </Button>

                      <CardHeader className="p-0">
                        <div className="aspect-square bg-gradient-to-br from-secondary/30 to-primary/10 rounded-t-lg flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-20 w-20 text-primary/40 product-card-image" />
                          )}
                          
                          {/* Stock Badge Overlay */}
                          <div className="absolute bottom-2 left-2">
                            <Badge variant={(product.stockQuantity || product.stock) > 10 ? "default" : (product.stockQuantity || product.stock) === 0 ? "destructive" : "secondary"} className="shadow-lg">
                              {(product.stockQuantity || product.stock) === 0 ? "Out of Stock" : `${product.stockQuantity || product.stock} left`}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <CardTitle className="text-base line-clamp-1 flex-1">{product.name}</CardTitle>
                          </div>
                          
                          {/* Rating Stars */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${
                                    i < Math.floor(product.rating || 4.5) 
                                      ? "fill-yellow-500 text-yellow-500" 
                                      : "text-muted-foreground"
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {product.rating || 4.5}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            {/* Check if product has discount */}
                            {(() => {
                              const productDiscount = discountedProducts.find(d => d.productId === (product._id || product.id));
                              if (productDiscount) {
                                const discount = productDiscount.discount;
                                const discountAmount = discount.discountType === 'percentage' 
                                  ? (product.price * discount.discountValue / 100)
                                  : discount.discountValue;
                                const finalPrice = product.price - discountAmount;
                                
                                return (
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg font-bold text-primary">
                                        KES {finalPrice.toFixed(2)}
                                      </span>
                                      <Badge variant="destructive" className="text-xs animate-pulse">
                                        -{discount.discountType === 'percentage' ? `${discount.discountValue}%` : `KES ${discount.discountValue}`}
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground line-through">
                                      KES {product.price.toFixed(2)}
                                    </span>
                                  </div>
                                );
                              }
                              return (
                                <span className="text-lg font-bold text-primary">
                                  KES {(product.price || 0).toFixed(2)}
                                </span>
                              );
                            })()}
                          </div>
                          <Badge variant="outline" className="text-xs">{product.category || 'General'}</Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 gap-2">
                        <Button
                          className="flex-1 gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          disabled={(product.stockQuantity || product.stock) === 0}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {(product.stockQuantity || product.stock) === 0 ? "Out of Stock" : "Add to Cart"}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {filteredProducts.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No products found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            {/* Services & Appointments Section */}
            <div className="space-y-4">
              {/* Location Selector */}
              {locations.length > 0 && (
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <Label>Select Location</Label>
                        <Select
                          value={selectedLocation?._id || selectedLocation?.id}
                          onValueChange={(value) => {
                            const location = locations.find(l => (l._id || l.id) === value);
                            setSelectedLocation(location);
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Choose a location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((loc) => (
                              <SelectItem key={loc._id || loc.id} value={loc._id || loc.id}>
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4" />
                                  {loc.name} - {loc.city}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {selectedLocation && (
                      <div className="mt-3 p-3 bg-accent/20 rounded-lg">
                        <p className="text-sm font-medium">{selectedLocation.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedLocation.address}, {selectedLocation.city}</p>
                        {selectedLocation.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" /> {selectedLocation.phone}
                          </p>
                        )}
                        {selectedLocation.operatingHours && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {selectedLocation.operatingHours}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Available Services */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">Our Services</h2>
                    <p className="text-muted-foreground mt-1">
                      Professional services delivered by our expert team {services.length > 0 && `• ${services.length} available`}
                    </p>
                  </div>
                  {services.length > 0 && (
                    <Badge variant="default" className="text-sm px-4 py-2 animate-pulse">
                      <Calendar className="h-4 w-4 mr-1" />
                      {services.length} Live Services
                    </Badge>
                  )}
                </div>
                
                {loading ? (
                  <Card className="glass-card">
                    <CardContent className="p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading services...</p>
                    </CardContent>
                  </Card>
                ) : services.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="p-12 text-center">
                      <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Services Available Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Services will appear here once the store owner adds them.
                      </p>
                      <Button variant="outline" onClick={() => {
                        // Refresh services
                        window.location.reload();
                      }}>
                        Refresh Page
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                      <Card key={service._id || service.id} className="glass-card hover:shadow-xl transition-all duration-300 group overflow-hidden">
                        {/* Service Image/Icon */}
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                          {service.image ? (
                            <img 
                              src={service.image} 
                              alt={service.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Calendar className="h-16 w-16 text-primary/40" />
                            </div>
                          )}
                          {/* Category Badge Overlay */}
                          {service.category && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-white/90 text-foreground backdrop-blur-sm">
                                {service.category}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                            {service.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 justify-between">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {service.duration}
                            </span>
                            <Badge variant="secondary" className="gap-1">
                              <UsersIcon className="h-3 w-3" />
                              {service.staff} staff
                            </Badge>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold text-primary">
                              KES {(service.price || 0).toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1 text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${
                                    i < Math.floor(service.rating || 5) 
                                      ? "fill-current" 
                                      : "text-muted-foreground"
                                  }`} 
                                />
                              ))}
                            </div>
                          </div>
                          {service.bookings > 0 && (
                            <p className="text-xs text-muted-foreground mb-3">
                              {service.bookings} bookings completed
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedService(service);
                                toast.info('Service details opened');
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedService(service);
                                setShowServiceBooking(true);
                              }}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Book Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Team Members Available */}
              {teamMembers.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <UsersIcon className="h-5 w-5" />
                    Our Team
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {teamMembers.slice(0, 8).map((member) => (
                      <Card key={member._id || member.id} className="text-center glass-card">
                        <CardContent className="p-4">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-3 flex items-center justify-center">
                            <User className="h-8 w-8 text-primary-foreground" />
                          </div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <OrderHistory />
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            {/* User Account Section */}
            {!customer ? (
              <Card className="glass-card">
                <CardContent className="p-12 text-center">
                  <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">Sign In Required</h3>
                  <p className="text-muted-foreground mb-6">
                    Please log in to access your account, orders, and personalized features
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => navigate(`/client/login/${inviteCode}`)}>
                      Sign In
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/client/register/${inviteCode}`)}>
                      Create Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Profile Header */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    My Account
                  </CardTitle>
                  <CardDescription>Manage your profile and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <User className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{customer?.name || 'Guest User'}</h3>
                      <p className="text-sm text-muted-foreground">{customer?.email || 'Not logged in'}</p>
                      <Badge className="mt-1">{customer ? 'Premium Member' : 'Guest'}</Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (customer) {
                          setEditFormData({
                            name: customer.name || '',
                            phone: customer.phone || '',
                          });
                          setShowEditProfile(true);
                        } else {
                          toast.info('Please login to edit profile');
                          navigate(`/client/login/${inviteCode}`);
                        }
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{cart.length}</p>
                    <p className="text-xs text-muted-foreground">Cart Items</p>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p className="text-2xl font-bold">{wishlist.length}</p>
                    <p className="text-xs text-muted-foreground">Wishlist</p>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <History className="h-8 w-8 mx-auto mb-2 text-accent" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">100</p>
                    <p className="text-xs text-muted-foreground">Reward Points</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => setActiveTab('orders')}>
                      <ShoppingCart className="h-6 w-6" />
                      <span className="text-sm">View Orders</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => setActiveTab('shop')}>
                      <Package className="h-6 w-6" />
                      <span className="text-sm">Shop Products</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => setActiveTab('services')}>
                      <Calendar className="h-6 w-6" />
                      <span className="text-sm">Book Service</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => {
                      setShowEditProfile(true);
                    }}>
                      <Settings className="h-6 w-6" />
                      <span className="text-sm">Settings</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Wishlist Section */}
              {wishlist.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        My Wishlist
                      </CardTitle>
                      <Badge>{wishlist.length} items</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {wishlist.slice(0, 4).map((item) => (
                        <Card key={item._id || item.id} className="group cursor-pointer" onClick={() => setSelectedProduct(item)}>
                          <CardContent className="p-3">
                            <div className="aspect-square bg-gradient-to-br from-secondary/30 to-primary/10 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                              <Package className="h-8 w-8 text-primary/40" />
                            </div>
                            <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground">KES {(item.price || 0).toLocaleString()}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {wishlist.length > 4 && (
                      <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('shop')}>
                        View All {wishlist.length} Items
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Rewards & Loyalty */}
              <Card className="glass-card bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Rewards & Loyalty
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Current Points</span>
                      <span className="text-2xl font-bold text-primary">100</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{width: '20%'}}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">400 more points to next reward</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-card rounded-lg border">
                      <p className="text-xs text-muted-foreground">Lifetime Points</p>
                      <p className="text-lg font-bold">100</p>
                    </div>
                    <div className="p-3 bg-card rounded-lg border">
                      <p className="text-xs text-muted-foreground">Member Since</p>
                      <p className="text-lg font-bold">2025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Cart updated</p>
                        <p className="text-xs text-muted-foreground">{cart.length} items in cart</p>
                      </div>
                      <Badge variant="secondary">Now</Badge>
                    </div>
                    {wishlist.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                        <Heart className="h-5 w-5 text-red-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Wishlist updated</p>
                          <p className="text-xs text-muted-foreground">{wishlist.length} items saved</p>
                        </div>
                        <Badge variant="secondary">Recent</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Booking History */}
              <BookingHistory />

              {/* Account Actions */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-between" onClick={() => setShowEditProfile(true)}>
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Edit Profile
                    </span>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between" onClick={() => setActiveTab('orders')}>
                    <span className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Order History
                    </span>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between" onClick={() => setShowThemeSelector(true)}>
                    <span className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Theme Preferences
                    </span>
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" className="w-full justify-between" onClick={handleLogout}>
                    <span className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals and Widgets */}
      {/* Product Detail Dialog */}
      {selectedProduct && (
        <ProductDetailDialog 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Service Details Dialog */}
      {selectedService && (
        <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedService.name}</DialogTitle>
              <DialogDescription>Complete service details and booking information</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Service Image */}
              {selectedService.image && (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src={selectedService.image} 
                    alt={selectedService.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Service Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-xl font-bold">KES {(selectedService.price || 0).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Clock className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-xl font-bold">{selectedService.duration}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedService.description || 'Professional service provided by our expert team.'}</p>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-6 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{selectedService.rating || 5}/5</span>
                </div>
                {selectedService.bookings > 0 && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{selectedService.bookings} bookings</span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedService(null)}>
                  Close
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    if (!customer) {
                      toast.error('Please log in to book services');
                      navigate(`/client/login/${inviteCode}`);
                      setSelectedService(null);
                      return;
                    }
                    setActiveTab('account');
                    toast.success(`Selected: ${selectedService.name}`);
                    setSelectedService(null);
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Service
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your personal information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="pl-10"
                  placeholder="Your full name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  className="pl-10"
                  placeholder="+254 700 000 000"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditProfile(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleProfileUpdate}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Flow */}
      <CheckoutFlow
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartItems={cart}
        cartTotal={cartTotal}
        onClearCart={clearCart}
      />

      {/* Service Booking Flow */}
      <ServiceBookingFlow
        open={showServiceBooking}
        onClose={() => {
          setShowServiceBooking(false);
          setSelectedService(null);
        }}
        service={selectedService}
      />

      <LiveChatWidget />
    </div>
  );
};

export default ClientStorefront;