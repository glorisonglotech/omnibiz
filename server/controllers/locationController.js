const Location = require("../models/location");

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
