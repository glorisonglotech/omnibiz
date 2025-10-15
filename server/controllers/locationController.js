const Location = require("../models/location");

/**
 * Location Controller
 * Handles CRUD operations for business locations with real-time data
 */

// Create a new location
exports.createLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const locationData = { ...req.body, userId };

    const location = new Location(locationData);
    await location.save();

    res.status(201).json({ 
      message: 'Location created successfully', 
      location 
    });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get all locations for the logged-in user
exports.getAllLocations = async (req, res) => {
  try {
    const userId = req.user.id;
    const locations = await Location.find({ userId }).sort({ createdAt: -1 });
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single location by ID
exports.getLocationById = async (req, res) => {
  try {
    const userId = req.user.id;
    const location = await Location.findOne({ 
      _id: req.params.id, 
      userId 
    });
    
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }
    
    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a location
exports.updateLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const location = await Location.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }
    
    res.json({ 
      message: 'Location updated successfully', 
      location 
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete a location
exports.deleteLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const location = await Location.findOneAndDelete({ 
      _id: req.params.id, 
      userId 
    });
    
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }
    
    res.json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get location statistics
exports.getLocationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const locations = await Location.find({ userId });
    
    const stats = {
      totalLocations: locations.length,
      activeLocations: locations.filter(loc => loc.status === 'active').length,
      totalEmployees: locations.reduce((sum, loc) => sum + loc.employees, 0),
      totalInventory: locations.reduce((sum, loc) => sum + loc.inventory, 0),
      totalRevenue: locations.reduce((sum, loc) => sum + loc.dailyRevenue, 0),
      averagePerformance: locations.length > 0 
        ? Math.round(locations.reduce((sum, loc) => sum + loc.performance, 0) / locations.length)
        : 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching location stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Seed default locations
exports.seedDefaultLocations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user already has locations
    const existingLocations = await Location.find({ userId });
    if (existingLocations.length > 0) {
      return res.status(400).json({ 
        error: 'Locations already exist. Cannot seed defaults.',
        count: existingLocations.length 
      });
    }

    // Default locations data
    const defaultLocations = [
      {
        userId,
        name: "Main Store",
        address: "123 Business Street",
        city: "Nairobi",
        state: "Nairobi County",
        zipCode: "00100",
        phone: "+254 700 123 456",
        email: "main@omnibiz.com",
        manager: "John Doe",
        operatingHours: "8:00 AM - 8:00 PM",
        status: "active",
        employees: 12,
        inventory: 450,
        description: "Main flagship store location",
        dailyRevenue: 15420,
        dailyOrders: 23,
        dailyCustomers: 156,
        performance: 94,
      },
      {
        userId,
        name: "Westlands Branch",
        address: "456 Westlands Avenue",
        city: "Nairobi",
        state: "Nairobi County",
        zipCode: "00600",
        phone: "+254 700 789 012",
        email: "westlands@omnibiz.com",
        manager: "Jane Smith",
        operatingHours: "9:00 AM - 7:00 PM",
        status: "active",
        employees: 8,
        inventory: 320,
        description: "Westlands shopping district branch",
        dailyRevenue: 12300,
        dailyOrders: 18,
        dailyCustomers: 124,
        performance: 87,
      },
      {
        userId,
        name: "Mombasa Outlet",
        address: "789 Moi Avenue",
        city: "Mombasa",
        state: "Mombasa County",
        zipCode: "80100",
        phone: "+254 700 345 678",
        email: "mombasa@omnibiz.com",
        manager: "Peter Wilson",
        operatingHours: "8:30 AM - 6:30 PM",
        status: "maintenance",
        employees: 6,
        inventory: 180,
        description: "Coastal region outlet",
        dailyRevenue: 0,
        dailyOrders: 0,
        dailyCustomers: 0,
        performance: 45,
      },
      {
        userId,
        name: "Kisumu Branch",
        address: "321 Oginga Odinga Street",
        city: "Kisumu",
        state: "Kisumu County",
        zipCode: "40100",
        phone: "+254 700 456 789",
        email: "kisumu@omnibiz.com",
        manager: "Mary Johnson",
        operatingHours: "8:00 AM - 7:00 PM",
        status: "active",
        employees: 10,
        inventory: 280,
        description: "Western region branch",
        dailyRevenue: 9800,
        dailyOrders: 15,
        dailyCustomers: 98,
        performance: 82,
      },
      {
        userId,
        name: "Eldoret Hub",
        address: "567 Uganda Road",
        city: "Eldoret",
        state: "Uasin Gishu County",
        zipCode: "30100",
        phone: "+254 700 567 890",
        email: "eldoret@omnibiz.com",
        manager: "David Kipchoge",
        operatingHours: "7:00 AM - 8:00 PM",
        status: "active",
        employees: 9,
        inventory: 310,
        description: "Rift Valley logistics hub",
        dailyRevenue: 11200,
        dailyOrders: 19,
        dailyCustomers: 142,
        performance: 90,
      },
      {
        userId,
        name: "Nakuru Center",
        address: "234 Kenyatta Avenue",
        city: "Nakuru",
        state: "Nakuru County",
        zipCode: "20100",
        phone: "+254 700 234 567",
        email: "nakuru@omnibiz.com",
        manager: "Sarah Wanjiru",
        operatingHours: "8:00 AM - 7:00 PM",
        status: "active",
        employees: 7,
        inventory: 220,
        description: "Central region retail center",
        dailyRevenue: 8500,
        dailyOrders: 14,
        dailyCustomers: 89,
        performance: 78,
      },
    ];

    // Insert all default locations
    const createdLocations = await Location.insertMany(defaultLocations);
    
    console.log(`✅ Seeded ${createdLocations.length} default locations for user ${userId}`);
    
    res.status(201).json({
      message: 'Default locations seeded successfully',
      count: createdLocations.length,
      locations: createdLocations
    });
  } catch (error) {
    console.error('Error seeding default locations:', error);
    res.status(500).json({ error: error.message });
  }
};
