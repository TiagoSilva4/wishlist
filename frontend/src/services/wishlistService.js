// src/services/wishlistService.js
import { getSessionToken } from '../lib/allauth';

const API_URL = '/api/';

class WishlistService {
  constructor() {
    this.baseUrl = API_URL;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const sessionToken = getSessionToken();
    if (sessionToken) {
      headers['X-Session-Token'] = sessionToken;
    }
    
    // Add CSRF token
    // Try to get the CSRF token from cookies
    const csrfToken = this.getCsrfToken();
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
    
    return headers;
  }

  // Helper method to extract CSRF token from cookies
  getCsrfToken() {
    const tokenMatch = document.cookie.match(/csrftoken=([^;]+)/);
    return tokenMatch ? tokenMatch[1] : '';
  }

  async getWishlists() {
    try {
      const response = await fetch(`${this.baseUrl}wishlists/`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching wishlists:', error);
      throw error;
    }
  }

  async getWishlist(slug) {
    try {
      const response = await fetch(`${this.baseUrl}wishlists/${slug}/`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching wishlist details:', error);
      throw error;
    }
  }

  async createWishlist(wishlistData) {
    try {
      const response = await fetch(`${this.baseUrl}wishlists/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(wishlistData),
        credentials: 'include',
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error creating wishlist:', error);
      throw error;
    }
  }

  async updateWishlist(slug, wishlistData) {
    try {
      const response = await fetch(`${this.baseUrl}wishlists/${slug}/`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(wishlistData),
        credentials: 'include',
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error updating wishlist:', error);
      throw error;
    }
  }

  // Try to refresh the CSRF token
  async refreshCsrfToken() {
    try {
      // Make a GET request to the API or a specific CSRF endpoint
      const response = await fetch(`${this.baseUrl}csrf/`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.csrfToken) {
          // Store the token for future use
          console.log('CSRF token refreshed successfully');
          return true;
        }
      }
      
      console.log('CSRF endpoint not available or returned no token, using existing token from cookies');
      return true; // Continue with existing token
    } catch (error) {
      console.warn('Error refreshing CSRF token, continuing with existing token:', error);
      return true; // Continue with existing token from cookies
    }
  }

  async deleteWishlist(slug) {
    try {
      console.log(`Attempting to delete wishlist with slug: ${slug}`);
      
      // Try to refresh the CSRF token before deleting
      await this.refreshCsrfToken();
      
      console.log('Headers being sent:', this.getHeaders());
      
      const response = await fetch(`${this.baseUrl}wishlists/${slug}/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Delete request failed with status ${response.status}:`, errorText);
        throw new Error(`Failed to delete wishlist: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      // For DELETE operations, the server might not return JSON content
      // Check if there's actual content before trying to parse it
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      throw error;
    }
  }

  async getItems(wishlistSlug) {
    try {
      const response = await fetch(`${this.baseUrl}items/?wishlist=${wishlistSlug}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  /**
   * Create an item
   */
  async createItem(itemData) {
    try {
      console.log('Attempting to create item:', itemData);
      
      // Try to refresh the CSRF token before creating
      await this.refreshCsrfToken();
      
      console.log('Headers being sent:', this.getHeaders());
      
      const queryParams = window.location.pathname.startsWith('/shared-wishlists/') 
        ? '?shared_view=true' 
        : '';
      
      const response = await fetch(`${this.baseUrl}items/${queryParams}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(itemData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Create item failed with status ${response.status}:`, errorText);
        throw new Error(`Failed to create item: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Item created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  /**
   * Mark an item as purchased
   */
  async markItemPurchased(itemId) {
    try {
      console.log(`Marking item ${itemId} as purchased`);
      
      // Try to refresh the CSRF token before making the request
      await this.refreshCsrfToken();
      
      console.log('Headers being sent:', this.getHeaders());
      
      const queryParams = window.location.pathname.startsWith('/shared-wishlists/') 
        ? '?shared_view=true' 
        : '';
      
      const response = await fetch(`${this.baseUrl}items/${itemId}/mark_purchased/${queryParams}`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Mark purchased failed with status ${response.status}:`, errorText);
        throw new Error(`Failed to mark item as purchased: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Item marked as purchased successfully:', data);
      return data;
    } catch (error) {
      console.error('Error marking item as purchased:', error);
      throw error;
    }
  }

  /**
   * Update an item
   */
  async updateItem(itemId, itemData) {
    try {
      console.log(`Attempting to update item with ID: ${itemId}`, itemData);
      
      // Try to refresh the CSRF token before updating
      await this.refreshCsrfToken();
      
      console.log('Headers being sent:', this.getHeaders());
      
      const queryParams = window.location.pathname.startsWith('/shared-wishlists/') 
        ? '?shared_view=true' 
        : '';
      
      const response = await fetch(`${this.baseUrl}items/${itemId}/${queryParams}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(itemData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Update item failed with status ${response.status}:`, errorText);
        throw new Error(`Failed to update item: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Item updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const response = await fetch(`${this.baseUrl}categories/`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Delete an item
   */
  async deleteItem(itemId) {
    try {
      console.log(`Attempting to delete item with ID: ${itemId}`);
      
      // Try to refresh the CSRF token before deleting
      await this.refreshCsrfToken();
      
      console.log('Headers being sent:', this.getHeaders());
      
      const queryParams = window.location.pathname.startsWith('/shared-wishlists/') 
        ? '?shared_view=true' 
        : '';
      
      const response = await fetch(`${this.baseUrl}items/${itemId}/${queryParams}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Delete item failed with status ${response.status}:`, errorText);
        throw new Error(`Failed to delete item: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      // For DELETE operations, the server might not return JSON content
      // Check if there's actual content before trying to parse it
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  // New method to add an item from a URL
  async addItemFromUrl(wishlistId, url) {
    try {
      console.log(`Attempting to add item from URL: ${url} to wishlist ID: ${wishlistId}`);
      
      // Try to refresh the CSRF token before creating
      await this.refreshCsrfToken();
      
      console.log('Headers being sent:', this.getHeaders());
      
      const response = await fetch(`${this.baseUrl}wishlist-items/add-from-url/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          url: url,
          wishlist_id: wishlistId
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        // Handle 500 server errors specially
        if (response.status === 500) {
          console.error(`Server error when adding item from URL (500)`);
          throw new Error('server_error');
        }
        
        const errorText = await response.text();
        console.error(`Add item from URL failed with status ${response.status}:`, errorText);
        throw new Error('extraction_failed');
      }
      
      const data = await response.json();
      console.log('Item added from URL successfully:', data);
      return data;
    } catch (error) {
      console.error('Error adding item from URL:', error);
      // Don't expose the raw error to UI components
      throw new Error('extraction_failed');
    }
  }

  // New method to extract item details from a URL without adding it
  async extractItemDetails(url) {
    try {
      console.log(`Attempting to extract details from URL: ${url}`);
      
      // Try to refresh the CSRF token before extraction
      await this.refreshCsrfToken();
      
      console.log('Headers being sent:', this.getHeaders());
      
      const response = await fetch(`${this.baseUrl}wishlist-items/add-from-url/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          url: url,
          extract_only: true
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        // Handle 500 server errors specially
        if (response.status === 500) {
          console.error(`Server error when extracting details from URL (500)`);
          throw new Error('server_error');
        }
        
        const errorText = await response.text();
        console.error(`Extract details from URL failed with status ${response.status}:`, errorText);
        throw new Error('extraction_failed');
      }
      
      const data = await response.json();
      console.log('Details extracted from URL successfully:', data);
      return data;
    } catch (error) {
      console.error('Error extracting details from URL:', error);
      // Don't expose the raw error to UI components
      throw new Error('extraction_failed');
    }
  }

  async getSharedWishlist(slug) {
    try {
      console.log(`Fetching shared wishlist with slug: ${slug}`);
      
      // For shared wishlist access, allow credentials but use minimal headers
      // This way, if the user is logged in, the server gets their auth token
      // but we don't enforce authentication for shared wishlist view
      const headers = { 'Content-Type': 'application/json' };
      
      // Add session token if available
      const sessionToken = getSessionToken();
      if (sessionToken) {
        headers['X-Session-Token'] = sessionToken;
      }
      
      const response = await fetch(`${this.baseUrl}shared-wishlists/${slug}/`, {
        method: 'GET',
        headers: headers,
        credentials: 'include', // Include credentials to support authenticated users
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
        console.error('Error fetching shared wishlist:', errorData);
        throw new Error(errorData.error || `Failed to fetch shared wishlist: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Successfully fetched shared wishlist:', data);
      
      // Debug check - verify items are included
      if (!data.items || data.items.length === 0) {
        console.warn('Shared wishlist has no items or items array is missing:', data);
      } else {
        console.log(`Shared wishlist has ${data.items.length} items`);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching shared wishlist details:', error);
      throw error;
    }
  }

  async debugSharedWishlist(slug) {
    try {
      console.log(`DEBUG: Testing shared wishlist access for slug: ${slug}`);
      
      // Simple GET request with minimal headers
      const response = await fetch(`${this.baseUrl}debug-shared-wishlist/${slug}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include credentials in case user is authenticated
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Debug shared wishlist failed with status ${response.status}:`, errorText);
        return { error: `Failed to access debug endpoint: ${response.status}` };
      }
      
      const data = await response.json();
      console.log('DEBUG shared wishlist response:', data);
      return data;
    } catch (error) {
      console.error('Error in debug shared wishlist:', error);
      return { error: error.message };
    }
  }

  // Helper method to get the shared wishlist URL
  getSharedWishlistUrl(slug) {
    return `${window.location.origin}/shared-wishlists/${slug}`;
  }
}

const wishlistService = new WishlistService();

export { wishlistService, WishlistService };