/**
 * Test script for AI Service with DeepSeek Fallback
 * 
 * Usage:
 *   node test-ai-service.js
 * 
 * This script tests:
 * 1. AI service initialization
 * 2. Provider availability
 * 3. Basic chat functionality
 * 4. Fallback mechanism
 */

require('dotenv').config();
const { aiService } = require('./services/aiService');

console.log('\n🧪 Testing AI Service with DeepSeek Fallback\n');
console.log('='.repeat(60));

// Test 1: Check Service Status
console.log('\n📊 Test 1: Service Status');
console.log('-'.repeat(60));
const status = aiService.getStatus();
console.log(JSON.stringify(status, null, 2));

// Test 2: Check Initialization
console.log('\n🔧 Test 2: Initialization Check');
console.log('-'.repeat(60));
if (status.initialized) {
  console.log('✅ AI Service is initialized');
  console.log(`   Current Provider: ${status.currentProvider}`);
  console.log(`   Gemini Available: ${status.gemini.available ? '✅' : '❌'}`);
  console.log(`   DeepSeek Available: ${status.deepseek.available ? '✅' : '❌'}`);
} else {
  console.log('❌ AI Service is NOT initialized');
  console.log('   Please configure GEMINI_API_KEY or DEEPSEEK_API_KEY in .env');
  process.exit(1);
}

// Test 3: Simple Chat Test
async function testChat() {
  console.log('\n💬 Test 3: Simple Chat');
  console.log('-'.repeat(60));
  
  try {
    const result = await aiService.generateResponse(
      'Say hello and introduce yourself as an AI assistant for OmniBiz.',
      {
        businessName: 'Test Business',
        userName: 'Test User',
        userRole: 'admin'
      }
    );

    if (result.success) {
      console.log('✅ Chat test successful');
      console.log(`   Provider: ${result.provider}`);
      console.log(`   Model: ${result.model}`);
      console.log(`   Response: ${result.response.substring(0, 100)}...`);
    } else {
      console.log('❌ Chat test failed');
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.log('❌ Chat test error:', error.message);
  }
}

// Test 4: Business Insights Test
async function testInsights() {
  console.log('\n📈 Test 4: Business Insights');
  console.log('-'.repeat(60));
  
  try {
    const testData = {
      totalOrders: 150,
      totalRevenue: 45000,
      totalProducts: 50,
      avgOrderValue: 300,
      topProduct: 'Premium Coffee',
      salesTrend: 'Increasing'
    };

    const insights = await aiService.generateBusinessInsights(testData);
    
    console.log('✅ Insights test successful');
    console.log(`   Insights: ${insights.insights?.length || 0}`);
    console.log(`   Recommendations: ${insights.recommendations?.length || 0}`);
    
    if (insights.insights && insights.insights.length > 0) {
      console.log('\n   Sample Insight:');
      console.log(`   - ${insights.insights[0].title}`);
    }
  } catch (error) {
    console.log('❌ Insights test error:', error.message);
  }
}

// Test 5: Sentiment Analysis Test
async function testSentiment() {
  console.log('\n😊 Test 5: Sentiment Analysis');
  console.log('-'.repeat(60));
  
  try {
    const result = await aiService.analyzeSentiment(
      'This product is absolutely amazing! I love it!'
    );

    console.log('✅ Sentiment test successful');
    console.log(`   Sentiment: ${result.sentiment}`);
    console.log(`   Confidence: ${result.confidence}%`);
    console.log(`   Summary: ${result.summary}`);
  } catch (error) {
    console.log('❌ Sentiment test error:', error.message);
  }
}

// Test 6: Fallback Test (if both providers available)
async function testFallback() {
  console.log('\n🔄 Test 6: Fallback Mechanism');
  console.log('-'.repeat(60));
  
  if (status.gemini.available && status.deepseek.available) {
    console.log('✅ Both providers available - fallback ready');
    console.log('   If Gemini fails, DeepSeek will automatically take over');
  } else if (status.gemini.available) {
    console.log('⚠️  Only Gemini available - no fallback');
  } else if (status.deepseek.available) {
    console.log('⚠️  Only DeepSeek available - no fallback');
  } else {
    console.log('❌ No providers available');
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testChat();
    await testInsights();
    await testSentiment();
    await testFallback();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();

