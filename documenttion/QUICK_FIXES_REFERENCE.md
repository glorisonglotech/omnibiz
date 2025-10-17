# Quick Fixes Reference

**Last Updated**: October 17, 2025  
**Version**: 2.1.1

---

## ⚡ Quick Error Solutions

### Error: "Cannot read properties of undefined (reading 'map')"

**Solution**: Always check if array exists before mapping
```javascript
// ❌ Wrong
{items.map(item => <div>{item}</div>)}

// ✅ Correct
{items && Array.isArray(items) && items.map(item => <div>{item}</div>)}

// ✅ Or use optional chaining
{items?.map(item => <div>{item}</div>) || null}
```

---

### Error: "Objects are not valid as a React child"

**Solution**: Don't render objects directly, use their properties
```javascript
// ❌ Wrong - Rendering an object
<div>{userObject}</div>
<div>{toast({ title: "Hello" })}</div>

// ✅ Correct - Render object properties
<div>{userObject.name}</div>
<div>{userObject.email}</div>

// For toast, use sonner instead of useToast
toast.success("Message");  // ✅
toast({ title: "Message" });  // ❌
```

---

### Error: "404 Not Found on /api/public/products"

**Solution**: Check if endpoint exists or use correct endpoint
```javascript
// If /api/public/products doesn't exist, use:
api.get("/products", { headers })

// Or create the public endpoint in backend
```

---

## 🔧 Common Toast Fixes

### Using Sonner (Recommended)

```javascript
import { toast } from "sonner";

// Success
toast.success("Operation successful");

// Error
toast.error("Operation failed");

// Info
toast.info("Here's some information");

// Warning
toast.warning("Please be careful");

// With duration
toast.success("Message", { duration: 5000 });

// With action
toast.success("Item added", {
  action: {
    label: "Undo",
    onClick: () => console.log("Undo"),
  },
});
```

### Using useToast (Alternative)

```javascript
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

// Use with object
toast({
  title: "Success",
  description: "Operation completed",
  variant: "default", // or "destructive"
});

// But DON'T render the toast call
// ❌ Wrong: <div>{toast({ title: "Hi" })}</div>
// ✅ Correct: Call in onClick or useEffect
```

---

## 🎨 Theme Switching

```javascript
import { useAppTheme } from "@/context/ThemeContext";

const { theme, setTheme } = useAppTheme();

// Change theme
setTheme('dark');
setTheme('cyberpunk');
setTheme('matrix');

// Available themes: light, dark, blue, purple, green, 
// orange, rose, cyberpunk, matrix, dracula, nord, 
// tokyonight, monokai, and 15+ more!
```

---

## 🔐 Authentication Checks

```javascript
import { useAuth } from "@/context/AuthContext";

const { user, logout } = useAuth();

// Check if logged in
if (user) {
  // User is logged in
  console.log(user.name, user.email);
} else {
  // User is not logged in
  navigate('/login');
}

// Logout
logout();
clearCart();
navigate('/');
```

---

## 🔄 Real-Time Updates

```javascript
import { useSocket } from "@/context/SocketContext";

const { socket, connected } = useSocket();

useEffect(() => {
  if (!socket || !connected) return;

  socket.on('event_name', (data) => {
    // Handle event
    console.log('Received:', data);
  });

  return () => {
    socket.off('event_name');
  };
}, [socket, connected]);
```

---

## 📦 Safe Data Access

```javascript
// ❌ Unsafe - Can crash
const name = user.profile.name;

// ✅ Safe - Won't crash
const name = user?.profile?.name;
const name = user?.profile?.name || 'Default';

// ❌ Unsafe array access
data.items.map(item => item.name)

// ✅ Safe array access
data?.items?.map(item => item.name) || []
data.items && Array.isArray(data.items) && data.items.map(...)
```

---

## 🎯 Button onClick Patterns

