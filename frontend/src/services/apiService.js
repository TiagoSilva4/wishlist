// apiService.js
const API_BASE_URL = "/api";

// Enhanced function to get CSRF token
const getCsrfToken = () => {
  try {
    // Get from cookie
    const cookieValue = document.cookie
      .split("; ")
      .find(row => row.startsWith("csrftoken="))
      ?.split("=")[1];
    
    if (!cookieValue) {
      console.warn('CSRF token not found in cookies');
    } else {
      console.debug('Retrieved CSRF token from cookies');
    }
    
    return cookieValue || "";
  } catch (error) {
    console.error('Error retrieving CSRF token from cookies:', error);
    return "";
  }
};

// Function to refresh CSRF token
const refreshCsrfToken = async () => {
  console.log('Attempting to refresh CSRF token...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
      method: 'GET',
      credentials: 'include', // Important to include cookies
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to refresh CSRF token. Status: ${response.status}`, errorText);
      throw new Error(`Failed to refresh CSRF token: ${response.status}`);
    }
    
    console.log('CSRF token refresh successful');
    
    // Force the browser to process Set-Cookie headers
    const currentToken = getCsrfToken();
    if (!currentToken) {
      console.warn('CSRF token is still empty after refresh attempt');
    }
    
    return currentToken;
  } catch (error) {
    console.error('Error during CSRF token refresh:', error);
    // Return the current token as fallback
    return getCsrfToken();
  }
};

// Default fetch options with credentials and CSRF token
const defaultOptions = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  }
};

// Common fetch wrapper with error handling
const fetchApi = async (url, options = {}) => {
  try {
    // Get a fresh CSRF token for every request that modifies data
    const needsToken = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method);
    const csrfToken = needsToken ? await refreshCsrfToken() : getCsrfToken();
    
    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
        "X-CSRFToken": csrfToken
      }
    };
    
    console.log(`API request to ${url}`, requestOptions);
    
    const response = await fetch(url, requestOptions);

    console.log(`API response from ${url}:`, response.status);
    
    // For 204 No Content, return null
    if (response.status === 204) {
      return null;
    }

    // For other successful responses, parse JSON
    if (response.ok) {
      const data = await response.json();
      console.log(`API success data:`, data);
      return data;
    }

    // For error responses
    const errorText = await response.text();
    let errorData;
    
    try {
      // Try to parse JSON
      errorData = JSON.parse(errorText);
      console.error(`API error response (${response.status}):`, errorData);
    } catch (e) {
      // If not JSON, use the raw text
      console.error(`API error response (${response.status}):`, errorText);
      errorData = { message: errorText, errors: [{ message: errorText }] };
    }
    
    // Create a properly formatted error object
    const error = new Error(errorData.message || errorData.detail || errorData.errors?.[0]?.message || "An error occurred");
    error.status = response.status;
    error.data = errorData;
    error.errors = errorData.errors || [];
    
    // Add CSRF specific error handling
    if (response.status === 403 && errorData.detail && errorData.detail.includes('CSRF')) {
      console.error('CSRF token validation failed, will attempt to refresh token on next request');
      error.message = "Session expired. Please try again.";
      error.errors = [{ param: 'general', message: "Session expired. Please try again." }];
    }
    
    throw error;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Authentication methods
const login = (credentials) => {
  return fetchApi(`${API_BASE_URL}/auth/login/`, {
    method: "POST",
    body: JSON.stringify(credentials)
  });
};

const logout = () => {
  return fetchApi(`${API_BASE_URL}/auth/logout/`, {
    method: "POST"
  });
};

const signup = (userData) => {
  return fetchApi(`${API_BASE_URL}/auth/register/`, {
    method: "POST",
    body: JSON.stringify(userData)
  });
};

const checkAuth = () => {
  return fetchApi(`${API_BASE_URL}/auth/user/`);
};

// Wishlist methods
const getWishlists = () => {
  return fetchApi(`${API_BASE_URL}/wishlists/`);
};

// This is the method we need to call from MyWishlists.js
const getMyWishlists = () => {
  return fetchApi(`${API_BASE_URL}/wishlists/mine/`);
};

const getWishlist = (id) => {
  return fetchApi(`${API_BASE_URL}/wishlists/${id}/`);
};

const createWishlist = (wishlistData) => {
  return fetchApi(`${API_BASE_URL}/wishlists/`, {
    method: "POST",
    body: JSON.stringify(wishlistData)
  });
};

const updateWishlist = (id, wishlistData) => {
  return fetchApi(`${API_BASE_URL}/wishlists/${id}/`, {
    method: "PUT",
    body: JSON.stringify(wishlistData)
  });
};

const deleteWishlist = (id) => {
  return fetchApi(`${API_BASE_URL}/wishlists/${id}/`, {
    method: "DELETE"
  });
};

// Wishlist item methods
const getWishlistItems = (wishlistId) => {
  return fetchApi(`${API_BASE_URL}/wishlists/${wishlistId}/items/`);
};

const addWishlistItem = (wishlistId, itemData) => {
  return fetchApi(`${API_BASE_URL}/wishlists/${wishlistId}/items/`, {
    method: "POST",
    body: JSON.stringify(itemData)
  });
};

// New method to add an item from a URL
const addItemFromUrl = (wishlistId, url) => {
  return fetchApi(`${API_BASE_URL}/wishlist-items/add-from-url/`, {
    method: "POST",
    body: JSON.stringify({
      url: url,
      wishlist_id: wishlistId
    })
  });
};

const updateWishlistItem = (wishlistId, itemId, itemData) => {
  return fetchApi(`${API_BASE_URL}/wishlists/${wishlistId}/items/${itemId}/`, {
    method: "PUT",
    body: JSON.stringify(itemData)
  });
};

const deleteWishlistItem = (wishlistId, itemId) => {
  return fetchApi(`${API_BASE_URL}/wishlists/${wishlistId}/items/${itemId}/`, {
    method: "DELETE"
  });
};

// New method to update user profile
const updateProfile = async (profileData) => {
  // Log the profile data before sending
  console.log('Updating profile with data:', profileData);
  
  // Password is no longer required
  
  // Explicitly refresh the CSRF token before making the request
  await refreshCsrfToken();
  
  return fetchApi(`${API_BASE_URL}/auth/account/profile/`, {
    method: "PUT",
    body: JSON.stringify({
      username: profileData.username,
      current_password: profileData.current_password || '' // Make password optional
    })
  });
};

// Function to update username
export const updateUsername = async (newUsername, password) => {
  try {
    // Refresh the CSRF token before making the update request
    const csrfToken = await refreshCsrfToken();
    
    if (!csrfToken) {
      console.error('Unable to get valid CSRF token');
      throw new Error('CSRF token is missing or invalid');
    }
    
    console.log('Using CSRF token for username update:', csrfToken);
    
    const response = await fetch(`${API_BASE_URL}/auth/update/username/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({
        new_username: newUsername,
        // Make password optional
        password: password || '',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update username');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating username:', error);
    throw error;
  }
};

const apiService = {
  login,
  logout,
  signup,
  checkAuth,
  getWishlists,
  getMyWishlists,
  getWishlist,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  getWishlistItems,
  addWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
  updateProfile,
  refreshCsrfToken,
  updateUsername,
  addItemFromUrl
};

export default apiService;