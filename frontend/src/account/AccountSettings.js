import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser, useAuth } from '../auth/hooks';
import * as allauth from '../lib/allauth';
import FormErrors from '../components/FormErrors';
import apiService from '../services/apiService';

export default function AccountSettings() {
  const user = useUser();
  const auth = useAuth();
  const [username, setUsername] = useState('');
  const [response, setResponse] = useState({ fetching: false, content: { status: 200, data: [], errors: [] } });
  const [successMessage, setSuccessMessage] = useState('');

  // Add debugging for user and auth objects
  console.log('AccountSettings - user object:', user);
  console.log('AccountSettings - auth object:', auth);

  useEffect(() => {
    // Set document title
    document.title = "Account Settings | WishList";
    
    // Initialize form with current user data
    if (user) {
      console.log('Initializing form with user data:', user);
      console.log('User keys:', Object.keys(user));
      setUsername(user.username || '');
    }
  }, [user]);

  const updateUsername = async () => {
    // Simpler checks for username
    if (!username || username === user?.username) return;
    
    console.log('Starting username update from', user?.username, 'to', username);
    setResponse({ ...response, fetching: true });
    setSuccessMessage('');
    
    try {
      console.log('Sending profile update request with:', { username });
      const resp = await apiService.updateProfile({ username });
      console.log('Profile update response:', resp);
      
      setResponse(prev => ({ ...prev, content: resp, fetching: false }));
      
      if (resp.status === 200) {
        // Success! Update the UI immediately
        setSuccessMessage(`Username successfully updated to ${resp.data.username}!`);
        
        if (resp.data && resp.data.username) {
          console.log('Updating user from', user?.username, 'to', resp.data.username);
          
          // Create an updated user object
          const updatedUser = { 
            ...(user || {}), 
            username: resp.data.username 
          };
          
          // Update all instances of the username in the app through context
          if (auth && typeof auth.updateUser === 'function') {
            // This will propagate to all components using the context
            auth.updateUser(updatedUser);
            console.log('Updated username through auth context');
          }
          
          // Also update localStorage as a backup
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Set username in component state
          setUsername(resp.data.username);
          
          // No need to reload the page - the context change should update all components
        }
      } else {
        console.error('Profile update failed with status:', resp.status);
      }
    } catch (e) {
      console.error('Error updating username:', e);
      
      // Handle different types of errors
      if (e.errors && e.errors.length > 0) {
        // Backend validation errors
        setResponse(prev => ({ 
          ...prev, 
          fetching: false, 
          content: { 
            ...prev.content, 
            errors: e.errors.map(err => ({
              param: err.param || 'general',
              message: err.message || 'Validation error'
            }))
          } 
        }));
      } else if (e.data && e.data.errors) {
        // Django REST Framework format
        setResponse(prev => ({ 
          ...prev, 
          fetching: false, 
          content: { 
            ...prev.content, 
            errors: e.data.errors 
          } 
        }));
      } else {
        // Generic error
        setResponse(prev => ({ 
          ...prev, 
          fetching: false, 
          content: { 
            ...prev.content, 
            errors: [{ 
              param: 'general', 
              message: e.message || 'An unexpected error occurred while updating your profile. Please try again.'
            }] 
          } 
        }));
      }
    }
  };

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
          <span style={{ fontWeight: "800", color: "#1e293b" }}>Account</span> <span style={{ fontWeight: "800", color: "#4f46e5" }}>Settings</span>
        </h1>
      </div>
      
      {successMessage && (
        <div style={{ 
          backgroundColor: "#d1fae5", 
          border: "1px solid #6ee7b7",
          color: "#047857", 
          padding: "1.25rem", 
          borderRadius: "0.75rem", 
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }}>
          <svg style={{ width: "1.5rem", height: "1.5rem", flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 11-16 0 8 8 0 0116 0zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p style={{ fontWeight: "600", fontSize: "1rem" }}>{successMessage}</p>
        </div>
      )}

      {/* Form errors */}
      {response.content?.errors && response.content.errors.length > 0 && (
        <div style={{ 
          backgroundColor: "#fef2f2",
          border: "1px solid #fee2e2",
          borderRadius: "0.75rem",
          padding: "1.25rem",
          color: "#b91c1c",
          marginBottom: "2rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <svg style={{ width: "1.5rem", height: "1.5rem", flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p style={{ fontWeight: "600", fontSize: "1rem" }}>Error</p>
              <FormErrors errors={response.content?.errors} />
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Information Section */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "0.75rem", 
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.03)",
        border: "1px solid #e5e7eb",
        marginBottom: "2rem"
      }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ 
            fontSize: "1.25rem", 
            fontWeight: "700", 
            color: "#1e293b", 
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <svg style={{ width: "1.25rem", height: "1.25rem", color: "#4f46e5" }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            Profile Information
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Update your account profile details
          </p>
        </div>
        
        <div style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ 
              display: "block", 
              fontWeight: "500", 
              color: "#4b5563", 
              marginBottom: "0.5rem" 
            }}>
              Username
            </label>
            <div style={{ position: "relative" }}>
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                type="text" 
                style={{ 
                  width: "100%", 
                  padding: "0.75rem", 
                  paddingLeft: "2.5rem",
                  borderRadius: "0.375rem", 
                  border: "1px solid #d1d5db",
                  fontSize: "0.875rem",
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
              <svg 
                style={{ 
                  position: "absolute", 
                  left: "0.75rem", 
                  top: "50%", 
                  transform: "translateY(-50%)",
                  width: "1.25rem", 
                  height: "1.25rem", 
                  color: "#6b7280" 
                }} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <FormErrors param="username" errors={response.content?.errors} />
          </div>
          
          <button 
            disabled={response.fetching || !username || username === user?.username} 
            onClick={updateUsername}
            style={{ 
              backgroundColor: "#4f46e5", 
              color: "white", 
              fontWeight: "600", 
              padding: "0.75rem 1.5rem", 
              borderRadius: "0.5rem", 
              border: "none",
              boxShadow: "0 2px 4px rgba(79, 70, 229, 0.15)",
              fontSize: "0.9375rem",
              cursor: (response.fetching || !username || username === user?.username) ? "not-allowed" : "pointer",
              opacity: (response.fetching || !username || username === user?.username) ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              if (!(response.fetching || !username || username === user?.username)) {
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
            {response.fetching ? (
              <>
                <svg style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                Update Profile
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Account Management Section */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "0.75rem", 
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.03)",
        border: "1px solid #e5e7eb",
        marginBottom: "2rem"
      }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ 
            fontSize: "1.25rem", 
            fontWeight: "700", 
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <svg style={{ width: "1.25rem", height: "1.25rem", color: "#4f46e5" }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Account Management
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Manage your account security and settings
          </p>
        </div>
        
        <div style={{ padding: "1.5rem" }}>
          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            gap: "1rem"
          }}>
            <Link 
              to="/account/email" 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "1.25rem",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                textDecoration: "none",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
                e.currentTarget.style.borderColor = "#c7d2fe";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.03)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ 
                backgroundColor: "#eef2ff", 
                padding: "0.75rem", 
                borderRadius: "0.5rem", 
                marginRight: "1rem",
                color: "#4f46e5"
              }}>
                <svg style={{ width: "1.5rem", height: "1.5rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div>
                <h3 style={{ color: "#1e293b", fontWeight: "600", marginBottom: "0.25rem" }}>Email Settings</h3>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Change your email address</p>
              </div>
            </Link>
            
            <Link 
              to="/account/password/change"
              style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "1.25rem",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                textDecoration: "none",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
                e.currentTarget.style.borderColor = "#c7d2fe";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.03)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ 
                backgroundColor: "#eef2ff", 
                padding: "0.75rem", 
                borderRadius: "0.5rem", 
                marginRight: "1rem",
                color: "#4f46e5"
              }}>
                <svg style={{ width: "1.5rem", height: "1.5rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 style={{ color: "#1e293b", fontWeight: "600", marginBottom: "0.25rem" }}>Password</h3>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Change your password</p>
              </div>
            </Link>
            
            {auth?.data?.providers?.length > 0 && (
              <Link 
                to="/account/providers" 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  padding: "1.25rem",
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.borderColor = "#c7d2fe";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.03)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ 
                  backgroundColor: "#eef2ff", 
                  padding: "0.75rem", 
                  borderRadius: "0.5rem", 
                  marginRight: "1rem",
                  color: "#4f46e5"
                }}>
                  <svg style={{ width: "1.5rem", height: "1.5rem" }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ color: "#1e293b", fontWeight: "600", marginBottom: "0.25rem" }}>Connected Accounts</h3>
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Manage your social accounts</p>
                </div>
              </Link>
            )}
            
            <Link 
              to="/account/logout" 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "1.25rem",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                textDecoration: "none",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
                e.currentTarget.style.borderColor = "#c7d2fe";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.03)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ 
                backgroundColor: "#fee2e2", 
                padding: "0.75rem", 
                borderRadius: "0.5rem", 
                marginRight: "1rem",
                color: "#dc2626"
              }}>
                <svg style={{ width: "1.5rem", height: "1.5rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 2a1 1 0 00-1 1v1a1 1 0 002 0V6a1 1 0 00-1-1zm-2 5a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2h-4z" clipRule="evenodd" />
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                </svg>
              </div>
              <div>
                <h3 style={{ color: "#1e293b", fontWeight: "600", marginBottom: "0.25rem" }}>Sign Out</h3>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Log out of your account</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Add this style for the spinner animation */}
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
    </main>
  );
} 