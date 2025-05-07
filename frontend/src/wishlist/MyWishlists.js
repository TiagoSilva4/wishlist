import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import apiService from "../services/api";

const MyWishlists = () => {
  const auth = useAuth();
  const isAuthenticated = auth?.status === 200;
  const user = auth?.data?.user || JSON.parse(localStorage.getItem('user') || 'null');
  const [wishlists, setWishlists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the preset category options - same as in Categories.js
  const categoryOptions = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'graduation', label: 'Graduation' },
    { value: 'christmas', label: 'Christmas' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    // Set document title
    document.title = "My Wishlists | WishList";
    
    const fetchWishlists = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is authenticated
        if (!isAuthenticated || !user) {
          setError("You need to be logged in to view your wishlists. Please sign in first.");
          setLoading(false);
          return;
        }
        
        // Use getMyWishlists instead of getWishlists
        const data = await apiService.getMyWishlists();
        console.log("Fetched wishlists data:", data); // Debug log
        // The API now returns the data directly in the expected format
        setWishlists(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching wishlists:", err);
        if (err.message?.includes('403') || err.message?.includes('401')) {
          setError("Authentication required. Please log in to view your wishlists.");
        } else {
          setError(`Failed to load wishlists. Error: ${err.message}`);
        }
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await apiService.getCategories();
        
        // If there are no predefined categories in the database yet, 
        // we should still show our predefined options in the dropdown
        if (data.length === 0) {
          console.log("No categories found in database, using predefined options");
        }
        
        setCategories(data);
        setCategoriesLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategoriesLoading(false);
      }
    };

    // Only fetch data if the component is mounted
    let isMounted = true;
    if (isMounted) {
      fetchWishlists();
      fetchCategories();
    }
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  // Filter wishlists by selected category
  const filteredWishlists = selectedCategory 
    ? wishlists.filter(wishlist => 
        wishlist.category && wishlist.category.name === selectedCategory
      )
    : wishlists;

  // Wishlist card component to avoid duplication
  const WishlistCard = ({ wishlist }) => (
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
              {categoryOptions.find(opt => opt.value === wishlist.category.name)?.label || wishlist.category.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );

  // Return the LoginPrompt component if user is not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div style={{ 
        maxWidth: "800px", 
        margin: "0 auto", 
        padding: "3rem 1.5rem",
        textAlign: "center"
      }}>
        <h1 style={{ 
          fontSize: "1.875rem", 
          fontWeight: "bold", 
          marginBottom: "1.5rem", 
          color: "#1e293b" 
        }}>
          <span style={{ fontWeight: "800", color: "#1e293b" }}>My</span> <span style={{ fontWeight: "800", color: "#4f46e5" }}>Wish</span><span style={{ fontWeight: "800", color: "#1e293b" }}>Lists</span>
        </h1>
        
        <div style={{
          backgroundColor: "white",
          borderRadius: "0.75rem",
          padding: "2rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.03), 0 10px 20px rgba(0, 0, 0, 0.02)",
          border: "1px solid #e5e7eb",
          marginBottom: "2rem"
        }}>
          <svg style={{ width: "3rem", height: "3rem", margin: "0 auto 1.5rem", color: "#6366f1" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem", color: "#1e293b" }}>
            Sign In Required
          </h2>
          
          <p style={{ color: "#64748b", fontSize: "1rem", marginBottom: "1.5rem" }}>
            You need to be signed in to view and manage your wishlists.
          </p>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            <Link
              to="/account/login"
              style={{
                display: "inline-block",
                backgroundColor: "#4f46e5",
                color: "white",
                fontWeight: "600",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                textDecoration: "none",
                boxShadow: "0 2px 4px rgba(79, 70, 229, 0.15)",
                transition: "all 0.2s ease"
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
              Sign In
            </Link>
            
            <Link
              to="/account/signup"
              style={{
                display: "inline-block",
                backgroundColor: "white",
                color: "#4f46e5",
                fontWeight: "600",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                textDecoration: "none",
                border: "1px solid #e0e7ff",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
                e.currentTarget.style.borderColor = "#c7d2fe";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.borderColor = "#e0e7ff";
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="fade-in" style={{ 
      maxWidth: "1000px",
      margin: "3rem auto",
      padding: "0 2rem",
      fontFamily: "'Inter', sans-serif"
    }}>
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
          My <span><span style={{ fontWeight: "800", color: "#1e293b" }}>Wish</span><span style={{ fontWeight: "800", color: "#4f46e5" }}>Lists</span></span>
        </h1>
        
        <Link
          to="/wishlist/create"
          style={{
            backgroundColor: "#4f46e5",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.925rem",
            fontWeight: "600",
            boxShadow: "0 4px 6px rgba(79, 70, 229, 0.15), 0 10px 10px rgba(79, 70, 229, 0.05)",
            transition: "all 0.3s ease",
            marginLeft: "3rem"
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
      </div>

      {/* Top Action Bar */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "1.5rem" 
      }}>
        {/* Category filter */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div>
            <label 
              htmlFor="category-filter" 
              style={{ 
                fontSize: "0.875rem", 
                fontWeight: "500", 
                color: "#475569",
                marginRight: "0.5rem"
              }}
            >
              Filter by Category:
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ 
                padding: "0.5rem 2rem 0.5rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                color: "#1e293b",
                fontSize: "0.875rem",
                backgroundColor: "white",
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "1.25em 1.25em",
                boxShadow: "none",
                outline: "none"
              }}
            >
              <option value="">All Categories</option>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Wishlist count */}
        <div style={{ 
          fontSize: "0.875rem", 
          color: "#64748b",
          fontWeight: "500" 
        }}>
          {filteredWishlists.length} wishlist{filteredWishlists.length !== 1 ? 's' : ''} 
          {selectedCategory && ' in this category'}
        </div>
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

      {/* My Wishlists Section */}
      {!loading && !error && (
        <>
          {/* Your Wishlists Section */}
          <div style={{ marginBottom: "3rem" }}>
            <h2 style={{ 
              fontSize: "1.5rem", 
              fontWeight: "700", 
              color: "#1e293b", 
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <svg style={{ width: "1.25rem", height: "1.25rem", color: "#4f46e5" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" />
              </svg>
              Your Wishlists
            </h2>
            
            <div style={{ 
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem"
            }}>
              {filteredWishlists.length > 0 ? (
                <>
                  {filteredWishlists.map((wishlist) => (
                    <WishlistCard key={wishlist.id} wishlist={wishlist} />
                  ))}
                  
                  {/* Create new wishlist card */}
                  <Link 
                    to="/wishlist/create" 
                    style={{ 
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "white",
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.03)",
                      border: "1px solid #e5e7eb",
                      transition: "all 0.3s ease",
                      height: "100%",
                      textDecoration: "none",
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
                      backgroundImage: "linear-gradient(135deg, #c7d2fe 10%, #a5b4fc 100%)",
                      padding: "1.5rem",
                      position: "relative",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <div style={{
                        width: "3.5rem",
                        height: "3.5rem",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "9999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <svg style={{ width: "1.75rem", height: "1.75rem", color: "white" }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: "1.5rem", 
                      flex: "1", 
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center" 
                    }}>
                      <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#4f46e5", marginBottom: "0.5rem" }}>
                        Create New Wishlist
                      </h3>
                      <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                        Start a fresh wishlist for your next occasion
                      </p>
                    </div>
                  </Link>
                </>
              ) : (
                <div style={{ 
                  gridColumn: "1 / -1",
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
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default MyWishlists;