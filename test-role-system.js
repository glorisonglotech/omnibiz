const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test users for different roles
const testUsers = {
  superAdmin: {
    name: 'Super Admin User',
    email: 'superadmin@omnibiz.com',
    password: 'password123',
    role: 'super_admin'
  },
  admin: {
    name: 'Admin User',
    email: 'admin@omnibiz.com',
    password: 'password123',
    role: 'admin'
  },
  client: {
    name: 'Client User',
    email: 'client@omnibiz.com',
    password: 'password123',
    role: 'client',
    businessName: 'Test Business'
  }
};

let tokens = {};

// Helper function to make API requests
const apiRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
};

// Test user registration
const testRegistration = async () => {
  console.log('\n🔐 Testing User Registration...');
  
  for (const [role, userData] of Object.entries(testUsers)) {
    console.log(`\n  Registering ${role}...`);
    const result = await apiRequest('POST', '/auth/register', userData);
    
    if (result.success) {
      console.log(`  ✅ ${role} registered successfully`);
      console.log(`     Role: ${result.data.user.role}`);
      console.log(`     Permissions: ${Object.keys(result.data.user.permissions || {}).length} permissions`);
    } else {
      console.log(`  ❌ ${role} registration failed: ${result.error}`);
    }
  }
};

// Test user login
const testLogin = async () => {
  console.log('\n🔑 Testing User Login...');
  
  for (const [role, userData] of Object.entries(testUsers)) {
    console.log(`\n  Logging in ${role}...`);
    const result = await apiRequest('POST', '/auth/login', {
      email: userData.email,
      password: userData.password
    });
    
    if (result.success) {
      tokens[role] = result.data.token;
      console.log(`  ✅ ${role} logged in successfully`);
      console.log(`     Role: ${result.data.user.role}`);
      console.log(`     Permissions: ${Object.keys(result.data.user.permissions || {}).length} permissions`);
    } else {
      console.log(`  ❌ ${role} login failed: ${result.error}`);
    }
  }
};

// Test role-based access
const testRoleAccess = async () => {
  console.log('\n🛡️ Testing Role-Based Access...');
  
  // Test admin endpoints
  console.log('\n  Testing Admin Endpoints:');
  
  // Admin should have access
  const adminOrdersResult = await apiRequest('GET', '/admin/orders', null, tokens.admin);
  console.log(`    Admin accessing /admin/orders: ${adminOrdersResult.success ? '✅ Success' : '❌ Failed - ' + adminOrdersResult.error}`);
  
  // Client should NOT have access
  const clientAdminResult = await apiRequest('GET', '/admin/orders', null, tokens.client);
  console.log(`    Client accessing /admin/orders: ${clientAdminResult.success ? '❌ Unexpected Success' : '✅ Correctly Denied - ' + clientAdminResult.error}`);
  
  // Test client endpoints
  console.log('\n  Testing Client Endpoints:');
  
  // Client should have access
  const clientOrdersResult = await apiRequest('GET', '/client/orders', null, tokens.client);
  console.log(`    Client accessing /client/orders: ${clientOrdersResult.success ? '✅ Success' : '❌ Failed - ' + clientOrdersResult.error}`);
  
  // Admin should also have access (for testing purposes)
  const adminClientResult = await apiRequest('GET', '/client/orders', null, tokens.admin);
  console.log(`    Admin accessing /client/orders: ${adminClientResult.success ? '✅ Success' : '❌ Failed - ' + adminClientResult.error}`);
};

// Test order creation and approval workflow
const testOrderWorkflow = async () => {
  console.log('\n📦 Testing Order Workflow...');
  
  // Client creates an order
  console.log('\n  Client creating order...');
  const orderData = {
    customer: {
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '+1234567890'
    },
    items: [
      { name: 'Test Product', quantity: 2, price: 100 }
    ],
    subtotal: 200,
    taxAmount: 20,
    shippingCost: 10,
    orderType: 'standard',
    priority: 'medium'
  };
  
  const createOrderResult = await apiRequest('POST', '/client/orders', orderData, tokens.client);
  
  if (createOrderResult.success) {
    const orderId = createOrderResult.data.order._id;
    console.log(`  ✅ Order created successfully: ${createOrderResult.data.order.orderId}`);
    console.log(`     Status: ${createOrderResult.data.order.status}`);
    console.log(`     Requires Approval: ${createOrderResult.data.requiresApproval}`);
    
    // Submit the order
    console.log('\n  Submitting order...');
    const submitResult = await apiRequest('PUT', `/client/orders/${orderId}/submit`, {}, tokens.client);
    
    if (submitResult.success) {
      console.log(`  ✅ Order submitted successfully`);
      console.log(`     New Status: ${submitResult.data.order.status}`);
      
      // Admin approves the order
      if (submitResult.data.order.status === 'Submitted') {
        console.log('\n  Admin approving order...');
        const approveResult = await apiRequest('PUT', `/admin/orders/${orderId}/approve`, 
          { approved: true }, tokens.admin);
        
        if (approveResult.success) {
          console.log(`  ✅ Order approved successfully`);
          console.log(`     New Status: ${approveResult.data.order.status}`);
        } else {
          console.log(`  ❌ Order approval failed: ${approveResult.error}`);
        }
      }
    } else {
      console.log(`  ❌ Order submission failed: ${submitResult.error}`);
    }
  } else {
    console.log(`  ❌ Order creation failed: ${createOrderResult.error}`);
  }
};

