import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { wishlistService } from "../services/wishlistService";
import { useAuth } from "../auth";

const WishlistDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlistData = async () => {
      try {
        setLoading(true);
        // Fetch wishlist details
        const wishlistData = await wishlistService.getWishlist(slug);
        setWishlist(wishlistData);
        
        // Items are included in the wishlist detail response
        setItems(wishlistData.items || []);
        
        setError(null);
      } catch (err) {
        setError("Failed to load wishlist. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistData();
  }, [slug]);

  const handleMarkPurchased = async (itemId) => {
    try {
      await wishlistService.markItemPurchased(itemId);
      // Update the items state to reflect the change
      setItems(items.map(item => 
        item.id === itemId ? { ...item, purchased: true, purchased_by: user } : item
      ));
    } catch (err) {
      alert("Failed to mark item as purchased");
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await wishlistService.deleteItem(itemId);
        // Remove the deleted item from the state
        setItems(items.filter(item => item.id !== itemId));
      } catch (err) {
        alert("Failed to delete item");
        console.error(err);
      }
    }
  };

  const handleDeleteWishlist = async () => {
    if (window.confirm("Are you sure you want to delete this wishlist?")) {
      try {
        await wishlistService.deleteWishlist(slug);
        navigate("/");
      } catch (err) {
        alert("Failed to delete wishlist");
        console.error(err);
      }
    }
  };

  if (loading) return <p>Loading wishlist...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!wishlist) return <p>Wishlist not found</p>;

  const isOwner = user && wishlist.user.id === user.id;
  
  // Separate purchased and unpurchased items
  const purchasedItems = items.filter(item => item.purchased);
  const unpurchasedItems = items.filter(item => !item.purchased);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: "800", color: "#1e293b" }}>Wish</span><span style={{ fontWeight: "800", color: "#4f46e5" }}>List</span>: {wishlist.title}
          </h1>
          <p style={{ color: "#6b7280" }}>{wishlist.description}</p>
          
          {wishlist.category && (
            <span style={{ 
              display: "inline-block", 
              backgroundColor: "#e5e7eb", 
              padding: "0.25rem 0.75rem", 
              borderRadius: "9999px", 
              fontSize: "0.875rem",
              marginTop: "0.5rem"
            }}>
              {wishlist.category.name}
            </span>
          )}
          
          {wishlist.occasion_date && (
            <p style={{ marginTop: "0.5rem", color: "#4b5563" }}>
              Date: {new Date(wishlist.occasion_date).toLocaleDateString()}
            </p>
          )}
        </div>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          {isOwner && (
            <>
              <Link 
                to={`/wishlists/${slug}/edit`} 
                style={{ 
                  padding: "0.5rem 1rem", 
                  backgroundColor: "#3b82f6", 
                  color: "white",
                  borderRadius: "0.375rem",
                  textDecoration: "none",
                  fontWeight: "500"
                }}
              >
                Edit Wishlist
              </Link>
              <button 
                onClick={handleDeleteWishlist}
                style={{ 
                  padding: "0.5rem 1rem", 
                  backgroundColor: "#ef4444", 
                  color: "white",
                  borderRadius: "0.375rem",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                Delete Wishlist
              </button>
            </>
          )}
        </div>
      </div>

      {isOwner && (
        <Link 
          to={`/wishlists/${slug}/items/add`}
          style={{ 
            display: "inline-block",
            marginBottom: "1.5rem",
            padding: "0.5rem 1rem", 
            backgroundColor: "#3b82f6", 
            color: "white",
            borderRadius: "0.375rem",
            textDecoration: "none",
            fontWeight: "500"
          }}
        >
          Add Item
        </Link>
      )}

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Items</h2>
        
        {items.length === 0 ? (
          <p>No items in this wishlist yet.</p>
        ) : (
          <>
            {/* Unpurchased Items */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.75rem" }}>Wishlist Items</h3>
              
              {unpurchasedItems.length === 0 ? (
                <p>All items have been purchased!</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
                  {unpurchasedItems.map(item => (
                    <div 
                      key={item.id} 
                      style={{ 
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        overflow: "hidden"
                      }}
                    >
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          style={{ 
                            width: "100%", 
                            height: "160px", 
                            objectFit: "cover",
                            borderBottom: "1px solid #e5e7eb"
                          }}
                        />
                      )}
                      
                      <div style={{ padding: "1rem" }}>
                        <h4 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{item.name}</h4>
                        {item.description && <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>{item.description}</p>}
                        
                        {item.price && (
                          <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                            ${parseFloat(item.price).toFixed(2)}
                          </p>
                        )}
                        
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between",
                          marginTop: "0.75rem"
                        }}>
                          {item.url ? (
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                color: "#3b82f6", 
                                textDecoration: "none", 
                                fontWeight: "500",
                                fontSize: "0.875rem"
                              }}
                            >
                              View Item
                            </a>
                          ) : (
                            <span></span>
                          )}
                          
                          {!isOwner && (
                            <button
                              onClick={() => handleMarkPurchased(item.id)}
                              style={{ 
                                padding: "0.25rem 0.5rem", 
                                backgroundColor: "#10b981", 
                                color: "white",
                                borderRadius: "0.25rem",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.75rem"
                              }}
                            >
                              Mark Purchased
                            </button>
                          )}
                          
                          {isOwner && (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <Link
                                to={`/wishlists/${slug}/items/${item.id}/edit`}
                                style={{ 
                                  padding: "0.25rem 0.5rem", 
                                  backgroundColor: "#3b82f6", 
                                  color: "white",
                                  borderRadius: "0.25rem",
                                  textDecoration: "none",
                                  fontSize: "0.75rem"
                                }}
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                style={{ 
                                  padding: "0.25rem 0.5rem", 
                                  backgroundColor: "#ef4444", 
                                  color: "white",
                                  borderRadius: "0.25rem",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "0.75rem"
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Purchased Items */}
            {purchasedItems.length > 0 && (
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.75rem" }}>Purchased Items</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem", opacity: "0.7" }}>
                  {purchasedItems.map(item => (
                    <div 
                      key={item.id} 
                      style={{ 
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        overflow: "hidden"
                      }}
                    >
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          style={{ 
                            width: "100%", 
                            height: "160px", 
                            objectFit: "cover",
                            borderBottom: "1px solid #e5e7eb",
                            filter: "grayscale(1)"
                          }}
                        />
                      )}
                      
                      <div style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                          <h4 style={{ fontSize: "1rem", fontWeight: "bold", marginRight: "0.5rem", textDecoration: "line-through" }}>{item.name}</h4>
                          <span style={{ 
                            fontSize: "0.75rem", 
                            padding: "0.125rem 0.5rem", 
                            backgroundColor: "#10b981", 
                            color: "white", 
                            borderRadius: "9999px"
                          }}>
                            Purchased
                          </span>
                        </div>
                        
                        {item.description && <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>{item.description}</p>}
                        
                        {item.price && (
                          <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                            ${parseFloat(item.price).toFixed(2)}
                          </p>
                        )}
                        
                        {item.purchased_by && (
                          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.5rem" }}>
                            Purchased by: {item.purchased_by.username}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sharing section */}
      <div style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.75rem" }}>Share this Wishlist</h3>
        <p>
          Share link: <span style={{ fontWeight: "500" }}>{window.location.origin}/shared-wishlists/{wishlist.slug}</span>
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/shared-wishlists/${wishlist.slug}`)}
            style={{ 
              marginLeft: "0.5rem",
              padding: "0.25rem 0.5rem", 
              backgroundColor: "#3b82f6", 
              color: "white",
              borderRadius: "0.25rem",
              border: "none",
              cursor: "pointer",
              fontSize: "0.75rem"
            }}
          >
            Copy
          </button>
        </p>
        
        <div style={{ marginTop: "1rem" }}>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>Privacy setting:</p>
          <div style={{ fontWeight: "500" }}>
            {wishlist.privacy === 'private' ? '🔒 Private (Only you can see)' : 
             wishlist.privacy === 'shared' ? '🔗 Shared (Only people with the link can see)' : 
             '🌐 Public (Anyone can see)'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistDetail;