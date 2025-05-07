import { getSessionToken } from '../lib/allauth';

// Use environment variable with fallback
const API_URL = '/api/';

/**
 * Base API service for making HTTP requests to the Django backend
 */
class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  /**
   * Get auth headers including session token if available
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add session token if available
    const sessionToken = getSessionToken();
    if (sessionToken) {
      headers['X-Session-Token'] = sessionToken;
    }
    
    // Add CSRF token if available
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
    
    return headers;
  }

  /**
   * Generic HTTP GET request
   */
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include', // Important for session-based auth
      });
      
      if (!response.ok) {
        // Handle auth errors specifically
        if (response.status === 401 || response.status === 403) {
          console.error(`Authentication error: ${response.status}`);
          throw new Error(`Authentication required: ${response.status}`);
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  }

  /**
   * Generic HTTP POST request
   */
  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include', // Important for session-based auth
      });
      
      if (!response.ok) {
        // For 400 errors, try to get detailed error information
        if (response.status === 400) {
          try {
            const errorData = await response.json();
            console.error('API 400 error details:', errorData);
            throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
          } catch (parseError) {
            // If we can't parse JSON, fall back to text
            const errorText = await response.text();
            console.error('API 400 error text:', errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
          }
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  }

  /**
   * Generic HTTP PUT request
   */
  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include', // Important for session-based auth
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  }

  /**
   * Generic HTTP DELETE request
   */
  async delete(endpoint) {
    try {
      console.log(`Sending DELETE request to: ${this.baseUrl}${endpoint}`);
      console.log('Headers:', this.getHeaders());
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include', // Important for session-based auth
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`DELETE request failed with status ${response.status}:`, errorText);
        throw new Error(`API error: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      // For DELETE operations, the server might not return JSON content
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        // Return a successful result even if no content
        return { success: true };
      }
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  }
  
  /**
   * Get all wishlists
   */
  getWishlists() {
    return this.get('wishlists/');
  }
  
  /**
   * Get wishlists belonging to the currently authenticated user
   */
  getMyWishlists() {
    console.log('Calling getMyWishlists API method');
    
    // Check for authentication token
    const sessionToken = getSessionToken();
    if (!sessionToken) {
      console.warn('No session token found when calling getMyWishlists');
    }
    
    // Use the regular wishlists endpoint but apply my_wishlists=true filter
    // This will use the regular serializer that includes all fields including slug
    return this.get('wishlists/?my_wishlists=true');
  }
  
  /**
   * Get a specific wishlist by slug
   */
  getWishlist(slug) {
    return this.get(`wishlists/${slug}/`);
  }
  
  /**
   * Create a new wishlist
   */
  createWishlist(wishlistData) {
    return this.post('wishlists/', wishlistData);
  }
  
  /**
   * Update a wishlist
   */
  updateWishlist(slug, wishlistData) {
    return this.put(`wishlists/${slug}/`, wishlistData);
  }
  
  /**
   * Delete a wishlist
   */
  deleteWishlist(slug) {
    return this.delete(`wishlists/${slug}/`);
  }
  
  /**
   * Get all items for a wishlist
   */
  getItems(wishlistSlug) {
    return this.get(`items/?wishlist=${wishlistSlug}`);
  }
  
  /**
   * Create a new item in a wishlist
   */
  createItem(itemData) {
    return this.post('items/', itemData);
  }
  
  /**
   * Mark an item as purchased
   */
  markItemPurchased(itemId) {
    return this.post(`items/${itemId}/mark_purchased/`);
  }
  
  /**
   * Get all categories
   */
  getCategories() {
    return this.get('categories/');
  }
  
  /**
   * Create a new category
   */
  createCategory(categoryData) {
    return this.post('categories/', categoryData);
  }
  
  /**
   * Update a category
   */
  updateCategory(id, categoryData) {
    return this.put(`categories/${id}/`, categoryData);
  }
  
  /**
   * Delete a category
   */
  deleteCategory(id) {
    return this.delete(`categories/${id}/`);
  }
}

const apiService = new ApiService();
export default apiService;