// Test service request workflow
const testServiceRequestWorkflow = async () => {
  console.log('\n🛠️ Testing Service Request Workflow...');
  
  // Client creates a service request
  console.log('\n  Client creating service request...');
  const serviceRequestData = {
    serviceType: 'consultation',
    title: 'Business Consultation Request',
    description: 'Need help with business strategy and planning',
    priority: 'medium',
    requirements: {
      budget: { min: 500, max: 1000 },
      timeline: '2 weeks'
    }
  };
  
  const createServiceResult = await apiRequest('POST', '/client/service-requests', serviceRequestData, tokens.client);
  
  if (createServiceResult.success) {
    const requestId = createServiceResult.data.serviceRequest._id;
    console.log(`  ✅ Service request created successfully: ${createServiceResult.data.serviceRequest.requestId}`);
    console.log(`     Status: ${createServiceResult.data.serviceRequest.status}`);
    
    // Admin responds to the service request
    console.log('\n  Admin responding to service request...');
    const responseData = {
      estimatedCost: { amount: 750, currency: 'USD' },
      estimatedTimeline: '10 business days',
      proposedSolution: 'Comprehensive business analysis and strategic planning session',
      terms: 'Payment required upfront, includes 2 follow-up sessions'
    };
    
    const respondResult = await apiRequest('PUT', `/admin/service-requests/${requestId}/respond`, 
      responseData, tokens.admin);
    
    if (respondResult.success) {
      console.log(`  ✅ Admin response sent successfully`);
      console.log(`     New Status: ${respondResult.data.serviceRequest.status}`);
    } else {
      console.log(`  ❌ Admin response failed: ${respondResult.error}`);
    }
  } else {
    console.log(`  ❌ Service request creation failed: ${createServiceResult.error}`);
  }
};

// Test dashboard stats
const testDashboardStats = async () => {
  console.log('\n📊 Testing Dashboard Stats...');
  
  // Test admin dashboard
  console.log('\n  Testing Admin Dashboard...');
  const adminStatsResult = await apiRequest('GET', '/admin/dashboard-stats', null, tokens.admin);
  
  if (adminStatsResult.success) {
    console.log(`  ✅ Admin dashboard stats retrieved successfully`);
    console.log(`     Total Orders: ${adminStatsResult.data.orders.total}`);
    console.log(`     Pending Orders: ${adminStatsResult.data.orders.pending}`);
    console.log(`     Service Requests: ${adminStatsResult.data.serviceRequests.total}`);
  } else {
    console.log(`  ❌ Admin dashboard stats failed: ${adminStatsResult.error}`);
  }
  
  // Test client dashboard
  console.log('\n  Testing Client Dashboard...');
  const clientStatsResult = await apiRequest('GET', '/client/dashboard-stats', null, tokens.client);
  
  if (clientStatsResult.success) {
    console.log(`  ✅ Client dashboard stats retrieved successfully`);
    console.log(`     Total Orders: ${clientStatsResult.data.orders.total}`);
    console.log(`     Pending Orders: ${clientStatsResult.data.orders.pending}`);
    console.log(`     Service Requests: ${clientStatsResult.data.serviceRequests.total}`);
  } else {
    console.log(`  ❌ Client dashboard stats failed: ${clientStatsResult.error}`);
  }
};

// Main test function
const runTests = async () => {
  console.log('🧪 Starting Role-Based System Tests...');
  console.log('=====================================');
  
  try {
    await testRegistration();
    await testLogin();
    await testRoleAccess();
    await testOrderWorkflow();
    await testServiceRequestWorkflow();
    await testDashboardStats();
    
    console.log('\n✅ All tests completed!');
    console.log('=====================================');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
};

// Run the tests
runTests();
