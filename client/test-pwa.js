// PWA Testing Script
// Run this in the browser console to test PWA functionality

console.log('🔍 Testing PWA Implementation for OmniBiz...\n');

// Test 1: Service Worker Registration
console.log('1. Testing Service Worker Registration...');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    if (registrations.length > 0) {
      console.log('✅ Service Worker registered:', registrations[0].scope);
      console.log('   Active:', registrations[0].active?.state);
      console.log('   Waiting:', registrations[0].waiting?.state);
      console.log('   Installing:', registrations[0].installing?.state);
    } else {
      console.log('❌ No Service Worker registered');
    }
  });
} else {
  console.log('❌ Service Worker not supported');
}

// Test 2: Web App Manifest
console.log('\n2. Testing Web App Manifest...');
fetch('/manifest.json')
  .then(response => response.json())
  .then(manifest => {
    console.log('✅ Manifest loaded successfully');
    console.log('   Name:', manifest.name);
    console.log('   Short Name:', manifest.short_name);
    console.log('   Display:', manifest.display);
    console.log('   Icons:', manifest.icons?.length || 0, 'icons');
    console.log('   Shortcuts:', manifest.shortcuts?.length || 0, 'shortcuts');
  })
  .catch(error => {
    console.log('❌ Manifest not found or invalid:', error.message);
  });

// Test 3: Installation Capability
console.log('\n3. Testing Installation Capability...');
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  deferredPrompt = e;
  console.log('✅ App is installable');
});

// Check if already installed
if (window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true) {
  console.log('✅ App is already installed');
} else {
  console.log('ℹ️  App is not installed (this is normal in browser)');
}

// Test 4: Cache Storage
console.log('\n4. Testing Cache Storage...');
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    console.log('✅ Cache API available');
    console.log('   Cache names:', cacheNames);
    
    // Check cache contents
    cacheNames.forEach(cacheName => {
      caches.open(cacheName).then(cache => {
        cache.keys().then(requests => {
          console.log(`   ${cacheName}: ${requests.length} cached items`);
        });
      });
    });
  });
} else {
  console.log('❌ Cache API not supported');
}

// Test 5: Offline Detection
console.log('\n5. Testing Offline Detection...');
console.log('   Online status:', navigator.onLine ? '✅ Online' : '❌ Offline');

window.addEventListener('online', () => {
  console.log('🌐 Connection restored');
});

window.addEventListener('offline', () => {
  console.log('📵 Connection lost');
});

// Test 6: PWA Features
console.log('\n6. Testing PWA Features...');

// Check for PWA context
if (window.React && window.React.version) {
  console.log('✅ React app loaded');
}

// Check for PWA components
const installPrompt = document.querySelector('[data-testid="pwa-install-prompt"]');
const updateNotification = document.querySelector('[data-testid="pwa-update-notification"]');

console.log('   Install Prompt:', installPrompt ? '✅ Present' : 'ℹ️  Not visible');
console.log('   Update Notification:', updateNotification ? '✅ Present' : 'ℹ️  Not visible');

// Test 7: Performance Metrics
console.log('\n7. Performance Metrics...');
if ('performance' in window) {
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation) {
    console.log('✅ Performance metrics available');
    console.log('   DOM Content Loaded:', Math.round(navigation.domContentLoadedEventEnd), 'ms');
    console.log('   Load Complete:', Math.round(navigation.loadEventEnd), 'ms');
    console.log('   First Paint:', Math.round(performance.getEntriesByName('first-paint')[0]?.startTime || 0), 'ms');
  }
}

// Test 8: Local Storage
console.log('\n8. Testing Local Storage...');
try {
  localStorage.setItem('pwa-test', 'success');
  const testValue = localStorage.getItem('pwa-test');
  if (testValue === 'success') {
    console.log('✅ Local Storage working');
    localStorage.removeItem('pwa-test');
  } else {
    console.log('❌ Local Storage not working');
  }
} catch (error) {
  console.log('❌ Local Storage error:', error.message);
}

// Test 9: Fetch API
console.log('\n9. Testing Fetch API...');
if ('fetch' in window) {
  console.log('✅ Fetch API available');
  
  // Test API endpoint (if server is running)
  fetch('/api/test', { method: 'HEAD' })
    .then(response => {
      console.log('   API endpoint test:', response.ok ? '✅ Reachable' : '⚠️  Not reachable');
    })
    .catch(error => {
      console.log('   API endpoint test: ⚠️  Server not running or endpoint not found');
    });
} else {
  console.log('❌ Fetch API not supported');
}

// Summary
console.log('\n📊 PWA Test Summary');
console.log('==================');
console.log('Run this script in the browser console to test PWA functionality.');
console.log('For complete testing:');
console.log('1. Test in both development and production builds');
console.log('2. Test installation on different devices');
console.log('3. Test offline functionality by disconnecting internet');
console.log('4. Use Chrome DevTools > Application > Service Workers');
console.log('5. Use Chrome DevTools > Application > Manifest');
console.log('6. Run Lighthouse PWA audit');

// Export test function for manual testing
window.testPWA = () => {
  console.clear();
  // Re-run all tests
  eval(document.currentScript?.innerHTML || '/* Run the script manually */');
};

console.log('\n💡 Tip: Run testPWA() to repeat these tests anytime.');
