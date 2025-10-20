const { getIO } = require('../config/socket');
const Product = require('../models/product');
const User = require('../models/user');

class StorefrontPollingService {
  constructor() {
    this.io = getIO();
    this.polling = null;
    this.pollInterval = 5000; // 5 seconds
    this.lastSync = {
      products: new Map(),
      services: new Map(),
      locations: new Map(),
      team: new Map()
    };
  }

  // Start polling for changes
  startPolling() {
    if (this.polling) return;
    
    console.log('✅ StorefrontSync service started (polling mode)');
    this.polling = setInterval(async () => {
      await this.checkForChanges();
    }, this.pollInterval);
  }

  // Stop polling
  stopPolling() {
    if (this.polling) {
      clearInterval(this.polling);
      this.polling = null;
    }
  }

  // Check for changes in all collections
  async checkForChanges() {
    try {
      await this.checkProductChanges();
      // Add more checks as needed for services, locations, team members
    } catch (error) {
      console.error('Error checking for changes:', error);
    }
  }

  // Check for product changes
  async checkProductChanges() {
    try {
      const products = await Product.find({})
        .select('_id userId name price stockQuantity updatedAt')
        .lean();

      for (const product of products) {
        const lastUpdate = this.lastSync.products.get(product._id.toString());
        const currentUpdate = product.updatedAt.getTime();

        if (!lastUpdate || lastUpdate < currentUpdate) {
          // Get owner's invite code
          const owner = await User.findById(product.userId).select('inviteCode');
          
          if (owner?.inviteCode) {
            this.io.to(`storefront_${owner.inviteCode}`).emit('product_sync', {
              type: 'update',
              product
            });
          }

          // Update last sync time
          this.lastSync.products.set(product._id.toString(), currentUpdate);
        }
      }

      // Check for deleted products
      const productIds = new Set(products.map(p => p._id.toString()));
      for (const [id] of this.lastSync.products) {
        if (!productIds.has(id)) {
          // Product was deleted
          this.io.emit('product_sync', {
            type: 'delete',
            product: { _id: id }
          });
          this.lastSync.products.delete(id);
        }
      }
    } catch (error) {
      console.error('Error checking product changes:', error);
    }
  }

  // Join storefront room
  joinStorefront(socket, inviteCode) {
    if (inviteCode) {
      socket.join(`storefront_${inviteCode}`);
      console.log(`Client joined storefront: ${inviteCode}`);

      // Send initial data
      this.sendInitialData(socket, inviteCode);
    }
  }

  // Leave storefront room
  leaveStorefront(socket, inviteCode) {
    if (inviteCode) {
      socket.leave(`storefront_${inviteCode}`);
      console.log(`Client left storefront: ${inviteCode}`);
    }
  }

  // Send initial data to newly connected client
  async sendInitialData(socket, inviteCode) {
    try {
      // Find owner by invite code
      const owner = await User.findOne({ inviteCode }).select('_id');
      
      if (owner) {
        // Send products
        const products = await Product.find({ userId: owner._id })
          .select('_id name price stockQuantity')
          .lean();

        socket.emit('initial_data', {
          products,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }
}

// Create singleton instance
const storefrontPolling = new StorefrontPollingService();

// Start polling on service initialization
storefrontPolling.startPolling();

// Export singleton instance
module.exports = storefrontPolling;