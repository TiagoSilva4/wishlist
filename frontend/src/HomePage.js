import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth, useUser } from "./auth/hooks";
import apiService from "./services/api";

const HomePage = () => {
  const auth = useAuth();
  const userFromContext = useUser();
  const isAuthenticated = auth?.status === 200;
  
  // Get user from context first, fall back to localStorage
  const storedUser = localStorage.getItem('user');
  const user = userFromContext || (storedUser ? JSON.parse(storedUser) : null);
  
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to trigger re-renders

  // Add debugging to see the user object
  console.log('HomePage - user from context:', userFromContext);
  console.log('HomePage - user from localStorage:', storedUser ? JSON.parse(storedUser) : null);
  console.log('HomePage - combined user object:', user);

  // Define fetchWishlists outside useEffect to make it available to both effect blocks
  const fetchWishlists = async () => {
    try {
      setLoading(true);
      const data = await apiService.getWishlists();
      console.log('Fetched wishlists:', data);
      setWishlists(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching wishlists:", err);
      setError(err.message?.includes('401') 
        ? "Authentication required. Please log in to view your wishlists."
        : `Failed to load wishlists. Error: ${err.message}`);
      setLoading(false);
    }
  };

  // Listen for user update events to refresh the component
  useEffect(() => {
    const handleUserUpdate = (event) => {
      console.log('HomePage - received user:updated event:', event.detail.user);
      // Force a re-render
      setRefreshKey(prev => prev + 1);
    };
    
    const handleWishlistsUpdated = (event) => {
      console.log('HomePage - received wishlists:updated event', event.detail);
      
      // If we have details about what changed, we could optimize the update
      const detail = event.detail || {};
      
      if (detail.action === 'delete' && detail.wishlistSlug) {
        console.log(`Wishlist ${detail.wishlistSlug} was deleted, filtering from local state`);
        // Immediately remove the deleted wishlist from state to avoid flicker
        setWishlists(prevWishlists => 
          prevWishlists.filter(w => w.slug !== detail.wishlistSlug)
        );
      }
      
      // Force refresh data from server
      if (isAuthenticated && user) {
        console.log('Fetching fresh wishlist data from server');
        fetchWishlists();
      }
    };
    
    document.addEventListener('user:updated', handleUserUpdate);
    document.addEventListener('wishlists:updated', handleWishlistsUpdated);
    
    return () => {
      document.removeEventListener('user:updated', handleUserUpdate);
      document.removeEventListener('wishlists:updated', handleWishlistsUpdated);
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Set document title
    document.title = "WishList";

    if (isAuthenticated && user) {
      fetchWishlists();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, refreshKey]);

  return (
    <div style={{ 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#f9fafb", 
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Main Content */}
      <main className="fade-in" style={{ 
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "1000px",
        margin: "3rem auto",
        padding: "0 2rem",
      }}>
        <div style={{
          backgroundImage: "radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.05) 0%, rgba(79, 70, 229, 0) 90%)",
          width: "100%",
          padding: "3rem 2rem",
          borderRadius: "1.5rem",
          textAlign: "center",
          marginBottom: "3rem",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
          border: "1px solid rgba(79, 70, 229, 0.1)",
        }}>
          <h1 style={{ 
            fontSize: "3rem",
            fontWeight: "800",
            color: "#1e293b",
            marginBottom: "1.5rem",
            letterSpacing: "-0.02em",
            lineHeight: "1.2"
          }}>
            Welcome to <span style={{ 
              position: "relative",
              display: "inline-block",
            }}>
              <span style={{ fontWeight: "800", color: "#1e293b" }}>Wish</span><span style={{ fontWeight: "800", color: "#4f46e5" }}>List</span>
              <span style={{
                position: "absolute",
                height: "6px",
                width: "100%",
                bottom: "2px",
                left: "0",
                backgroundColor: "rgba(79, 70, 229, 0.2)",
                borderRadius: "4px",
                zIndex: "-1"
              }}></span>
            </span>
            {user?.username && <span>, <span style={{ color: "#4f46e5" }}>{user.username}</span></span>}
          </h1>

          <p style={{ 
            color: "#64748b",
            fontSize: "1.25rem",
            marginBottom: "2.5rem",
            lineHeight: "1.75",
            maxWidth: "700px",
            margin: "0 auto 2.5rem"
          }}>
            Create personalized wishlists for any occasion. Share them with friends and family to make gift-giving effortless and memorable.
          </p>

          {!isAuthenticated && (
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <Link
                to="/account/login"
                style={{
                  backgroundColor: "#4f46e5",
                  color: "white",
                  padding: "0.875rem 2rem",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: "600",
                  boxShadow: "0 4px 6px rgba(79, 70, 229, 0.15), 0 10px 20px rgba(79, 70, 229, 0.1)",
                  transition: "all 0.3s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#4338ca";
                  e.currentTarget.style.boxShadow = "0 8px 15px rgba(79, 70, 229, 0.25), 0 15px 30px rgba(79, 70, 229, 0.15)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#4f46e5";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(79, 70, 229, 0.15), 0 10px 20px rgba(79, 70, 229, 0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm6.293 11.293a1 1 0 001.414 1.414l4-4a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 1.414L11.586 10l-2.293 2.293a1 1 0 000 1.414z" clipRule="evenodd" />
                </svg>
                Sign In
              </Link>
              <Link
                to="/account/signup"
                style={{
                  backgroundColor: "white",
                  color: "#4f46e5",
                  padding: "0.875rem 2rem",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: "600",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.3s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.08)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "#c7d2fe";
                  e.currentTarget.style.backgroundColor = "#f5f7ff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.04)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Wishlist Display for authenticated users */}
        {isAuthenticated && (
          <div style={{ width: "100%", marginTop: "2rem" }}>
            {/* Action buttons */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "3rem" }}>
              <Link
                to="/wishlist/create"
                style={{
                  backgroundColor: "#4f46e5",
                  color: "white",
                  padding: "0.875rem 2rem",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  boxShadow: "0 4px 6px rgba(79, 70, 229, 0.15), 0 10px 10px rgba(79, 70, 229, 0.05)",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#4338ca";
                  e.currentTarget.style.boxShadow = "0 6px 10px rgba(79, 70, 229, 0.2), 0 12px 15px rgba(79, 70, 229, 0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#4f46e5";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(79, 70, 229, 0.15), 0 10px 10px rgba(79, 70, 229, 0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Wishlist
              </Link>
              <Link
                to="/wishlist"
                style={{
                  backgroundColor: "white",
                  color: "#4f46e5",
                  padding: "0.875rem 2rem",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  border: "1px solid #e5e7eb",
                  fontSize: "1rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.08)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.backgroundColor = "#f5f7ff";
                  e.currentTarget.style.borderColor = "#c7d2fe";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.04)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                View All Wishlists
              </Link>
            </div>

            {/* Wishlists header */}
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <svg style={{ width: "1.5rem", height: "1.5rem", color: "#4f46e5" }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              Your Wishlists {wishlists.length > 0 && (
                <span style={{ 
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#eef2ff",
                  color: "#4f46e5",
                  borderRadius: "9999px",
                  height: "1.5rem",
                  minWidth: "1.5rem",
                  padding: "0 0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginLeft: "0.5rem"
                }}>
                  {wishlists.length}
                </span>
              )}
            </h2>

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
                  Loading your wishlists...
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

            {/* Empty state */}
            {!loading && !error && wishlists.length === 0 && (
              <div style={{ 
                padding: "3rem 2rem",
                backgroundColor: "white",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.03)",
                border: "1px solid #e5e7eb",
                textAlign: "center"
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
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "0.75rem" }}>No wishlists yet</h3>
                <p style={{ color: "#64748b", marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
                  Get started by creating your first wishlist for any occasion.
                </p>
                <Link
                  to="/wishlist/create"
                  style={{
                    backgroundColor: "#4f46e5",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.5rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    boxShadow: "0 2px 4px rgba(79, 70, 229, 0.1)",
                    transition: "all 0.2s ease",
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
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New Wishlist
                </Link>
              </div>
            )}

            {/* Wishlists grid */}
            {!loading && !error && wishlists.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {wishlists.map(wishlist => (
                  <Link 
                    key={wishlist.id} 
                    to={`/wishlist/${wishlist.slug}`}
                    style={{
                      display: "block",
                      textDecoration: "none",
                      backgroundColor: "white",
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.03)",
                      border: "1px solid #e5e7eb", 
                      transition: "all 0.3s ease",
                      height: "100%",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 10px 15px rgba(0, 0, 0, 0.06)";
                      e.currentTarget.style.borderColor = "#c7d2fe";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.03)";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }}
                  >
                    <div style={{ 
                      height: "120px", 
                      backgroundColor: "#eef2ff", 
                      backgroundImage: "linear-gradient(135deg, #c7d2fe 10%, #818cf8 100%)",
                      padding: "1.5rem",
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(4px)",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: wishlist.privacy === 'shared' ? "#0369a1" : "#4f46e5",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}>
                        {wishlist.privacy === 'shared' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="0.875rem" height="0.875rem" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/>
                          </svg>
                        ) : (
                          <svg style={{ width: "0.875rem", height: "0.875rem" }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {wishlist.privacy === 'shared' ? "Shared" : (wishlist.privacy === 'public' ? "Public" : "Private")}
                      </div>
                      
                      {/* Decorative elements */}
                      <div style={{
                        position: "absolute",
                        bottom: "-20px",
                        right: "-10px",
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      }}></div>
                      <div style={{
                        position: "absolute",
                        bottom: "30px",
                        right: "60px",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                      }}></div>
                    </div>
                    
                    <div style={{ padding: "1.5rem" }}>
                      <div style={{ marginBottom: "1rem" }}>
                        <h3 style={{ 
                          fontSize: "1.125rem", 
                          fontWeight: "600", 
                          color: "#1e293b",
                          marginBottom: "0.5rem",
                          display: "-webkit-box",
                          WebkitLineClamp: "1",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}>
                          {wishlist.title}
                        </h3>
                        <p style={{ 
                          color: "#64748b",
                          fontSize: "0.875rem",
                          display: "-webkit-box",
                          WebkitLineClamp: "2",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          height: "2.625rem"
                        }}>
                          {wishlist.description || "No description provided."}
                        </p>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "0.5rem", 
                          color: "#64748b",
                          fontSize: "0.8125rem"
                        }}>
                          <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                          {wishlist.items_count || 0} item{(wishlist.items_count || 0) !== 1 ? 's' : ''}
                        </span>
                        
                        {wishlist.category && (
                          <span style={{ 
                            display: "inline-block", 
                            backgroundColor: "#f1f5f9", 
                            color: "#475569",
                            padding: "0.25rem 0.75rem", 
                            borderRadius: "9999px", 
                            fontSize: "0.75rem",
                            fontWeight: "500",
                          }}>
                            {wishlist.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;