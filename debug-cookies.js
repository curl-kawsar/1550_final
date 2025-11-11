// Debug script for VPS cookie issues
// Run this in browser console after login to debug

console.log('=== Admin Authentication Debug ===');

// Check localStorage
const adminToken = localStorage.getItem('adminToken');
console.log('1. AdminToken in localStorage:', adminToken ? 'EXISTS' : 'MISSING');
if (adminToken) {
  console.log('   Token preview:', adminToken.substring(0, 50) + '...');
}

// Check cookies
console.log('2. All cookies:', document.cookie);

// Test API call with cookie
fetch('/api/admin/auth/me')
  .then(response => {
    console.log('3. Cookie auth test:', response.status, response.statusText);
    return response.json();
  })
  .then(data => console.log('   Cookie auth data:', data))
  .catch(err => console.log('   Cookie auth error:', err));

// Test API call with Authorization header
if (adminToken) {
  fetch('/api/admin/auth/me', {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      console.log('4. Header auth test:', response.status, response.statusText);
      return response.json();
    })
    .then(data => console.log('   Header auth data:', data))
    .catch(err => console.log('   Header auth error:', err));
}

// Test dashboard stats
fetch('/api/dashboard/stats', {
  headers: adminToken ? {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  } : {}
})
  .then(response => {
    console.log('5. Dashboard stats test:', response.status, response.statusText);
    return response.json();
  })
  .then(data => console.log('   Dashboard data keys:', Object.keys(data)))
  .catch(err => console.log('   Dashboard error:', err));

console.log('=== Debug Complete ===');
