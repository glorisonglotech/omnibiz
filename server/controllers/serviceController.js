const Service = require('../models/service');
const User = require('../models/user');
const { notificationHelpers, getIO } = require('../config/socket');

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Admin/Business Owner)
exports.createService = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      duration,
      category,
      isActive,
      maxBookingsPerSlot,
      availableTeamMembers,
      locations,
      image
    } = req.body;

    // Validate required fields
    if (!name || !price || !duration) {
      return res.status(400).json({ 
        message: 'Name, price, and duration are required' 
      });
    }

    const service = new Service({
      userId: req.user._id,
      name,
      description,
      price,
      duration,
      category,
      isActive: isActive !== undefined ? isActive : true,
      maxBookingsPerSlot: maxBookingsPerSlot || 1,
      availableTeamMembers: availableTeamMembers || [],
      locations: locations || [],
      image
    });

    await service.save();

    // Emit real-time event to all connected clients
    const io = getIO();
    const owner = await User.findById(req.user._id);
    if (owner?.inviteCode) {
      io.to(`storefront_${owner.inviteCode}`).emit('service_sync', {
        type: 'insert',
        service
      });
    }

    res.status(201).json({
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ 
      message: 'Failed to create service', 
      error: error.message 
    });
  }
};

// @desc    Get all services for the authenticated user
// @route   GET /api/services
// @access  Private
exports.getServices = async (req, res) => {
  try {
    const { category, isActive, page = 1, limit = 50 } = req.query;
    
    const filter = { userId: req.user._id };
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const services = await Service.find(filter)
      .populate('availableTeamMembers', 'fullName role')
      .populate('locations', 'name city address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(filter);

    res.status(200).json({
      services,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch services', 
      error: error.message 
    });
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Private
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('availableTeamMembers', 'fullName role contactEmail phoneNumber')
      .populate('locations', 'name city address phone operatingHours');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json({ service });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch service', 
      error: error.message 
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Admin/Business Owner)
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const allowedUpdates = [
      'name', 'description', 'price', 'duration', 'category', 
      'isActive', 'maxBookingsPerSlot', 'availableTeamMembers', 
      'locations', 'image'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });

    await service.save();

    // Emit real-time event to all connected clients
    const io = getIO();
    const owner = await User.findById(req.user._id);
    if (owner?.inviteCode) {
      io.to(`storefront_${owner.inviteCode}`).emit('service_sync', {
        type: 'update',
        service
      });
    }

    res.status(200).json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ 
      message: 'Failed to update service', 
      error: error.message 
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin/Business Owner)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await service.deleteOne();

    // Emit real-time event to all connected clients
    const io = getIO();
    const owner = await User.findById(req.user._id);
    if (owner?.inviteCode) {
      io.to(`storefront_${owner.inviteCode}`).emit('service_sync', {
        type: 'delete',
        service: { _id: service._id, name: service.name }
      });
    }

    res.status(200).json({
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ 
      message: 'Failed to delete service', 
      error: error.message 
    });
  }
};

// @desc    Toggle service active status
// @route   PATCH /api/services/:id/toggle
// @access  Private (Admin/Business Owner)
exports.toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.isActive = !service.isActive;
    await service.save();

    // Emit real-time event
    const io = getIO();
    const owner = await User.findById(req.user._id);
    if (owner?.inviteCode) {
      io.to(`storefront_${owner.inviteCode}`).emit('service_sync', {
        type: 'update',
        service
      });
    }

    res.status(200).json({
      message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
      service
    });
  } catch (error) {
    console.error('Toggle service status error:', error);
    res.status(500).json({ 
      message: 'Failed to toggle service status', 
      error: error.message 
    });
  }
};

// @desc    Get service categories
// @route   GET /api/services/categories
// @access  Private
exports.getServiceCategories = async (req, res) => {
  try {
    const categories = await Service.distinct('category', { 
      userId: req.user._id,
      isActive: true 
    });

    res.status(200).json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch categories', 
      error: error.message 
    });
  }
};

// @desc    Bulk create services (for seeding/migration)
// @route   POST /api/services/bulk
// @access  Private (Admin only)
exports.bulkCreateServices = async (req, res) => {
  try {
    const { services } = req.body;

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ 
        message: 'Services array is required' 
      });
    }

    // Add userId to all services
    const servicesWithUser = services.map(service => ({
      ...service,
      userId: req.user._id
    }));

    const createdServices = await Service.insertMany(servicesWithUser);

    // Emit real-time events
    const io = getIO();
    const owner = await User.findById(req.user._id);
    if (owner?.inviteCode) {
      createdServices.forEach(service => {
        io.to(`storefront_${owner.inviteCode}`).emit('service_sync', {
          type: 'insert',
          service
        });
      });
    }

    res.status(201).json({
      message: `${createdServices.length} services created successfully`,
      services: createdServices
    });
  } catch (error) {
    console.error('Bulk create services error:', error);
    res.status(500).json({ 
      message: 'Failed to create services', 
      error: error.message 
    });
  }
};

module.exports = exports;
