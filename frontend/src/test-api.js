// Test multiple endpoints
export function testApiConnections() {
  // Test our custom debug endpoint
  fetch('/_allauth/debug/')
    .then(response => response.text())
    .then(text => {
      console.log('/_allauth/debug/ response:', text);
      try {
        const data = JSON.parse(text);
        console.log('Parsed JSON:', data);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    })
    .catch(error => {
      console.error('/_allauth/debug/ request failed:', error);
    });

  // Test API endpoint
  fetch('/api/debug/')
    .then(response => response.text())
    .then(text => {
      console.log('/api/debug/ response:', text);
      try {
        const data = JSON.parse(text);
        console.log('Parsed JSON:', data);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    })
    .catch(error => {
      console.error('/api/debug/ request failed:', error);
    });
} 