// src/HomePage.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./auth";

const HomePage = () => {
  const { user } = useAuth();
  const fakeWishlists = [
    { id: 1, name: "Birthday List", itemCount: 8 },
    { id: 2, name: "Tech Stuff", itemCount: 12 },
    { id: 3, name: "Christmas Ideas", itemCount: 5 },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "white" }}>
      {/* Header */}
      <header style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 2rem", backgroundColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        {/* Logo on the left */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg style={{ width: "2rem", height: "2rem", color: "#3b82f6", marginRight: "0.5rem" }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937" }}>
            Wish<span style={{ color: "#3b82f6" }}>List</span>
          </div>
        </div>

        {/* Links on the right */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link to="/wishlist" style={{ color: "#4b5563", fontWeight: "500", textDecoration: "none" }}>
            My Wishlist
          </Link>
          <Link to="/wishlist/create" style={{ color: "#4b5563", fontWeight: "500", textDecoration: "none" }}>
            Create New
          </Link>
          <Link 
            to="/account/login" 
            style={{ backgroundColor: "#3b82f6", color: "white", fontWeight: "500", padding: "0.5rem 1rem", borderRadius: "0.5rem", textDecoration: "none" }}
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ backgroundColor: "white", borderRadius: "0.5rem", margin: "2rem", padding: "2rem", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
          Hello <span style={{ color: "#3b82f6" }}>{user?.username || "Guest"}</span>
        </h1>
        <p style={{ color: "#4b5563", fontSize: "1.125rem", maxWidth: "42rem", margin: "0 auto" }}>
          Keep track of all the things you desire. Create wishlists for any occasion and share them with friends and family.
        </p>
        
        {!user && (
          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
            <Link 
              to="/account/login" 
              style={{ backgroundColor: "#3b82f6", color: "white", fontWeight: "600", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", textDecoration: "none", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
            >
              Sign In
            </Link>
            <Link 
              to="/account/register" 
              style={{ backgroundColor: "white", border: "2px solid #3b82f6", color: "#3b82f6", fontWeight: "600", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", textDecoration: "none", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
            >
              Sign Up
            </Link>
          </div>
        )}
      </section>

      {/* Wishlist Preview */}
      <section style={{ padding: "0 2rem 1.5rem", flex: "1" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937" }}>Your Wishlists</h2>
          <Link 
            to="/wishlist/create" 
            style={{ display: "flex", alignItems: "center", color: "#3b82f6", fontWeight: "500", textDecoration: "none" }}
          >
            <svg style={{ width: "1.25rem", height: "1.25rem", marginRight: "0.25rem" }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New
          </Link>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {fakeWishlists.map((wishlist) => (
            <div 
              key={wishlist.id} 
              style={{ backgroundColor: "white", borderRadius: "0.5rem", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
            >
              <div style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1f2937", marginBottom: "0.5rem" }}>{wishlist.name}</h3>
                <p style={{ color: "#4b5563" }}>{wishlist.itemCount} items</p>
              </div>
              <div style={{ backgroundColor: "#f9fafb", padding: "0.75rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>Last updated: 2 days ago</span>
                <Link 
                  to={`/wishlist/${wishlist.id}`} 
                  style={{ fontSize: "0.875rem", color: "#3b82f6", fontWeight: "500", textDecoration: "none" }}
                >
                  View All
                </Link>
              </div>
            </div>
          ))}
          
          <Link 
            to="/wishlist/create" 
            style={{ border: "2px dashed #d1d5db", borderRadius: "0.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem", color: "#6b7280", textDecoration: "none" }}
          >
            <svg style={{ width: "3rem", height: "3rem", marginBottom: "0.5rem" }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span style={{ fontWeight: "500" }}>Create New Wishlist</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;