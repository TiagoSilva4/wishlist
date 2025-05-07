import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth";
import { wishlistService } from "../services/wishlistService";

// Add API base URL constant
const API_BASE_URL = "http://localhost:8000/api";

const WishlistDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, status } = useAuth();
  
  // Get user from localStorage as fallback
  const [localUser, setLocalUser] = useState(null);
  
  useEffect(() => {
    // Try to get user from localStorage if not available from context
    if (!user) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setLocalUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
      }
    }
  }, [user]);
  
  // Use either context user or localStorage user
  const currentUser = user || localUser;
  const isAuthenticated = status === 200 || !!currentUser;
  
  // Check if user is owner of this wishlist - declare once at the top level
  const [isOwner, setIsOwner] = useState(false);
  
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    url: "",
    image_url: "",
    priority: 2,
    quantity: 1
  });
  // Add state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  // Add state for item delete confirmation
  const [showItemDeleteModal, setShowItemDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemDeleteInProgress, setItemDeleteInProgress] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  // Add a state variable to track if this is a shared view
  const [isSharedView, setIsSharedView] = useState(false);

  // Add this near the top of your WishlistDetail component
  const isSharedWishlistUrl = window.location.pathname.startsWith('/shared-wishlists/');

  // Fetch wishlist data
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        let data;
        
        // Use different API methods based on the URL
        if (isSharedWishlistUrl) {
          // For shared wishlists, use the dedicated endpoint that doesn't require auth
          console.log(`Fetching shared wishlist with slug: ${slug}`);
          data = await wishlistService.getSharedWishlist(slug);
          setIsSharedView(true); // Set shared view state
          
          // Log for debugging
          if (data && data.items) {
            console.log(`Successfully loaded shared wishlist with ${data.items.length} items`);
          } else {
            console.warn('Loaded shared wishlist but items array is missing or empty:', data);
          }
        } else {
          // For regular wishlist views, use the authenticated endpoint
          console.log(`Fetching regular wishlist with slug: ${slug}`);
          data = await wishlistService.getWishlist(slug);
          setIsSharedView(false); // Not a shared view
        }
        
        setWishlist(data);
        
        // Set document title
        document.title = `${data.title} | WishList`;
        
        // Update isOwner state after getting wishlist data
        setIsOwner(currentUser && data.user && data.user.id === currentUser.id);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        
        // Show a more helpful error message for shared wishlists
        if (isSharedWishlistUrl) {
          setError("This shared wishlist doesn't exist or is no longer shared.");
        } else {
          setError("Failed to load wishlist. It may not exist or you don't have permission to view it.");
        }
        
        setLoading(false);
      }
    };

    fetchWishlist();
    
    // Listen for wishlist update events
    const handleWishlistUpdated = (event) => {
      const detail = event.detail || {};
      console.log('WishlistDetail - received wishlist:updated event', detail);
      
      // Only refresh if this is the wishlist being updated
      if (detail.wishlistSlug === slug) {
        console.log(`This wishlist (${slug}) was updated, refreshing details`);
        fetchWishlist();
      }
    };
    
    document.addEventListener('wishlists:updated', handleWishlistUpdated);
    
    return () => {
      document.removeEventListener('wishlists:updated', handleWishlistUpdated);
    };
  }, [slug, currentUser, isSharedWishlistUrl]);

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    // For price, ensure it's properly converted to a number (or empty string if invalid)
    if (name === "price") {
      const numValue = parseFloat(value);
      setNewItem({
        ...newItem,
        [name]: isNaN(numValue) ? "" : numValue
      });
    } else {
      setNewItem({
        ...newItem,
        [name]: name === "priority" || name === "quantity" 
          ? Number(value) 
          : value
      });
    }
  };

  // Function to start editing an item
  const startEditingItem = (item) => {
    setEditingItemId(item.id);
    setNewItem({
      name: item.name,
      description: item.description || "",
      price: item.price || "",
      url: item.url || "",
      image_url: item.image_url || "",
      priority: item.priority || 2,
      quantity: item.quantity || 1
    });
    setShowAddItemForm(true);
    
    // Scroll to the add item form
    setTimeout(() => {
      const formElement = document.getElementById("addItemForm");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setEditingItemId(null);
    setNewItem({
      name: "",
      description: "",
      price: "",
      url: "",
      image_url: "",
      priority: 2,
      quantity: 1
    });
    setShowAddItemForm(false);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      let itemData = { ...newItem };
      
      // Ensure price is a number if provided
      if (itemData.price === "") {
        itemData.price = null;
      } else if (typeof itemData.price === "string") {
        const numPrice = parseFloat(itemData.price);
        itemData.price = isNaN(numPrice) ? null : numPrice;
      }
      
      // Validate form data
      if (!itemData.name || itemData.name.trim() === "") {
        setError("Item name is required");
        return;
      }
      
      // Make sure quantity is a number
      if (typeof itemData.quantity === "string") {
        itemData.quantity = parseInt(itemData.quantity, 10) || 1;
      }
      
      // Make sure priority is a number
      if (typeof itemData.priority === "string") {
        itemData.priority = parseInt(itemData.priority, 10) || 2;
      }
      
      console.log(`${editingItemId ? "Updating" : "Adding"} item with data:`, itemData);
      
      if (editingItemId) {
        // Update existing item
        console.log(`Updating item with ID: ${editingItemId}`);
        
        // Make sure to include the wishlist ID when updating
        itemData.wishlist = wishlist.id;
        
        response = await wishlistService.updateItem(editingItemId, itemData);
        console.log("Update response:", response);
        
        // Update the item in the list
        const updatedItems = wishlist.items.map(item => 
          item.id === editingItemId ? response : item
        );
        
        setWishlist({
          ...wishlist,
          items: updatedItems
        });
        
        setEditingItemId(null); // Clear editing state
      } else {
        // Add wishlist ID for new items
        itemData.wishlist = wishlist.id;
        console.log(`Adding new item to wishlist ID: ${wishlist.id}`);
        
        // Create new item
        response = await wishlistService.createItem(itemData);
        console.log("Create response:", response);
      
        // Update wishlist with new item
        setWishlist({
          ...wishlist,
          items: [...wishlist.items, response]
        });
      }
      
      // Reset form
      setNewItem({
        name: "",
        description: "",
        price: "",
        url: "",
        image_url: "",
        priority: 2,
        quantity: 1
      });
      
      // Hide form
      setShowAddItemForm(false);
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error(`Error ${editingItemId ? "updating" : "adding"} item:`, err);
      setError(`Failed to ${editingItemId ? "update" : "add"} item: ${err.message || "Please try again."}`);
    }
  };

  const handleDeleteWishlist = async () => {
    try {
      setDeleteInProgress(true);
      console.log("Deleting wishlist with slug:", slug);
      const result = await wishlistService.deleteWishlist(slug);
      console.log("Delete result:", result);
      
      // Dispatch a custom event to notify other components that wishlists have changed
      // Include a timestamp to ensure it's treated as a new event
      const event = new CustomEvent('wishlists:updated', { 
        detail: { 
          timestamp: new Date().getTime(),
          action: 'delete',
          wishlistSlug: slug
        } 
      });
      document.dispatchEvent(event);
      
      // Slight delay before navigation to ensure event processing
      setTimeout(() => {
        // Navigate back to the homepage
        navigate("/");
      }, 100);
    } catch (err) {
      console.error("Error deleting wishlist:", err);
      setError("Failed to delete wishlist. Please try again.");
      setDeleteInProgress(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      setItemDeleteInProgress(true);
      console.log("Deleting item with ID:", itemToDelete.id);
      
      await wishlistService.deleteItem(itemToDelete.id);
      
      // Update the wishlist by removing the deleted item
      setWishlist({
        ...wishlist,
        items: wishlist.items.filter(item => item.id !== itemToDelete.id)
      });
      
      // Reset states
      setShowItemDeleteModal(false);
      setItemToDelete(null);
      setItemDeleteInProgress(false);
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      setError(`Failed to delete item: ${err.message || "Please try again."}`);
      setItemDeleteInProgress(false);
      setShowItemDeleteModal(false);
    }
  };

  // Function to open delete confirmation modal for an item
  const confirmItemDelete = (item) => {
    setItemToDelete(item);
    setShowItemDeleteModal(true);
  };

  // For debugging only
  console.log('Debug - Auth status:', { 
    isAuthenticated: isAuthenticated,
    userExists: !!currentUser, 
    wishlistUserExists: !!wishlist?.user, 
    userId: currentUser?.id, 
    wishlistUserId: wishlist?.user?.id,
    isOwner: isOwner
  });
  
  // Function to extract details from URL and fill form fields without saving
  const extractUrlDetails = async () => {
    if (!newItem.url || newItem.url.trim() === "") {
      setError("Please enter a valid URL first");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the wishlistService method to extract details
      const extractedData = await wishlistService.extractItemDetails(newItem.url);
      console.log("Extracted details:", extractedData);
      
      // Check if extraction was successful or if we got fallback data
      if (extractedData.name === 'Unknown Product') {
        // We got default fallback data, clear any existing success message and show error
        setSuccessMessage(null);
        setError("Sorry, we weren't able to get information. Please enter info manually.");
        return;
      }
      
      // Check which fields were successfully extracted - ONLY price, name, and image
      const extractedFields = [];
      let partialExtraction = false;
      
      if (extractedData.name && extractedData.name !== 'Unknown Product') {
        extractedFields.push('name');
      } else {
        partialExtraction = true;
      }
      
      if (extractedData.price) {
        extractedFields.push('price');
      } else {
        partialExtraction = true;
      }
      
      if (extractedData.image_url) {
        extractedFields.push('image');
      } else {
        partialExtraction = true;
      }
      
      // Update form fields with extracted data but ONLY for name, price, and image
      // IMPORTANT: DO NOT update the description field at all
      setNewItem({
        ...newItem,
        name: extractedData.name && extractedData.name !== 'Unknown Product' ? extractedData.name : newItem.name,
        // Description intentionally not updated with scraped data
        price: extractedData.price || newItem.price,
        image_url: extractedData.image_url || newItem.image_url
      });
      
      // Show appropriate success message
      if (extractedFields.length === 0) {
        setError("Sorry, we weren't able to get information. Please enter info manually.");
      } else if (partialExtraction) {
        const fieldsList = extractedFields.join(', ');
        setSuccessMessage(`Partially extracted: ${fieldsList}. Please fill in the remaining details manually.`);
      } else {
        setSuccessMessage("Product details extracted successfully!");
      }
      
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (err) {
      console.error("Error extracting details from URL:", err);
      // Use a simple, user-friendly error message regardless of the actual error
      setError("Sorry, we weren't able to get information. Please enter info manually.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle URL extraction and fill in the main form
  const handleExtractFromUrl = async (e) => {
    e.preventDefault();
    
    if (!urlInput || urlInput.trim() === "") {
      setExtractError("Please enter a valid URL");
      return;
    }
    
    try {
      setIsExtracting(true);
      setExtractError(null);
      
      // Call the wishlistService to extract details from URL
      const extractedData = await wishlistService.extractItemDetails(urlInput);
      
      // Check if extraction was successful or if we got fallback data
      if (extractedData.name === 'Unknown Product' && !extractedData.image_url) {
        setExtractError("Sorry, we weren't able to get information. Please enter info manually.");
        return;
      }
      
      // Fill the main form with the extracted data (except description)
      setNewItem({
        ...newItem,
        name: extractedData.name && extractedData.name !== 'Unknown Product' ? extractedData.name : "",
        // Description intentionally not updated - leave as is
        price: extractedData.price || "",
        url: urlInput,  // Use the URL that was entered
        image_url: extractedData.image_url || ""
      });
      
      // Clear the URL input field since we're using it in the main form now
      setUrlInput("");
      
      // Show a success message
      setSuccessMessage("Details extracted! Review and save when ready.");
      setTimeout(() => setSuccessMessage(null), 5000);
      
      console.log("Item details extracted successfully:", extractedData);
    } catch (err) {
      console.error("Error extracting from URL:", err);
      // Use a simple, user-friendly error message regardless of the actual error
      setExtractError("Sorry, we weren't able to get information. Please enter info manually.");
    } finally {
      setIsExtracting(false);
    }
  };
  
  // Add a debug function to test shared wishlist access
  const runDebugTest = async () => {
    if (!slug) return;
    
    try {
      console.log('Running debug test for shared wishlist access...');
      const debugResult = await wishlistService.debugSharedWishlist(slug);
      console.log('Debug test result:', debugResult);
      
      // Display the debug result as an alert for now
      if (debugResult.error) {
        alert(`Debug Error: ${debugResult.error}`);
      } else {
        const formattedResult = `
Auth: ${debugResult.auth_status.authenticated ? debugResult.auth_status.user : 'Not authenticated'}
Wishlist: ${debugResult.wishlist.title} (${debugResult.wishlist.privacy})
Items: ${debugResult.wishlist.item_count}
First few items: ${debugResult.items.slice(0, 3).map(i => i.name).join(', ')}
        `;
        alert(`Debug Success:\n${formattedResult}`);
      }
    } catch (err) {
      console.error('Error running debug test:', err);
      alert(`Debug function error: ${err.message}`);
    }
  };
  
  // Add a hidden debug trigger - press 'd' three times quickly to run debug
  const [debugKeyCount, setDebugKeyCount] = useState(0);
  const debugKeyTimer = useRef(null);
  
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'd' || e.key === 'D') {
        setDebugKeyCount(prev => prev + 1);
        
        // Reset after a timeout
        if (debugKeyTimer.current) {
          clearTimeout(debugKeyTimer.current);
        }
        
        debugKeyTimer.current = setTimeout(() => {
          setDebugKeyCount(0);
        }, 1000);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (debugKeyTimer.current) {
        clearTimeout(debugKeyTimer.current);
      }
    };
  }, []);
  
  // Trigger debug function when key count reaches 3
  useEffect(() => {
    if (debugKeyCount >= 3) {
      runDebugTest();
      setDebugKeyCount(0);
    }
  }, [debugKeyCount]);

  // Render the component
  if (loading) return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <div className="animate-pulse" style={{ display: "inline-block" }}>
        <svg style={{ width: "2rem", height: "2rem", color: "#4f46e5" }} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <p style={{ marginTop: "1rem", color: "#6b7280" }}>Loading wishlist...</p>
    </div>
  );
  
  // Handle case when wishlist isn't found or user doesn't have access
  // Only show full page error if wishlist failed to load completely
  if (!wishlist) return (
    <div style={{ 
      maxWidth: "800px", 
      margin: "2rem auto", 
      padding: "2rem",
      backgroundColor: "#f3f4f6",
      borderRadius: "0.5rem"
    }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Wishlist not found</h2>
      <p>The wishlist you're looking for doesn't exist or you don't have permission to view it.</p>
      <Link 
        to="/wishlists"
        style={{ 
          display: "inline-block",
          marginTop: "1rem",
          padding: "0.5rem 1rem", 
          backgroundColor: "#4f46e5", 
          color: "white",
          borderRadius: "0.375rem",
          textDecoration: "none",
          fontWeight: "500"
        }}
      >
        Back to Wishlists
      </Link>
    </div>
  );
  
  return (
    <main className="fade-in" style={{ 
      maxWidth: "1000px",
      margin: "3rem auto",
      padding: "0 2rem",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Delete Confirmation Modal for Wishlist */}
      {showDeleteModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            padding: "2rem",
            maxWidth: "450px",
            width: "90%",
            animation: "fadeInUp 0.3s ease"
          }}>
            <h3 style={{ 
              fontSize: "1.25rem", 
              fontWeight: "700", 
              color: "#1e293b",
              marginBottom: "1rem" 
            }}>
              Delete Wishlist
            </h3>
            
            <p style={{ 
              color: "#64748b", 
              marginBottom: "1.5rem", 
              lineHeight: "1.5" 
            }}>
              Are you sure you want to delete <span style={{ fontWeight: "600", color: "#4f46e5" }}>{wishlist?.title}</span>? This action cannot be undone.
            </p>
            
            <div style={{ 
              display: "flex", 
              gap: "1rem", 
              justifyContent: "flex-end" 
            }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteInProgress}
                style={{
                  padding: "0.625rem 1.25rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "white",
                  color: "#6b7280",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: deleteInProgress ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: deleteInProgress ? 0.7 : 1
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleDeleteWishlist}
                disabled={deleteInProgress}
                style={{
                  padding: "0.625rem 1.25rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  backgroundColor: "#ef4444",
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: deleteInProgress ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem", 
                  transition: "all 0.2s ease",
                  opacity: deleteInProgress ? 0.7 : 1
                }}
              >
                {deleteInProgress ? (
                  <>
                    <div style={{
                      width: "1rem",
                      height: "1rem",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite"
                    }}></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete Wishlist
                  </>
                )}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes spin {
              to { transform: rotate(360deg) }
            }
          `}</style>
        </div>
      )}

      {/* Delete Confirmation Modal for Items */}
      {showItemDeleteModal && itemToDelete && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            padding: "2rem",
            maxWidth: "450px",
            width: "90%",
            animation: "fadeInUp 0.3s ease"
          }}>
            <h3 style={{ 
              fontSize: "1.25rem", 
              fontWeight: "700", 
              color: "#1e293b",
              marginBottom: "1rem" 
            }}>
              Delete Item
            </h3>
            
            <p style={{ 
              color: "#64748b", 
              marginBottom: "1.5rem", 
              lineHeight: "1.5" 
            }}>
              Are you sure you want to delete <span style={{ fontWeight: "600", color: "#4f46e5" }}>{itemToDelete.name}</span>? This action cannot be undone.
            </p>
            
            <div style={{ 
              display: "flex", 
              gap: "1rem", 
              justifyContent: "flex-end" 
            }}>
              <button
                onClick={() => {
                  setShowItemDeleteModal(false);
                  setItemToDelete(null);
                }}
                disabled={itemDeleteInProgress}
                style={{
                  padding: "0.625rem 1.25rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "white",
                  color: "#6b7280",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: itemDeleteInProgress ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: itemDeleteInProgress ? 0.7 : 1
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleDeleteItem}
                disabled={itemDeleteInProgress}
                style={{
                  padding: "0.625rem 1.25rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  backgroundColor: "#ef4444",
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: itemDeleteInProgress ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem", 
                  transition: "all 0.2s ease",
                  opacity: itemDeleteInProgress ? 0.7 : 1
                }}
              >
                {itemDeleteInProgress ? (
                  <>
                    <div style={{
                      width: "1rem",
                      height: "1rem",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite"
                    }}></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete Item
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header section */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "3rem"
      }}>
        <h1 style={{ 
          fontSize: "2.5rem",
          fontWeight: "800",
          color: "#1e293b",
          position: "relative",
          display: "inline-block",
        }}>
          <span><span style={{ fontWeight: "800", color: "#1e293b" }}>Wish</span><span style={{ fontWeight: "800", color: "#4f46e5" }}>List</span></span>
          {wishlist && <span style={{ marginLeft: "0.5rem" }}>Details</span>}
        </h1>
        
        <Link
          to="/"
          style={{
            color: "#6b7280",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#4f46e5";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Wishlists
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ 
          textAlign: "center", 
          padding: "3rem",
          backgroundColor: "white",
          borderRadius: "0.75rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{
            display: "inline-block",
            width: "3rem",
            height: "3rem",
            border: "3px solid #e5e7eb",
            borderRadius: "50%",
            borderTopColor: "#4f46e5",
            animation: "spin 1s linear infinite",
            marginBottom: "1rem"
          }}></div>
          <p style={{ color: "#64748b", fontSize: "1rem" }}>
            Loading wishlist details...
          </p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg) }
            }
          `}</style>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ 
          padding: "1.5rem",
          backgroundColor: "#fef2f2",
          border: "1px solid #fee2e2",
          borderRadius: "0.5rem",
          color: "#b91c1c",
          marginBottom: "2rem" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <svg style={{ width: "1.5rem", height: "1.5rem", flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p style={{ fontWeight: "600", fontSize: "1rem" }}>Error</p>
              <p style={{ fontSize: "0.875rem" }}>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist content */}
      {!loading && !error && wishlist && (
        <div style={{ 
          backgroundColor: "white",
          borderRadius: "0.75rem",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          overflow: "hidden",
          marginBottom: "2rem"
        }}>
          {/* Wishlist header */}
          <div style={{ 
            padding: "2rem",
            borderBottom: "1px solid #e5e7eb"
          }}>
            {/* Add shared wishlist info banner */}
            {isSharedView && (
              <div style={{ 
                padding: "1rem", 
                backgroundColor: "#f0f9ff", 
                borderRadius: "0.5rem", 
                marginBottom: "1.5rem",
                border: "1px solid #bae6fd",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem" 
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#0284c7" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
                <div>
                  <p style={{ fontWeight: "600", color: "#0c4a6e" }}>
                    Shared Wishlist View
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#0369a1" }}>
                    {isAuthenticated 
                      ? "You are viewing a wishlist shared with you." 
                      : "You are viewing a shared wishlist."}
                  </p>
                </div>
              </div>
            )}
            
            <div style={{ 
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1.5rem"
            }}>
              <div>
                <h2 style={{ 
                  fontSize: "1.875rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}>
                  {wishlist.title}
                  {isSharedView && (
                    <span style={{
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      backgroundColor: "#e0f2fe",
                      color: "#0369a1",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "9999px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/>
                      </svg>
                      Shared
                    </span>
                  )}
                </h2>
                
                {wishlist.description && (
                  <p style={{ 
                    color: "#64748b", 
                    fontSize: "1rem",
                    maxWidth: "36rem" 
                  }}>
                    {wishlist.description}
                  </p>
                )}
              </div>
              
              {(isOwner) && (
                <div style={{ display: "flex", gap: "1rem" }}>
                  <Link
                    to={`/wishlist/${slug}/edit`}
                    style={{
                      backgroundColor: "#4f46e5",
                      color: "white",
                      fontWeight: "600",
                      padding: "0.625rem 1rem",
                      borderRadius: "0.5rem",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 4px rgba(79, 70, 229, 0.1)",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#4338ca";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 6px rgba(79, 70, 229, 0.2)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#4f46e5";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(79, 70, 229, 0.1)";
                    }}
                  >
                    <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Wishlist
                  </Link>
                  
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      fontWeight: "600",
                      padding: "0.625rem 1rem",
                      borderRadius: "0.5rem",
                      border: "none",
                      fontSize: "0.875rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 4px rgba(239, 68, 68, 0.1)",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#dc2626";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 6px rgba(239, 68, 68, 0.2)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#ef4444";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(239, 68, 68, 0.1)";
                    }}
                  >
                    <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete Wishlist
                  </button>
                </div>
              )}
            </div>
            
            {/* Wishlist metadata */}
            <div style={{ 
              display: "flex", 
              flexWrap: "wrap", 
              gap: "1.5rem", 
              marginBottom: "1.5rem" 
            }}>
              {wishlist.category && (
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.5rem",
                  color: "#64748b",
                  fontSize: "0.875rem"
                }}>
                  <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontWeight: "500" }}>Category:</span>
                  <span>{wishlist.category.name}</span>
                </div>
              )}
              
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.5rem",
                color: "#64748b",
                fontSize: "0.875rem"
              }}>
                <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span style={{ fontWeight: "500" }}>Privacy:</span>
                <span>
                  {wishlist.is_public 
                    ? "Public" 
                    : wishlist.privacy === 'shared' 
                      ? "Shared" 
                      : "Private"}
                </span>
              </div>
              
              {wishlist.occasion_date && (
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.5rem",
                  color: "#64748b",
                  fontSize: "0.875rem"
                }}>
                  <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontWeight: "500" }}>Occasion:</span>
                  <span>{new Date(wishlist.occasion_date).toLocaleDateString()}</span>
                </div>
              )}
              
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.5rem",
                color: "#64748b",
                fontSize: "0.875rem"
              }}>
                <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span style={{ fontWeight: "500" }}>Created:</span>
                <span>{new Date(wishlist.created_at).toLocaleDateString()}</span>
              </div>
              
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.5rem",
                color: "#64748b",
                fontSize: "0.875rem"
              }}>
                <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" clipRule="evenodd" />
                </svg>
                <span style={{ fontWeight: "500" }}>Items:</span>
                <span>{wishlist.items ? wishlist.items.length : 0}</span>
              </div>
            </div>
            
            {/* Add item button for owners */}
            {(isOwner) && !isSharedView && (
              <button
                onClick={() => {
                  if (!showAddItemForm) {
                    // If form is hidden, show it to add new item
                    setEditingItemId(null);
                    setNewItem({
                      name: "",
                      description: "",
                      price: "",
                      url: "",
                      image_url: "",
                      priority: 2,
                      quantity: 1
                    });
                  }
                  setShowAddItemForm(!showAddItemForm);
                }}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.5rem",
                  backgroundColor: showAddItemForm && !editingItemId ? "#f3f4f6" : "#4f46e5", 
                  color: showAddItemForm && !editingItemId ? "#4b5563" : "white", 
                  fontWeight: "600", 
                  padding: "0.75rem 1.5rem", 
                  borderRadius: "0.5rem",
                  border: showAddItemForm && !editingItemId ? "1px solid #e5e7eb" : "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: showAddItemForm && !editingItemId ? "none" : "0 4px 6px rgba(79, 70, 229, 0.15), 0 10px 10px rgba(79, 70, 229, 0.05)",
                }}
                onMouseOver={(e) => {
                  if (showAddItemForm && !editingItemId) {
                    e.currentTarget.style.backgroundColor = "#e5e7eb";
                  } else {
                    e.currentTarget.style.backgroundColor = "#4338ca";
                    e.currentTarget.style.boxShadow = "0 6px 10px rgba(79, 70, 229, 0.2), 0 12px 15px rgba(79, 70, 229, 0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseOut={(e) => {
                  if (showAddItemForm && !editingItemId) {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  } else {
                    e.currentTarget.style.backgroundColor = "#4f46e5";
                    e.currentTarget.style.boxShadow = "0 4px 6px rgba(79, 70, 229, 0.15), 0 10px 10px rgba(79, 70, 229, 0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                  {showAddItemForm && !editingItemId ? (
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  )}
                </svg>
                {editingItemId 
                  ? "Continue Editing" 
                  : (showAddItemForm ? "Cancel" : "Add New Item")}
              </button>
            )}
          </div>
          
          {/* Add item form */}
          {showAddItemForm && (
            <div style={{ 
              borderTop: "1px solid #e5e7eb",
              padding: "1.5rem 2rem",
              backgroundColor: "#f9fafb"
            }} id="addItemForm">
              <h3 style={{ 
                fontSize: "1.25rem", 
                fontWeight: "700", 
                color: "#1e293b", 
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <svg style={{ width: "1.25rem", height: "1.25rem", color: "#4f46e5" }} fill="currentColor" viewBox="0 0 20 20">
                  {editingItemId ? (
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  ) : (
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  )}
                </svg>
                {editingItemId ? "Edit Item" : "Add New Item"}
              </h3>
              
              {/* Keep this success message - it's in the context of the form where it belongs */}
              {successMessage && (
                <div style={{ 
                  backgroundColor: "#ecfdf5", 
                  padding: "1rem", 
                  borderRadius: "0.5rem", 
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  color: "#065f46",
                  border: "1px solid #a7f3d0"
                }}>
                  <svg style={{ width: "1.5rem", height: "1.5rem", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {successMessage}
                </div>
              )}
              
              {error && (
                <div style={{ 
                  backgroundColor: "#fee2e2", 
                  color: "#b91c1c", 
                  padding: "0.75rem", 
                  borderRadius: "0.375rem", 
                  marginBottom: "1.5rem",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
              
              {/* URL Extraction Section */}
              {!editingItemId && (
                <div style={{ 
                  marginBottom: "2rem", 
                  padding: "1.5rem", 
                  backgroundColor: "#f8fafc", 
                  borderRadius: "0.5rem",
                  border: "1px solid #e2e8f0"
                }}>
                  <h4 style={{ 
                    fontSize: "1rem", 
                    fontWeight: "600", 
                    color: "#4f46e5", 
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                    Add from URL
                  </h4>
                  
                  <p style={{ 
                    fontSize: "0.875rem", 
                    color: "#64748b", 
                    marginBottom: "1rem" 
                  }}>
                    Paste a product URL to automatically extract details like name, price, and image.
                  </p>
                  
                  {extractError && (
                    <div style={{ 
                      backgroundColor: "#fee2e2", 
                      color: "#b91c1c", 
                      padding: "0.75rem", 
                      borderRadius: "0.375rem", 
                      marginBottom: "1rem",
                      fontSize: "0.875rem" 
                    }}>
                      {extractError}
                    </div>
                  )}
                  
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input 
                      type="url" 
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/product"
                      style={{ 
                        flex: "1",
                        padding: "0.75rem", 
                        borderRadius: "0.375rem", 
                        border: "1px solid #d1d5db",
                        fontSize: "0.875rem" 
                      }}
                    />
                    
                    <button
                      onClick={handleExtractFromUrl}
                      disabled={isExtracting || !urlInput}
                      style={{ 
                        backgroundColor: "#4f46e5", 
                        color: "white", 
                        fontWeight: "600", 
                        padding: "0.75rem 1.5rem", 
                        borderRadius: "0.375rem",
                        border: "none",
                        cursor: isExtracting || !urlInput ? "not-allowed" : "pointer",
                        opacity: isExtracting || !urlInput ? "0.7" : "1",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}
                    >
                      {isExtracting ? (
                        <>
                          <svg className="animate-spin" style={{ width: "1.25rem", height: "1.25rem" }} fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Extracting...
                        </>
                      ) : (
                        <>
                          <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Extract Details
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Remove URL character count indicator */}
                  
                  <div style={{ 
                    marginTop: "1rem", 
                    fontSize: "0.75rem", 
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem" 
                  }}>
                    <svg style={{ width: "0.875rem", height: "0.875rem" }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Supported sites: Amazon, Target, Walmart, and most major retailers
                  </div>
                </div>
              )}
              
              <form onSubmit={handleAddItem}>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "1.5rem", 
                  marginBottom: "1.5rem" 
                }}>
                  <div>
                    <label style={{ 
                      display: "block", 
                      fontWeight: "500", 
                      color: "#4b5563", 
                      marginBottom: "0.5rem" 
                    }}>
                      Item Name <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newItem.name}
                      onChange={handleItemChange}
                      required
                      style={{ 
                        width: "100%", 
                        padding: "0.75rem", 
                        borderRadius: "0.375rem", 
                        border: "1px solid #d1d5db",
                        fontSize: "0.875rem" 
                      }}
                    />
                  </div>
                
                  <div>
                    <label style={{ 
                      display: "block", 
                      fontWeight: "500", 
                      color: "#4b5563", 
                      marginBottom: "0.5rem" 
                    }}>
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={newItem.price}
                      onChange={handleItemChange}
                      min="0"
                      step="0.01"
                      style={{ 
                        width: "100%", 
                        padding: "0.75rem", 
                        borderRadius: "0.375rem", 
                        border: "1px solid #d1d5db",
                        fontSize: "0.875rem" 
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ 
                    display: "block", 
                    fontWeight: "500", 
                    color: "#4b5563", 
                    marginBottom: "0.5rem" 
                  }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={newItem.description}
                    onChange={handleItemChange}
                    rows="3"
                    style={{ 
                      width: "100%", 
                      padding: "0.75rem", 
                      borderRadius: "0.375rem", 
                      border: "1px solid #d1d5db",
                      fontSize: "0.875rem",
                      resize: "vertical" 
                    }}
                  ></textarea>
                </div>
                
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "1.5rem", 
                  marginBottom: "1.5rem" 
                }}>
                  <div>
                    <label style={{ 
                      display: "block", 
                      fontWeight: "500", 
                      color: "#4b5563", 
                      marginBottom: "0.5rem" 
                    }}>
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={newItem.quantity}
                      onChange={handleItemChange}
                      min="1"
                      style={{ 
                        width: "100%", 
                        padding: "0.75rem", 
                        borderRadius: "0.375rem", 
                        border: "1px solid #d1d5db",
                        fontSize: "0.875rem" 
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ 
                      display: "block", 
                      fontWeight: "500", 
                      color: "#4b5563", 
                      marginBottom: "0.5rem" 
                    }}>
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={newItem.priority}
                      onChange={handleItemChange}
                      style={{ 
                        width: "100%", 
                        padding: "0.75rem", 
                        borderRadius: "0.375rem", 
                        border: "1px solid #d1d5db",
                        fontSize: "0.875rem",
                        backgroundColor: "white" 
                      }}
                    >
                      <option value={1}>Low</option>
                      <option value={2}>Medium</option>
                      <option value={3}>High</option>
                      <option value={4}>Must Have</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ marginBottom: "2rem" }}>
                  <label style={{ 
                    display: "block", 
                    fontWeight: "500", 
                    color: "#4b5563", 
                    marginBottom: "0.5rem" 
                  }}>
                    URL
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="url"
                      name="url"
                      value={newItem.url}
                      onChange={handleItemChange}
                      placeholder="https://example.com/product"
                      style={{ 
                        flex: "1",
                        padding: "0.75rem", 
                        borderRadius: "0.375rem", 
                        border: "1px solid #d1d5db",
                        fontSize: "0.875rem" 
                      }}
                    />
                    
                    <button
                      type="button"
                      onClick={extractUrlDetails}
                      disabled={isLoading || !newItem.url}
                      style={{ 
                        backgroundColor: "#4f46e5", 
                        color: "white", 
                        fontWeight: "600", 
                        padding: "0.5rem 1rem", 
                        borderRadius: "0.375rem",
                        border: "none",
                        cursor: isLoading || !newItem.url ? "not-allowed" : "pointer",
                        opacity: isLoading || !newItem.url ? "0.7" : "1",
                        transition: "all 0.3s ease",
                        display: "flex", 
                        alignItems: "center",
                        gap: "0.5rem"
                      }}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin" style={{ width: "1.25rem", height: "1.25rem" }} fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Extracting...</span>
                        </>
                      ) : (
                        <>
                          <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Extract</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Remove URL character count indicator */}
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <label style={{ 
                    display: "block", 
                    fontWeight: "500", 
                    color: "#4b5563", 
                    marginBottom: "0.5rem" 
                  }}>
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={newItem.image_url}
                    onChange={handleItemChange}
                    placeholder="https://example.com/image.jpg"
                    style={{ 
                      width: "100%", 
                      padding: "0.75rem", 
                      borderRadius: "0.375rem", 
                      border: "1px solid #d1d5db",
                      fontSize: "0.875rem" 
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                  {editingItemId && (
                    <button
                      type="button"
                      onClick={cancelEditing}
                      style={{ 
                        backgroundColor: "#f3f4f6", 
                        color: "#4b5563", 
                        fontWeight: "600", 
                        padding: "0.75rem 1.5rem", 
                        borderRadius: "0.5rem",
                        border: "1px solid #e5e7eb",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#e5e7eb";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Cancel
                    </button>
                  )}
                </div>
                
                <button
                  type="submit"
                  style={{ 
                    backgroundColor: "#4f46e5", 
                    color: "white", 
                    fontWeight: "600", 
                    padding: "0.75rem 1.5rem", 
                    borderRadius: "0.5rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 6px rgba(79, 70, 229, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#4338ca";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#4f46e5";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                    {editingItemId ? (
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    ) : (
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    )}
                  </svg>
                  {editingItemId ? "Save Changes" : "Add Item"}
                </button>
              </form>
            </div>
          )}
          
          {/* Items section */}
          <div style={{ padding: "2rem" }}>
            <h2 style={{ 
              fontSize: "1.5rem", 
              fontWeight: "700", 
              color: "#1e293b", 
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <svg style={{ width: "1.5rem", height: "1.5rem", color: "#4f46e5" }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
              Wishlist Items
            </h2>
            
            {/* Items grid */}
            {wishlist.items && wishlist.items.length > 0 ? (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
                gap: "1.5rem" 
              }}>
                {wishlist.items.map(item => (
                  <div 
                    key={item.id} 
                    style={{ 
                      backgroundColor: "white", 
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.75rem", 
                      overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                      transition: "all 0.3s ease",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {item.image_url && (
                      <div style={{ 
                        height: "160px", 
                        overflow: "hidden",
                        backgroundColor: "#f9fafb",
                        borderBottom: "1px solid #e5e7eb"
                      }}>
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          style={{ 
                            width: "100%", 
                            height: "100%", 
                            objectFit: "cover" 
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                          }}
                        />
                      </div>
                    )}
                    
                    <div style={{ 
                      padding: "1.5rem", 
                      flex: "1",
                      display: "flex",
                      flexDirection: "column"
                    }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "flex-start", 
                        marginBottom: "0.75rem" 
                      }}>
                        <h3 style={{ 
                          fontSize: "1.125rem", 
                          fontWeight: "600", 
                          color: "#1f2937", 
                          margin: 0,
                          paddingRight: "0.5rem"
                        }}>
                          {item.name}
                        </h3>
                        
                        <div style={{ 
                          backgroundColor: 
                            item.priority === 4 ? "#fee2e2" : 
                            item.priority === 3 ? "#fef3c7" : 
                            item.priority === 2 ? "#dbeafe" : 
                            "#dcfce7",
                          color: 
                            item.priority === 4 ? "#b91c1c" : 
                            item.priority === 3 ? "#b45309" : 
                            item.priority === 2 ? "#1e40af" : 
                            "#15803d",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          padding: "0.25rem 0.625rem",
                          borderRadius: "9999px",
                          whiteSpace: "nowrap"
                        }}>
                          {item.priority === 4 ? "Must Have" : 
                           item.priority === 3 ? "High" : 
                           item.priority === 2 ? "Medium" : 
                           "Low"}
                        </div>
                      </div>
                      
                      {item.description && (
                        <p style={{ 
                          fontSize: "0.875rem", 
                          color: "#6b7280", 
                          marginBottom: "1rem",
                          display: "-webkit-box",
                          WebkitLineClamp: "3",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: "1.5"
                        }}>
                          {item.description}
                        </p>
                      )}
                      
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        marginBottom: "1rem", 
                        fontSize: "0.875rem", 
                        color: "#64748b",
                        marginTop: "auto"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}>
                          <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd" />
                          </svg>
                          {(() => {
                            // Handle all possible price formats
                            if (item.price === null || item.price === undefined || item.price === "") {
                              return "No price";
                            }
                            // Try to convert to number if it's a string
                            const numPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                            if (isNaN(numPrice)) {
                              return "No price";
                            }
                            // Format as currency
                            return `$${numPrice.toFixed(2)}`;
                          })()}
                        </div>
                        
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}>
                          <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                          </svg>
                          Qty: {item.quantity}
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: "flex", 
                        gap: "0.75rem",
                        marginTop: "auto"
                      }}>
                        {/* Owner controls - Edit and Delete buttons */}
                        {(isOwner) && !isSharedView && (
                          <>
                            {/* Edit button */}
                            <button 
                              onClick={() => startEditingItem(item)}
                              style={{ 
                                flex: "1",
                                backgroundColor: "#4f46e5",
                                color: "white",
                                fontWeight: "600",
                                padding: "0.625rem 0.75rem",
                                borderRadius: "0.5rem",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.375rem",
                                transition: "all 0.3s ease",
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = "#4338ca";
                                e.currentTarget.style.transform = "translateY(-1px)";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "#4f46e5";
                                e.currentTarget.style.transform = "translateY(0)";
                              }}
                            >
                              <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Edit
                            </button>
                            
                            {/* Delete button */}
                            <button 
                              onClick={() => confirmItemDelete(item)}
                              style={{ 
                                flex: "1",
                                backgroundColor: "#ef4444",
                                color: "white",
                                fontWeight: "600",
                                padding: "0.625rem 0.75rem",
                                borderRadius: "0.5rem",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.375rem",
                                transition: "all 0.3s ease",
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = "#dc2626";
                                e.currentTarget.style.transform = "translateY(-1px)";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "#ef4444";
                                e.currentTarget.style.transform = "translateY(0)";
                              }}
                            >
                              <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Delete
                            </button>
                          </>
                        )}
                        
                        {/* View Item button - always show if URL exists */}
                        {item.url && (
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              flex: "1",
                              backgroundColor: "#4f46e5",
                              color: "white",
                              textAlign: "center",
                              fontWeight: "600",
                              padding: "0.625rem 0.75rem",
                              borderRadius: "0.5rem",
                              textDecoration: "none",
                              fontSize: "0.875rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.375rem",
                              transition: "all 0.3s ease",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = "#4338ca";
                              e.currentTarget.style.transform = "translateY(-1px)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = "#4f46e5";
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                          >
                            <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5z" />
                            </svg>
                            View Item
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: "3rem 2rem",
                backgroundColor: "#f9fafb",
                borderRadius: "0.75rem",
                textAlign: "center",
                border: "1px solid #e5e7eb"
              }}>
                <div style={{ 
                  width: "4rem", 
                  height: "4rem", 
                  backgroundColor: "#eef2ff", 
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem"
                }}>
                  <svg style={{ width: "2rem", height: "2rem", color: "#4f46e5" }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "0.75rem" }}>
                  No items in this wishlist yet
                </h3>
                <p style={{ color: "#64748b", marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
                  {isOwner 
                    ? "Add your first item to get started with this wishlist. Use the \"Add New Item\" button above."
                    : "This wishlist is empty. Check back later for updates."}
                </p>
                {/* Duplicate "Add Item" button removed */}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simple sharing section - Only show for wishlists owned by the user */}
      {wishlist && isOwner && !isSharedView && wishlist.privacy === 'shared' && (
        <div style={{ 
          marginTop: "2rem", 
          padding: "1.5rem", 
          backgroundColor: "#f0f9ff", 
          borderRadius: "0.75rem",
          border: "1px solid #bae6fd"
        }}>
          <h3 style={{ 
            fontSize: "1.25rem", 
            fontWeight: "600", 
            marginBottom: "1rem" 
          }}>
            Share this Wishlist
          </h3>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <input
              type="text"
              value={wishlistService.getSharedWishlistUrl(wishlist.slug)}
              readOnly
              style={{ 
                flex: 1,
                padding: "0.75rem",
                borderRadius: "0.5rem 0 0 0.5rem",
                border: "1px solid #e2e8f0",
                fontSize: "0.875rem",
                outline: "none",
                backgroundColor: "white"
              }}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(wishlistService.getSharedWishlistUrl(wishlist.slug));
                // Show a temporary success message
                const button = document.getElementById('copyButton');
                button.textContent = "Copied!";
                setTimeout(() => {
                  button.textContent = "Copy Link";
                }, 2000);
              }}
              id="copyButton"
              style={{ 
                padding: "0.75rem 1rem", 
                backgroundColor: "#0284c7", 
                color: "white",
                borderRadius: "0 0.5rem 0.5rem 0",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}
            >
              Copy Link
            </button>
          </div>
          <p style={{ 
            fontSize: "0.875rem", 
            color: "#64748b", 
            marginTop: "0.75rem" 
          }}>
            Anyone with this link can view your wishlist.
          </p>
        </div>
      )}
    </main>
  );
};

export default WishlistDetail;