const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: 'client@omnibiz.com',
  password: 'password123'
};

let authToken = '';

// Helper function to make API requests
const apiRequest = async (method, endpoint, data = null, token = null, isFormData = false) => {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(!isFormData && { 'Content-Type': 'application/json' })
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

// Create a test file
const createTestFile = () => {
  const testContent = 'This is a test file for upload functionality.\nCreated at: ' + new Date().toISOString();
  const fileName = 'test-document.txt';
  const filePath = path.join(__dirname, fileName);
  
  fs.writeFileSync(filePath, testContent);
  return { fileName, filePath };
};

// Test login
const testLogin = async () => {
  console.log('🔑 Logging in...');
  const result = await apiRequest('POST', '/auth/login', testUser);
  
  if (result.success) {
    authToken = result.data.token;
    console.log('✅ Login successful');
    return true;
  } else {
    console.log('❌ Login failed:', result.error);
    return false;
  }
};

// Test upload info endpoint
const testUploadInfo = async () => {
  console.log('\n📋 Testing upload info endpoint...');
  const result = await apiRequest('GET', '/upload/info', null, authToken);
  
  if (result.success) {
    console.log('✅ Upload info retrieved successfully');
    console.log('   File size limit:', result.data.limits.fileSize);
    console.log('   Max files:', result.data.limits.maxFiles);
    console.log('   Supported formats:', result.data.supportedFormats.join(', '));
  } else {
    console.log('❌ Upload info failed:', result.error);
  }
};

// Test file upload
const testFileUpload = async () => {
  console.log('\n📤 Testing file upload...');
  
  // Create test file
  const { fileName, filePath } = createTestFile();
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('attachments', fs.createReadStream(filePath));
    
    // Upload file
    const config = {
      method: 'POST',
      url: `${API_BASE}/upload/multiple`,
      headers: {
        Authorization: `Bearer ${authToken}`,
        ...formData.getHeaders()
      },
      data: formData
    };
    
    const response = await axios(config);

    console.log('✅ File upload successful');
    console.log('   Files uploaded:', response.data.count);
    if (response.data.files && response.data.files.length > 0) {
      console.log('   File details:', response.data.files[0]);
    }
    
    // Clean up test file
    fs.unlinkSync(filePath);
    
    return response.data.files;
    
  } catch (error) {
    console.log('❌ File upload failed:', error.response?.data?.message || error.message);
    
    // Clean up test file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return null;
  }
};

// Test order with attachments
const testOrderWithAttachments = async (attachments) => {
  console.log('\n📦 Testing order creation with attachments...');
  
  const orderData = {
    customer: {
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '+1234567890'
    },
    items: [
      { name: 'Test Product', quantity: 1, price: 50 }
    ],
    subtotal: 50,
    taxAmount: 5,
    shippingCost: 10,
    orderType: 'standard',
    priority: 'medium',
    attachments: attachments || []
  };
  
  const result = await apiRequest('POST', '/client/orders', orderData, authToken);
  
  if (result.success) {
    console.log('✅ Order with attachments created successfully');
    console.log('   Order ID:', result.data.order.orderId);
    console.log('   Attachments:', result.data.order.attachments?.length || 0);
    return result.data.order;
  } else {
    console.log('❌ Order creation failed:', result.error);
    return null;
  }
};

// Test service request with attachments
const testServiceRequestWithAttachments = async (attachments) => {
  console.log('\n🛠️ Testing service request with attachments...');
  
  const serviceRequestData = {
    serviceType: 'consultation',
    title: 'Business Consultation with Documents',
    description: 'Need help with business strategy, including document review',
    priority: 'medium',
    requirements: {
      budget: { min: 500, max: 1000 },
      timeline: '2 weeks'
    },
    attachments: attachments || []
  };
  
  const result = await apiRequest('POST', '/client/service-requests', serviceRequestData, authToken);
  
  if (result.success) {
    console.log('✅ Service request with attachments created successfully');
    console.log('   Request ID:', result.data.serviceRequest.requestId);
    console.log('   Attachments:', result.data.serviceRequest.attachments?.length || 0);
    return result.data.serviceRequest;
  } else {
    console.log('❌ Service request creation failed:', result.error);
    return null;
  }
};

// Test specific upload endpoints
const testSpecificEndpoints = async () => {
  console.log('\n🎯 Testing specific upload endpoints...');
  
  // Create test file
  const { fileName, filePath } = createTestFile();
  
  try {
    // Test order attachments endpoint
    console.log('\n  Testing order attachments endpoint...');
    const formData1 = new FormData();
    formData1.append('attachments', fs.createReadStream(filePath));
    
    const orderAttachResult = await axios.post(`${API_BASE}/upload/order-attachments`, formData1, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        ...formData1.getHeaders()
      }
    });
    
    console.log('  ✅ Order attachments upload successful');
    
    // Test service attachments endpoint
    console.log('\n  Testing service attachments endpoint...');
    const formData2 = new FormData();
    formData2.append('attachments', fs.createReadStream(filePath));
    
    const serviceAttachResult = await axios.post(`${API_BASE}/upload/service-attachments`, formData2, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        ...formData2.getHeaders()
      }
    });
    
    console.log('  ✅ Service attachments upload successful');
    
    // Clean up
    fs.unlinkSync(filePath);
    
  } catch (error) {
    console.log('  ❌ Specific endpoint test failed:', error.response?.data?.message || error.message);
    
    // Clean up
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

// Main test function
const runFileUploadTests = async () => {
  console.log('🧪 Starting File Upload System Tests...');
  console.log('==========================================');
  
  try {
    // Login first
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.log('❌ Cannot proceed without authentication');
      return;
    }
    
    // Test upload info
    await testUploadInfo();
    
    // Test basic file upload
    const uploadedFiles = await testFileUpload();
    
    // Test specific endpoints
    await testSpecificEndpoints();
    
    // Test order with attachments
    if (uploadedFiles && uploadedFiles.length > 0) {
      await testOrderWithAttachments(uploadedFiles);
      await testServiceRequestWithAttachments(uploadedFiles);
    }
    
    console.log('\n✅ File upload tests completed!');
    console.log('==========================================');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
};

// Run the tests
runFileUploadTests();
