import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiService from "../services/api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "other", description: "" });
  const [editCategory, setEditCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Define the preset category options
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
    document.title = "Categories | WishList";
    
    // Fetch categories
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCategories();
      setCategories(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
      setLoading(false);
    }
  };

  const handleNewCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: value
    });
  };

  const handleEditCategoryChange = (e) => {
    const { name, value } = e.target;
    setEditCategory({
      ...editCategory,
      [name]: value
    });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      setError("Category name is required");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const created = await apiService.createCategory(newCategory);
      setCategories([...categories, created]);
      setNewCategory({ name: "other", description: "" });
      setLoading(false);
      setSuccessMessage("Category added successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error creating category:", err);
      setError("Failed to create category. Please try again.");
      setLoading(false);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    
    if (!editCategory.name.trim()) {
      setError("Category name is required");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const updated = await apiService.updateCategory(editCategory.id, editCategory);
      
      // Update the categories list
      setCategories(categories.map(cat => 
        cat.id === updated.id ? updated : cat
      ));
      
      setEditCategory(null);
      setLoading(false);
      setSuccessMessage("Category updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error updating category:", err);
      setError("Failed to update category. Please try again.");
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteCategory(id);
      
      // Remove from the categories list
      setCategories(categories.filter(cat => cat.id !== id));
      
      setLoading(false);
      setSuccessMessage("Category deleted successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category. Please try again.");
      setLoading(false);
    }
  };

  const startEditCategory = (category) => {
    setEditCategory({...category});
    setError(null);
  };

  const cancelEdit = () => {
    setEditCategory(null);
    setError(null);
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
        
        <h1 style={{ 
          fontSize: "2.25rem", 
          fontWeight: "800", 
          color: "#1e293b", 
          marginBottom: "0.75rem" 
        }}>
          Manage <span style={{ color: "#4f46e5" }}>Categories</span>
        </h1>
        
        <p style={{ color: "#64748b", fontSize: "1.125rem", maxWidth: "600px" }}>
          Create and manage categories to organize your wishlists.
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
      
      {successMessage && (
        <div style={{ 
          backgroundColor: "#f0fdf4", 
          color: "#166534", 
          padding: "1rem 1.25rem", 
          borderRadius: "0.5rem", 
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          border: "1px solid rgba(22, 101, 52, 0.1)"
        }}>
          <svg style={{ width: "1.25rem", height: "1.25rem", flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}
      
      <div style={{
        backgroundColor: "white",
        borderRadius: "1rem",
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.03), 0 10px 20px rgba(0, 0, 0, 0.02)",
        border: "1px solid #e5e7eb",
        marginBottom: "2rem"
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
            Add New Category
          </h2>
        </div>
        
        <form onSubmit={handleAddCategory} style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ 
              display: "block", 
              fontWeight: "600", 
              marginBottom: "0.5rem", 
              color: "#1e293b",
              fontSize: "0.9375rem"
            }}>
              Category Type <span style={{ color: "#e11d48" }}>*</span>
            </label>
            <select
              name="name"
              value={newCategory.name}
              onChange={handleNewCategoryChange}
              style={{ 
                width: "100%", 
                padding: "0.75rem 1rem", 
                borderRadius: "0.5rem", 
                border: "1px solid #d1d5db",
                fontSize: "0.9375rem",
                transition: "all 0.2s",
                outline: "none",
                backgroundColor: "white",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1.25rem"
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
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: "1.25rem" }}>
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
              value={newCategory.description}
              onChange={handleNewCategoryChange}
              rows="2"
              placeholder="Description of the category (optional)"
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
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !newCategory.name.trim()}
            style={{ 
              backgroundColor: "#4f46e5", 
              color: "white", 
              fontWeight: "600", 
              padding: "0.75rem 1.5rem", 
              borderRadius: "0.5rem", 
              border: "none",
              boxShadow: "0 2px 4px rgba(79, 70, 229, 0.15)",
              fontSize: "0.9375rem",
              cursor: (loading || !newCategory.name.trim()) ? "not-allowed" : "pointer",
              opacity: (loading || !newCategory.name.trim()) ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              if (!(loading || !newCategory.name.trim())) {
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
                Adding...
              </>
            ) : (
              <>
                <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Add Category
              </>
            )}
          </button>
        </form>
      </div>
      
      <div style={{
        backgroundColor: "white",
        borderRadius: "1rem",
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.03), 0 10px 20px rgba(0, 0, 0, 0.02)",
        border: "1px solid #e5e7eb"
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
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            Existing Categories
          </h2>
        </div>
        
        <div style={{ padding: "1.5rem" }}>
          {loading && categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <svg style={{ width: "2rem", height: "2rem", margin: "0 auto", color: "#4f46e5", animation: "spin 1s linear infinite" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <p style={{ marginTop: "1rem", color: "#6b7280" }}>Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <svg style={{ width: "3rem", height: "3rem", margin: "0 auto", color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <p style={{ marginTop: "1rem", color: "#6b7280", fontSize: "0.9375rem" }}>No categories yet. Create your first category above.</p>
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))"
            }}>
              {categories.map(category => (
                <div key={category.id} style={{ 
                  backgroundColor: "#f8fafc", 
                  borderRadius: "0.75rem", 
                  padding: "1.25rem",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.2s ease",
                  position: "relative"
                }}>
                  {editCategory && editCategory.id === category.id ? (
                    <form onSubmit={handleEditCategory} style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "1rem"
                    }}>
                      <select
                        name="name"
                        value={editCategory.name}
                        onChange={handleEditCategoryChange}
                        style={{ 
                          width: "100%", 
                          padding: "0.625rem 0.875rem", 
                          borderRadius: "0.375rem", 
                          border: "1px solid #d1d5db",
                          fontSize: "0.875rem",
                          backgroundColor: "white",
                          outline: "none",
                          appearance: "none",
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 0.75rem center",
                          backgroundSize: "1rem"
                        }}
                      >
                        {categoryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <textarea
                        name="description"
                        value={editCategory.description}
                        onChange={handleEditCategoryChange}
                        placeholder="Description (optional)"
                        rows="2"
                        style={{ 
                          width: "100%", 
                          padding: "0.625rem 0.875rem", 
                          borderRadius: "0.375rem", 
                          border: "1px solid #d1d5db",
                          fontSize: "0.875rem",
                          backgroundColor: "white",
                          resize: "vertical",
                          outline: "none"
                        }}
                      ></textarea>
                      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                        <button
                          type="submit"
                          style={{ 
                            backgroundColor: "#4f46e5", 
                            color: "white", 
                            fontWeight: "500", 
                            padding: "0.5rem 1rem", 
                            borderRadius: "0.375rem", 
                            border: "none",
                            fontSize: "0.875rem",
                            flex: "1",
                            cursor: "pointer"
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          style={{ 
                            backgroundColor: "#f1f5f9", 
                            color: "#64748b", 
                            fontWeight: "500", 
                            padding: "0.5rem 1rem", 
                            borderRadius: "0.375rem", 
                            border: "none",
                            fontSize: "0.875rem",
                            flex: "1",
                            cursor: "pointer"
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3 style={{ 
                        fontSize: "1.125rem", 
                        fontWeight: "600", 
                        color: "#1e293b", 
                        marginBottom: "0.5rem"
                      }}>
                        {categoryOptions.find(option => option.value === category.name)?.label || category.name}
                      </h3>
                      
                      {category.description && (
                        <p style={{ 
                          fontSize: "0.875rem", 
                          color: "#64748b", 
                          marginBottom: "1rem",
                          lineHeight: "1.5"
                        }}>
                          {category.description}
                        </p>
                      )}
                      
                      <div style={{ display: "flex", gap: "0.75rem", marginTop: "auto" }}>
                        <button
                          onClick={() => startEditCategory(category)}
                          style={{ 
                            backgroundColor: "#f1f5f9", 
                            color: "#475569", 
                            fontWeight: "500", 
                            padding: "0.5rem 0.75rem", 
                            borderRadius: "0.375rem", 
                            border: "none",
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            cursor: "pointer"
                          }}
                        >
                          <svg style={{ width: "0.875rem", height: "0.875rem" }} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          style={{ 
                            backgroundColor: "#fef2f2", 
                            color: "#b91c1c", 
                            fontWeight: "500", 
                            padding: "0.5rem 0.75rem", 
                            borderRadius: "0.375rem", 
                            border: "none",
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            cursor: "pointer"
                          }}
                        >
                          <svg style={{ width: "0.875rem", height: "0.875rem" }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg) }
        }
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Categories; 