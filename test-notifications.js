const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test user credentials
const clientUser = {
  email: 'client@omnibiz.com',
  password: 'password123'
};

const adminUser = {
  email: 'admin@omnibiz.com',
  password: 'password123'
};

let clientToken = '';
let adminToken = '';

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

// Test login for both users
const testLogin = async () => {
  console.log('🔑 Logging in users...');
  
  // Login client
  const clientResult = await apiRequest('POST', '/auth/login', clientUser);
  if (clientResult.success) {
    clientToken = clientResult.data.token;
    console.log('✅ Client login successful');
  } else {
    console.log('❌ Client login failed:', clientResult.error);
    return false;
  }
  
  // Login admin
  const adminResult = await apiRequest('POST', '/auth/login', adminUser);
  if (adminResult.success) {
    adminToken = adminResult.data.token;
    console.log('✅ Admin login successful');
  } else {
    console.log('❌ Admin login failed:', adminResult.error);
    return false;
  }
  
  return true;
};

// Test creating an order (should trigger notification to admins)
const testOrderCreation = async () => {
  console.log('\n📦 Testing order creation (should notify admins)...');
  
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
    shippingCost: 15,
    orderType: 'standard',
    priority: 'high'
  };
  
  const result = await apiRequest('POST', '/client/orders', orderData, clientToken);
  
  if (result.success) {
    console.log('✅ Order created successfully');
    console.log('   Order ID:', result.data.order.orderId);
    console.log('   📢 Admins should receive real-time notification');
    return result.data.order;
  } else {
    console.log('❌ Order creation failed:', result.error);
    return null;
  }
};

// Test creating a service request (should trigger notification to admins)
const testServiceRequestCreation = async () => {
  console.log('\n🛠️ Testing service request creation (should notify admins)...');
  
  const serviceRequestData = {
    serviceType: 'consultation',
    title: 'Business Strategy Consultation',
    description: 'Need help with business growth strategy and market analysis',
    priority: 'high',
    requirements: {
      budget: { min: 1000, max: 2000 },
      timeline: '1 week'
    }
  };
  
  const result = await apiRequest('POST', '/client/service-requests', serviceRequestData, clientToken);
  
  if (result.success) {
    console.log('✅ Service request created successfully');
    console.log('   Request ID:', result.data.serviceRequest.requestId);
    console.log('   📢 Admins should receive real-time notification');
    return result.data.serviceRequest;
  } else {
    console.log('❌ Service request creation failed:', result.error);
    return null;
  }
};

// Test order approval (should trigger notification to client)
const testOrderApproval = async (orderId) => {
  console.log('\n✅ Testing order approval (should notify client)...');
  
  const approvalData = {
    approved: true,
    adminNotes: 'Order approved for processing'
  };
  
  const result = await apiRequest('PUT', `/admin/orders/${orderId}/approve`, approvalData, adminToken);
  
  if (result.success) {
    console.log('✅ Order approved successfully');
    console.log('   📢 Client should receive real-time notification');
    return result.data.order;
  } else {
    console.log('❌ Order approval failed:', result.error);
    return null;
  }
};

// Test service request response (should trigger notification to client)
const testServiceRequestResponse = async (requestId) => {
  console.log('\n💬 Testing service request response (should notify client)...');
  
  const responseData = {
    response: 'We have reviewed your consultation request and would be happy to help with your business strategy. Our team can provide comprehensive market analysis and growth recommendations.',
    estimatedCost: 1500,
    estimatedTimeline: '5 business days',
    nextSteps: 'Please confirm your availability for an initial consultation call.'
  };
  
  const result = await apiRequest('PUT', `/admin/service-requests/${requestId}/respond`, responseData, adminToken);
  
  if (result.success) {
    console.log('✅ Service request response sent successfully');
    console.log('   📢 Client should receive real-time notification');
    return result.data.serviceRequest;
  } else {
    console.log('❌ Service request response failed:', result.error);
    return null;
  }
};

// Test order verification (should trigger notification to client)
const testOrderVerification = async (orderId) => {
  console.log('\n🔍 Testing order verification (should notify client)...');
  
  const verificationData = {
    verificationNotes: 'Order details verified and ready for processing'
  };
  
  const result = await apiRequest('PUT', `/admin/orders/${orderId}/verify`, verificationData, adminToken);
  
  if (result.success) {
    console.log('✅ Order verified successfully');
    console.log('   📢 Client should receive real-time notification');
    return result.data.order;
  } else {
    console.log('❌ Order verification failed:', result.error);
    return null;
  }
};

// Main test function
const runNotificationTests = async () => {
  console.log('🧪 Starting Real-time Notification Tests...');
  console.log('==========================================');
  console.log('📱 Open the client app at http://localhost:5176 to see notifications');
  console.log('🔔 Make sure to login as both client and admin in different browser tabs');
  console.log('==========================================\n');
  
  try {
    // Login both users
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.log('❌ Cannot proceed without authentication');
      return;
    }
    
    // Wait a moment for setup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test order creation (notifies admins)
    const order = await testOrderCreation();
    
    // Wait for notification to be processed
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test service request creation (notifies admins)
    const serviceRequest = await testServiceRequestCreation();
    
    // Wait for notification to be processed
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (order) {
      // Test order approval (notifies client)
      await testOrderApproval(order._id);
      
      // Wait for notification to be processed
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test order verification (notifies client)
      await testOrderVerification(order._id);
    }
    
    // Wait for notification to be processed
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (serviceRequest) {
      // Test service request response (notifies client)
      await testServiceRequestResponse(serviceRequest._id);
    }
    
    console.log('\n✅ Real-time notification tests completed!');
    console.log('==========================================');
    console.log('📱 Check the client app for real-time notifications');
    console.log('🔔 Notifications should appear in the notification center (bell icon)');
    console.log('🎉 Toast notifications should also appear');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
};

// Run the tests
runNotificationTests();