```javascript
// Simple action
<Button onClick={() => toast.success("Clicked!")}>
  Click Me
</Button>

// With navigation
<Button onClick={() => {
  toast.success("Navigating...");
  navigate('/page');
}}>
  Go
</Button>

// With authentication check
<Button onClick={() => {
  if (user) {
    performAction();
  } else {
    toast.info("Please login");
    navigate('/login');
  }
}}>
  Action
</Button>

// With state update
<Button onClick={() => {
  setIsOpen(true);
  toast.success("Opened");
}}>
  Open
</Button>
```

---

## 🛒 Cart Operations

```javascript
import { useCart } from "@/context/CartContext";

const { 
  items: cart, 
  add: addCartItem, 
  update: updateCartQty, 
  remove: removeCartItem, 
  clear: clearCart, 
  total: cartTotal, 
  count: cartItemCount 
} = useCart();

// Add to cart
addCartItem(product, quantity);

// Update quantity
updateCartQty(productId, newQuantity);

// Remove from cart
removeCartItem(productId);

// Clear cart
clearCart();

// Get totals
console.log(cartTotal, cartItemCount);
```

---

## 📝 Form Handling

```javascript
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: ''
});

// Update single field
const handleChange = (field, value) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));
};

// Submit form
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await api.post('/endpoint', formData);
    toast.success("Form submitted");
  } catch (error) {
    toast.error(error.message);
  }
};

// Usage
<Input 
  value={formData.name}
  onChange={(e) => handleChange('name', e.target.value)}
/>
```

---

## 🔍 Search & Filter

```javascript
// Search products
const [searchQuery, setSearchQuery] = useState("");

const filteredProducts = products.filter(product =>
  product.name.toLowerCase().includes(searchQuery.toLowerCase())
);

// Filter by category
const [categoryFilter, setCategoryFilter] = useState("all");

const filtered = products.filter(product =>
  categoryFilter === "all" || product.category === categoryFilter
);

// Combined search and filter
const results = products.filter(product => {
  const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
  return matchesSearch && matchesCategory;
});
```

---

## ⚠️ Common Pitfalls

### 1. Rendering Objects
```javascript
// ❌ Don't do this
<div>{userObject}</div>
<p>{dataObject}</p>

// ✅ Do this
<div>{userObject.name}</div>
<p>{dataObject.message}</p>
```

### 2. Missing Dependencies
```javascript
// ❌ Wrong
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency

// ✅ Correct
useEffect(() => {
  fetchData(userId);
}, [userId]); // Include all dependencies
```

### 3. Async in useEffect
```javascript
// ❌ Wrong
useEffect(async () => {
  await fetchData();
}, []);

// ✅ Correct
useEffect(() => {
  const loadData = async () => {
    await fetchData();
  };
  loadData();
}, []);
```

### 4. State Updates
```javascript
// ❌ Wrong - Mutating state
items.push(newItem);
setItems(items);

// ✅ Correct - New array
setItems([...items, newItem]);

// ❌ Wrong - Direct object mutation
user.name = "New Name";
setUser(user);

// ✅ Correct - New object
setUser({ ...user, name: "New Name" });
```

---

## 🎨 Styling Quick Tips

```javascript
// Conditional classes
<div className={`base-class ${isActive ? 'active' : 'inactive'}`}>

// Multiple conditions
<div className={`
  ${isActive && 'active'}
  ${isDisabled && 'disabled'}
  ${size === 'lg' && 'text-lg'}
`}>

// Dynamic styles
<div style={{ 
  color: isError ? 'red' : 'black',
  fontSize: `${size}px` 
}}>
```

---

## 📚 Quick Commands

### Run Development Server
```bash
# Client
cd client
npm run dev

# Server
cd server
npm start
```

### Fix Common Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run build --force
```

---

## ✅ Quick Checklist Before Deploy

- [ ] No console errors
- [ ] All buttons have onClick
- [ ] All toasts use sonner or proper useToast
- [ ] Authentication checks in place
- [ ] Optional chaining for nested objects
- [ ] Array checks before .map()
- [ ] Environment variables set
- [ ] API endpoints exist
- [ ] Real-time features tested
- [ ] Mobile responsive

---

**Keep this reference handy for quick fixes!** 🚀

