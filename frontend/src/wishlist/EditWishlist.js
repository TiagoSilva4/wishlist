import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { wishlistService } from "../services/wishlistService";

const EditWishlist = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    privacy: "private",
    category_id: "",
    occasion_date: ""
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch wishlist details
        const wishlistData = await wishlistService.getWishlist(slug);
        
        // Fetch categories
        const categoriesData = await wishlistService.getCategories();
        
        // Set form data from wishlist
        setFormData({
          title: wishlistData.title || "",
          description: wishlistData.description || "",
          privacy: wishlistData.privacy || "private",
          category_id: wishlistData.category?.id || "",
          occasion_date: wishlistData.occasion_date ? wishlistData.occasion_date.split('T')[0] : ""
        });
        
        setCategories(categoriesData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load wishlist data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

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
      setSubmitting(true);
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
      const updatedWishlist = await wishlistService.updateWishlist(slug, submissionData);
      
      // Dispatch event to update other components
      const event = new CustomEvent('wishlists:updated', { 
        detail: { 
          timestamp: new Date().getTime(),
          action: 'update',
          wishlistSlug: slug,
          wishlist: updatedWishlist
        } 
      });
      document.dispatchEvent(event);
      
      // Redirect to the wishlist page
      navigate(`/wishlist/${slug}`);
    } catch (err) {
      console.error("Error updating wishlist:", err);
      setError("Failed to update wishlist. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "3rem" }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem", color: "#1f2937" }}>
        Edit <span style={{ fontWeight: "800", color: "#1e293b" }}>Wish</span><span style={{ fontWeight: "800", color: "#4f46e5" }}>List</span>
      </h1>
      
      {error && (
        <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1rem" }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: "500", marginBottom: "0.5rem", color: "#4b5563" }}>
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}
          />
        </div>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: "500", marginBottom: "0.5rem", color: "#4b5563" }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}
          ></textarea>
        </div>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: "500", marginBottom: "0.5rem", color: "#4b5563" }}>
            Privacy Level *
          </label>
          <select
            name="privacy"
            value={formData.privacy}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}
          >
            <option value="private">Private - Only you can see</option>
            <option value="shared">Shared - Only people with the link can see</option>
          </select>
        </div>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: "500", marginBottom: "0.5rem", color: "#4b5563" }}>
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
          
          <div style={{ marginTop: "0.75rem" }}>
            <Link
              to="/categories"
              style={{ 
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                color: "#4f46e5",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}
            >
              <svg style={{ width: "0.875rem", height: "0.875rem" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Manage Categories
            </Link>
          </div>
        </div>
        
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "block", fontWeight: "500", marginBottom: "0.5rem", color: "#4b5563" }}>
            Occasion Date <span style={{ color: "#64748b", fontWeight: "normal", fontSize: "0.875rem" }}>(Optional)</span>
          </label>
          <input
            type="date"
            name="occasion_date"
            value={formData.occasion_date}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}
          />
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem" }}>
            Set a date for birthdays or special occasions. Leave empty if not applicable.
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            disabled={submitting}
            style={{ 
              backgroundColor: "#3b82f6", 
              color: "white", 
              fontWeight: "600", 
              padding: "0.75rem 1.5rem", 
              borderRadius: "0.5rem", 
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          
          <Link
            to={`/wishlist/${slug}`}
            style={{ 
              display: "inline-block",
              backgroundColor: "transparent", 
              color: "#6b7280", 
              fontWeight: "600", 
              padding: "0.75rem 1.5rem", 
              borderRadius: "0.5rem", 
              border: "1px solid #d1d5db",
              textDecoration: "none",
              textAlign: "center"
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditWishlist;