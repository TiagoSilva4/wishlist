import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiService from "../services/api";

const CreateWishlist = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    privacy: "private",
    category_id: "",
    occasion_date: ""
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
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
    document.title = "Create Wishlist | WishList App";
    
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const data = await apiService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Create a copy of the form data to modify
      const submissionData = { ...formData };
      
      // Convert empty occasion_date to null
      if (submissionData.occasion_date === "") {
        submissionData.occasion_date = null;
      }
      
      // Handle category directly by name
      if (submissionData.category_id) {
        submissionData.category_name = submissionData.category_id;
        submissionData.category_id = null; // Clear the ID since we're using name
      }
      
      // Send data to API
      const response = await apiService.createWishlist(submissionData);
      
      // Dispatch event to update other components
      const event = new CustomEvent('wishlists:updated', { 
        detail: { 
          timestamp: new Date().getTime(),
          action: 'create',
          wishlistSlug: response.slug,
          wishlist: response
        } 
      });
      document.dispatchEvent(event);
      
      // Redirect to the new wishlist page
      navigate(`/wishlist/${response.slug}`);
    } catch (err) {
      console.error("Error creating wishlist:", err);
      setError("Failed to create wishlist. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ 
      maxWidth: "850px", 
      margin: "3rem auto", 
      padding: "2rem",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <Link 
          to="/wishlist" 
          style={{ 
            display: "flex",
            alignItems: "center",
            color: "#64748b",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: "500",
            marginBottom: "1rem",
            transition: "color 0.2s"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#4f46e5";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#64748b";
          }}
        >
          <svg style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to My Wishlists
        </Link>
        
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Create New <span className="font-extrabold text-gray-900">Wish</span><span className="font-extrabold text-indigo-600">List</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.125rem", maxWidth: "600px" }}>
          Fill in the details below to create a new wishlist for your favorite items.
        </p>
      </div>
      
      {error && (
        <div style={{ 
          backgroundColor: "#fef2f2", 
          color: "#b91c1c", 
          padding: "1rem 1.25rem", 
          borderRadius: "0.5rem", 
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          border: "1px solid rgba(185, 28, 28, 0.1)"
        }}>
          <svg style={{ width: "1.25rem", height: "1.25rem", flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      <div style={{
        backgroundColor: "white",
        borderRadius: "1rem",
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.03), 0 10px 20px rgba(0, 0, 0, 0.02)",
        border: "1px solid #e5e7eb",
      }}>
        <div style={{ 
          padding: "1.5rem", 
          borderBottom: "1px solid #f1f5f9",
          backgroundColor: "#f8fafc" 
        }}>
          <h2 style={{ 
            fontSize: "1.25rem", 
            fontWeight: "600", 
            color: "#1e293b", 
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <svg style={{ width: "1.25rem", height: "1.25rem", color: "#4f46e5" }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            Wishlist Information
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Fill out the details below to create your wishlist
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <label style={{ 
              display: "block", 
              fontWeight: "600", 
              marginBottom: "0.5rem", 
              color: "#1e293b",
              fontSize: "0.9375rem"
            }}>
              Wishlist Title <span style={{ color: "#e11d48" }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Birthday Wishlist, Christmas Gifts"
              style={{ 
                width: "100%", 
                padding: "0.75rem 1rem", 
                borderRadius: "0.5rem", 
                border: "1px solid #d1d5db",
                fontSize: "0.9375rem",
                transition: "all 0.2s",
                outline: "none"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#a5b4fc";
                e.target.style.boxShadow = "0 0 0 3px rgba(165, 180, 252, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          
          <div style={{ marginBottom: "1.75rem" }}>
            <label style={{ 
              display: "block", 
              fontWeight: "600", 
              marginBottom: "0.5rem", 
              color: "#1e293b",
              fontSize: "0.9375rem"
            }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe what this wishlist is for..."
              style={{ 
                width: "100%", 
                padding: "0.75rem 1rem", 
                borderRadius: "0.5rem", 
                border: "1px solid #d1d5db",
                fontSize: "0.9375rem",
                resize: "vertical",
                transition: "all 0.2s",
                outline: "none"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#a5b4fc";
                e.target.style.boxShadow = "0 0 0 3px rgba(165, 180, 252, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            ></textarea>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem" }}>
              A brief description helps others understand what your wishlist is about.
            </p>
          </div>
          
          <div style={{ marginBottom: "1.75rem" }}>
            <label style={{ 
              display: "block", 
              fontWeight: "600", 
              marginBottom: "0.5rem", 
              color: "#1e293b",
              fontSize: "0.9375rem"
            }}>
              Category <span style={{ color: "#64748b", fontWeight: "normal", fontSize: "0.875rem" }}>(Optional)</span>
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              style={{ 
                width: "100%", 
                padding: "0.75rem 1rem", 
                borderRadius: "0.5rem", 
                border: "1px solid #d1d5db",
                fontSize: "0.9375rem",
                backgroundColor: "white",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.25rem",
                transition: "all 0.2s",
                outline: "none",
                color: "#1e293b"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#a5b4fc";
                e.target.style.boxShadow = "0 0 0 3px rgba(165, 180, 252, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="">Select a category</option>
              {/* Display the predefined categories */}
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem" }}>
              Organizing your wishlists by category makes them easier to find.
            </p>
          </div>
          
          <div style={{ marginBottom: "1.75rem" }}>
            <label style={{ 
              display: "block", 
              fontWeight: "600", 
              marginBottom: "0.5rem", 
              color: "#1e293b",
              fontSize: "0.9375rem"
            }}>
              Privacy Level <span style={{ color: "#e11d48" }}>*</span>
            </label>
            <div style={{ 
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem"
            }}>
              {[
                {
                  value: "private",
                  label: "Private",
                  description: "Only you can see",
                  icon: (
                    <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )
                },
                {
                  value: "shared",
                  label: "Shared",
                  description: "Only people with the link",
                  icon: (
                    <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  )
                }
              ].map(option => (
                <label
                  key={option.value}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: `1px solid ${formData.privacy === option.value ? '#a5b4fc' : '#d1d5db'}`,
                    backgroundColor: formData.privacy === option.value ? '#eef2ff' : 'white',
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => {
                    if (formData.privacy !== option.value) {
                      e.currentTarget.style.borderColor = "#c7d2fe";
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (formData.privacy !== option.value) {
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.backgroundColor = "white";
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="privacy"
                    value={option.value}
                    checked={formData.privacy === option.value}
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                  <div style={{ 
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem"
                  }}>
                    <div style={{ 
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "0.5rem",
                      backgroundColor: formData.privacy === option.value ? "#4f46e5" : "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: formData.privacy === option.value ? "white" : "#64748b",
                      transition: "all 0.2s"
                    }}>
                      {option.icon}
                    </div>
                    <span style={{ 
                      fontWeight: "600", 
                      color: formData.privacy === option.value ? "#4f46e5" : "#1e293b"
                    }}>
                      {option.label}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: "0.75rem", 
                    color: "#64748b",
                    marginTop: "0.25rem"
                  }}>
                    {option.description}
                  </p>
                </label>
              ))}
            </div>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "1.5rem", 
            marginBottom: "2rem" 
          }}>
            <div>
              <label style={{ 
                display: "block", 
                fontWeight: "600", 
                marginBottom: "0.5rem", 
                color: "#1e293b",
                fontSize: "0.9375rem"
              }}>
                Occasion Date <span style={{ color: "#64748b", fontWeight: "normal", fontSize: "0.875rem" }}>(Optional)</span>
              </label>
              <input
                type="date"
                name="occasion_date"
                value={formData.occasion_date}
                onChange={handleChange}
                style={{ 
                  width: "100%", 
                  padding: "0.75rem 1rem", 
                  borderRadius: "0.5rem", 
                  border: "1px solid #d1d5db",
                  fontSize: "0.9375rem",
                  transition: "all 0.2s",
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#a5b4fc";
                  e.target.style.boxShadow = "0 0 0 3px rgba(165, 180, 252, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem" }}>
                Optional. Set a date for birthdays or special occasions.
              </p>
            </div>
          </div>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            borderTop: "1px solid #f1f5f9",
            paddingTop: "1.5rem"
          }}>
            <button
              type="button"
              onClick={() => navigate("/wishlist")}
              style={{ 
                backgroundColor: "white", 
                color: "#64748b", 
                fontWeight: "600", 
                padding: "0.75rem 1.5rem", 
                borderRadius: "0.5rem", 
                border: "1px solid #e2e8f0",
                fontSize: "0.9375rem",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
                e.currentTarget.style.color = "#475569";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.color = "#64748b";
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              style={{ 
                backgroundColor: "#4f46e5", 
                color: "white", 
                fontWeight: "600", 
                padding: "0.75rem 2rem", 
                borderRadius: "0.5rem", 
                border: "none",
                boxShadow: "0 2px 4px rgba(79, 70, 229, 0.15)",
                fontSize: "0.9375rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "#4338ca";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(79, 70, 229, 0.2)";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#4f46e5";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(79, 70, 229, 0.15)";
              }}
            >
              {loading ? (
                <>
                  <svg style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H4a1 1 0 110-2h5V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Wishlist
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWishlist;