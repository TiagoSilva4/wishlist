import { setup } from './lib/allauth'

export function init() {
  // Attempt to fetch content directly before setup to see what's happening
  fetch('/_allauth/browser/v1/config')
    .then(response => {
      console.log('Direct config fetch status:', response.status);
      return response.text();
    })
    .then(text => {
      console.log('Direct config fetch response:', text.substring(0, 100) + '...');
    })
    .catch(error => {
      console.error('Direct config fetch error:', error);
    });
  
  // Use a direct path for testing
  setup('browser', '/_allauth/browser/v1', true);
  
  console.log('Allauth initialized with:', {
    client: 'browser',
    baseUrl: '/_allauth/browser/v1',
    withCredentials: true
  });
}
