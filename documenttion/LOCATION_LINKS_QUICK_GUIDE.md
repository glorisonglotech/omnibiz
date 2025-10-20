# 🔗 How to Link Locations with Everything - Quick Guide

## 1️⃣ **LOCATION → SALES**

### Database Connection:
```javascript
// Order model
{
  locationId: ObjectId, // Links to location
  totalAmount: Number,
  status: 'completed'
}

// Track in Location model
{
  salesData: {
    dailyRevenue: Number,
    totalOrders: Number,
    topProducts: Array
  }
}
```

### How it Works:
- Every order stores `locationId`
- Query orders by locationId to get sales
- Dashboard shows sales per location

---

## 2️⃣ **LOCATION → MARKETING**

### Database Connection:
```javascript
// Campaign model
{
  targetLocations: [ObjectId], // Multiple locations
  locationPerformance: [{
    locationId: ObjectId,
    conversions: Number,
    revenue: Number
  }]
}
```

### How it Works:
- Campaigns target specific locations
- Track which location generated what results
- Compare campaign performance by location

---

## 3️⃣ **LOCATION → SERVICES**

### Database Connection:
```javascript
// Service model
{
  availableAt: [ObjectId], // Locations offering this
  locationPricing: [{
    locationId: ObjectId,
    price: Number // Different price per location
  }]
}

// Location model
{
  services: [{
    serviceId: ObjectId,
    bookingsCount: Number,
    revenue: Number
  }]
}
```

### How it Works:
- Service knows which locations offer it
- Location knows which services it offers
- Different pricing per location possible

---

## 4️⃣ **LOCATION → MANAGER**

### Database Connection:
```javascript
// Location model
{
  manager: {
    userId: ObjectId, // Links to Team member
    name: String,
    since: Date
  }
}

// Team model
{
  assignedLocation: ObjectId,
  isLocationManager: Boolean
}
```

### How it Works:
- Each location has ONE manager
- Team member marked as location manager
- Manager dashboard shows their location data

---

## 5️⃣ **LOCATION → STAFF**

### Database Connection:
```javascript
// Location model
{
  staff: [{
    memberId: ObjectId,
    name: String,
    role: String,
    isPrimary: Boolean, // Main location?
    schedule: Object,
    performance: Object
  }]
}

// Team model
{
  primaryLocation: ObjectId,
  secondaryLocations: [ObjectId], // Can work at multiple
  workSchedule: [{
    locationId: ObjectId,
    days: Array,
    hours: String
  }]
}
```

### How it Works:
- Staff can work at multiple locations
- One is primary, others are secondary
- Each has different schedule
- Performance tracked per location

---

## 📊 **Quick Implementation**

### Add to Location Model:
```javascript
const locationSchema = new Schema({
  name: String,
  address: String,
  
  // SALES
  dailyRevenue: Number,
  totalOrders: Number,
  
  // MANAGER
  manager: { userId: ObjectId, name: String },
  
  // STAFF
  staff: [{ memberId: ObjectId, name: String, role: String }],
  
  // SERVICES
  services: [{ serviceId: ObjectId, price: Number }]
});
```

### API Endpoints Needed:
```javascript
// Sales
GET /locations/:id/sales
GET /locations/compare-sales

// Services
POST /locations/:id/services
GET /locations/:id/services

// Staff
POST /locations/:id/staff
GET /locations/:id/staff
DELETE /locations/:id/staff/:staffId

// Manager
POST /locations/:id/assign-manager
```

### Frontend Components:
```javascript
// In Locations.jsx add buttons:
<Button onClick={() => viewSales(location)}>View Sales</Button>
<Button onClick={() => viewServices(location)}>Services</Button>
<Button onClick={() => viewStaff(location)}>Staff ({location.staff.length})</Button>
<Button onClick={() => assignManager(location)}>Assign Manager</Button>
```

---

## 🎯 **Complete Example Flow**

### Scenario: Assign Staff to Location

**1. Frontend Click:**
```javascript
const assignStaff = async (locationId, staffId) => {
  await api.post(`/locations/${locationId}/staff`, { staffId });
  toast.success('Staff assigned!');
  fetchLocations(); // Refresh
};
```

**2. Backend Process:**
```javascript
// Find both
const location = await Location.findById(locationId);
const staff = await Team.findById(staffId);

// Update location
location.staff.push({ memberId: staffId, name: staff.name });

// Update staff
staff.primaryLocation = locationId;

// Save both
await location.save();
await staff.save();
```

**3. Result:**
- Location shows staff member
- Staff profile shows location
- Can call/email from location page
- Performance tracked

---

## ✅ **Summary**

**HOW TO LINK:**
1. Add ObjectId references in schemas
2. Create API endpoints to link/unlink
3. Add UI buttons in Locations page
4. Show linked data in modals/cards

**WHAT LINKS:**
- Sales → `locationId` in orders
- Marketing → `targetLocations` array
- Services → `availableAt` array
- Manager → `manager.userId` in location
- Staff → `staff` array with member IDs

**TIME TO IMPLEMENT:** 2-3 hours per integration

**FILES TO MODIFY:**
- Models: location.js, order.js, service.js, team.js
- Controllers: locationController.js
- Routes: locationRoutes.js
- Frontend: Locations.jsx

Ready to implement! 🚀
