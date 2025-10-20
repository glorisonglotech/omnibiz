const { getIO } = require('../config/socket');
const Product = require('../models/product');
const Service = require('../models/service');
const Location = require('../models/location');
const Team = require('../models/team');
const User = require('../models/user');

class StorefrontSyncService {
  constructor() {
    this.io = getIO();
    this.setupEventListeners();
  }

  // Set up event listeners for data changes
  setupEventListeners() {
    try {
      // Listen for product changes if model exists
      if (Product.watch) {
        Product.watch().on('change', async (change) => {
          await this.handleProductChange(change);
        });
      }

      // Listen for service changes if model exists
      if (Service.watch) {
        Service.watch().on('change', async (change) => {
          await this.handleServiceChange(change);
        });
      }

      // Listen for location changes if model exists
      if (Location.watch) {
        Location.watch().on('change', async (change) => {
          await this.handleLocationChange(change);
        });
      }

      // Listen for team changes if model exists
      if (Team.watch) {
        Team.watch().on('change', async (change) => {
          await this.handleTeamChange(change);
        });
      }

      console.log('✅ Storefront sync listeners initialized');
    } catch (error) {
      console.error('Error setting up storefront sync listeners:', error);
    }
  }

  // Handle product changes
  async handleProductChange(change) {
    try {
      // Skip if Product model doesn't exist
      if (!Product || !Product.findById) {
        console.warn('Product model not available for sync');
        return;
      }

      let product;
      if (change.operationType === 'insert' || change.operationType === 'update') {
        product = await Product.findById(change.documentKey._id);
      }

      // Get owner's invite code
      const owner = await User.findById(product?.userId);
      const inviteCode = owner?.inviteCode;

      if (inviteCode) {
        this.io.to(`storefront_${inviteCode}`).emit('product_sync', {
          type: change.operationType,
          product: product || { _id: change.documentKey._id }
        });
      }
    } catch (error) {
      console.error('Product sync error:', error);
    }
  }

  // Handle service changes
  async handleServiceChange(change) {
    try {
      // Skip if Service model doesn't exist
      if (!Service || !Service.findById) {
        console.warn('Service model not available for sync');
        return;
      }

      let service;
      if (change.operationType === 'insert' || change.operationType === 'update') {
        service = await Service.findById(change.documentKey._id);
      }

      // Get owner's invite code
      const owner = await User.findById(service?.userId);
      const inviteCode = owner?.inviteCode;

      if (inviteCode) {
        this.io.to(`storefront_${inviteCode}`).emit('service_sync', {
          type: change.operationType,
          service: service || { _id: change.documentKey._id }
        });
      }
    } catch (error) {
      console.error('Service sync error:', error);
    }
  }

  // Handle location changes
  async handleLocationChange(change) {
    try {
      // Skip if Location model doesn't exist
      if (!Location || !Location.findById) {
        console.warn('Location model not available for sync');
        return;
      }

      let location;
      if (change.operationType === 'insert' || change.operationType === 'update') {
        location = await Location.findById(change.documentKey._id);
      }

      // Get owner's invite code
      const owner = await User.findById(location?.userId);
      const inviteCode = owner?.inviteCode;

      if (inviteCode) {
        this.io.to(`storefront_${inviteCode}`).emit('location_sync', {
          type: change.operationType,
          location: location || { _id: change.documentKey._id }
        });
      }
    } catch (error) {
      console.error('Location sync error:', error);
    }
  }

  // Handle team changes
  async handleTeamChange(change) {
    try {
      // Skip if Team model doesn't exist
      if (!Team || !Team.findById) {
        console.warn('Team model not available for sync');
        return;
      }

      let team;
      if (change.operationType === 'insert' || change.operationType === 'update') {
        team = await Team.findById(change.documentKey._id);
      }

      // Get owner's invite code
      const owner = await User.findById(team?.userId);
      const inviteCode = owner?.inviteCode;

      if (inviteCode) {
        this.io.to(`storefront_${inviteCode}`).emit('team_sync', {
          type: change.operationType,
          team: team || { _id: change.documentKey._id }
        });
      }
    } catch (error) {
      console.error('Team sync error:', error);
    }
  }

  // Join storefront room
  joinStorefront(socket, inviteCode) {
    if (inviteCode) {
      socket.join(`storefront_${inviteCode}`);
      console.log(`Client joined storefront: ${inviteCode}`);
    }
  }

  // Leave storefront room
  leaveStorefront(socket, inviteCode) {
    if (inviteCode) {
      socket.leave(`storefront_${inviteCode}`);
      console.log(`Client left storefront: ${inviteCode}`);
    }
  }
}

module.exports = new StorefrontSyncService();