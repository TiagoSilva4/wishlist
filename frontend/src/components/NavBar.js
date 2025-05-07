import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth, useUser } from "../auth/hooks";

const NavBar = () => {
  const auth = useAuth();
  const userFromContext = useUser();
  const [forceUpdate, setForceUpdate] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  
  const isAuthenticated = auth?.status === 200;
  
  // Get user from context first, fall back to localStorage
  const storedUser = localStorage.getItem('user');
  const user = userFromContext || (storedUser ? JSON.parse(storedUser) : null);
  
  // Listen for user update events
  useEffect(() => {
    const handleUserUpdate = (event) => {
      console.log('NavBar - received user:updated event:', event.detail.user);
      // Force re-render by updating state
      setForceUpdate(prev => prev + 1);
    };
    
    document.addEventListener('user:updated', handleUserUpdate);
    
    return () => {
      document.removeEventListener('user:updated', handleUserUpdate);
    };
  }, []);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Log user state for debugging
  console.log('NavBar - rendering with user:', user, 'force update count:', forceUpdate);

  return (
    <header style={{ 
      width: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.98)",
      boxShadow: scrolled ? "0 4px 12px rgba(0, 0, 0, 0.05)" : "none",
      position: "sticky",
      top: 0,
      zIndex: 10,
      borderBottom: scrolled ? "1px solid #E5E7EB" : "none",
      padding: scrolled ? "0.5rem 0" : "1rem 0",
      transition: "all 0.3s ease",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0.75rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* Logo */}
        <Link to="/" style={{ 
          textDecoration: "none", 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem",
          transition: "transform 0.2s ease" 
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        >
          <svg style={{ width: "2rem", height: "2rem", color: "#4f46e5" }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
          <span style={{ 
            fontSize: "1.5rem", 
            fontWeight: "700", 
            color: "#1e293b",
            letterSpacing: "-0.02em",
          }}>
            Wish<span style={{ color: "#4f46e5", fontWeight: "800" }}>List</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: "flex", alignItems: "center" }}>
          {isAuthenticated && (
            <div style={{ 
              display: "flex", 
              marginRight: "2rem", 
              gap: "0.5rem",
            }}>
              <Link 
                to="/wishlist" 
                style={{ 
                  color: "#4b5563", 
                  fontWeight: "600", 
                  textDecoration: "none",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  transition: "all 0.2s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                  e.currentTarget.style.color = "#4f46e5";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#4b5563";
                }}
              >
                <span style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.3rem" 
                }}>
                  <svg style={{ 
                    width: "1.2rem", 
                    height: "1.2rem" 
                  }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  My Wishlists
                </span>
              </Link>
              <Link 
                to="/wishlist/create" 
                style={{ 
                  color: "#4b5563", 
                  fontWeight: "600", 
                  textDecoration: "none",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                  e.currentTarget.style.color = "#4f46e5";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#4b5563";
                }}
              >
                <span style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.3rem" 
                }}>
                  <svg style={{ 
                    width: "1.2rem", 
                    height: "1.2rem" 
                  }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New
                </span>
              </Link>
            </div>
          )}
          
          {/* Auth Section */}
          {!isAuthenticated ? (
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link 
                to="/account/signup"
                style={{
                  backgroundColor: "transparent",
                  color: "#4f46e5",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  border: "1px solid #4f46e5",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#eef2ff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Sign Up
              </Link>
              <Link 
                to="/account/login"
                style={{
                  backgroundColor: "#4f46e5",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#4338ca";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(79, 70, 229, 0.3)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#4f46e5";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(79, 70, 229, 0.2)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Login
              </Link>
            </div>
          ) : (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "1rem",
              backgroundColor: "#f9fafb",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
              border: "1px solid #e5e7eb",
              transition: "all 0.2s ease",
            }}>
              <Link
                to="/account/profile"
                style={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#1e293b", 
                  fontSize: "0.9rem", 
                  fontWeight: "600",
                  textDecoration: "none",
                  transition: "color 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = "#4f46e5";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = "#1e293b";
                }}
              >
                <div style={{ 
                  width: "1.75rem", 
                  height: "1.75rem", 
                  backgroundColor: "#4f46e5",
                  color: "white", 
                  borderRadius: "50%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  textTransform: "uppercase"
                }}>
                  {user?.username?.[0] || "U"}
                </div>
                {user?.username}
              </Link>
              <Link 
                to="/account/logout"
                style={{
                  backgroundColor: "#4f46e5",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  textDecoration: "none",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#4338ca";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(79, 70, 229, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#4f46e5";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(79, 70, 229, 0.2)";
                }}
              >
                <svg style={{ width: "0.8rem", height: "0.8rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm6.293 11.293a1 1 0 001.414 1.414l4-4a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 1.414L11.586 10l-2.293 2.293a1 1 0 000 1.414z" clipRule="evenodd" />
                </svg>
                Logout
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavBar; 