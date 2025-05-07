import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { logout } from '../lib/allauth'

export default function Logout () {
  const [response, setResponse] = useState({ fetching: false, content: null })

  useEffect(() => {
    // Set document title
    document.title = "Logout | WishList";
  }, []);

  function submit () {
    setResponse({ ...response, fetching: true })
    logout().then((content) => {
      setResponse((r) => { return { ...r, content } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }
  
  if (response.content) {
    return <Navigate to='/' />
  }
  
  return (
    <main className="fade-in" style={{ 
      maxWidth: "800px",
      margin: "3rem auto",
      padding: "0 2rem",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ 
        textAlign: "center", 
        marginBottom: "2.5rem" 
      }}>
        <h1 style={{ 
          fontSize: "2.5rem",
          fontWeight: "800",
          color: "#1e293b",
          marginBottom: "1rem",
        }}>
          <span style={{ fontWeight: "800", color: "#1e293b" }}>Sign</span> <span style={{ fontWeight: "800", color: "#4f46e5" }}>Out</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
          We'll miss you! Are you sure you want to sign out?
        </p>
      </div>

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
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm6.293 11.293a1 1 0 001.414 1.414l4-4a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 1.414L12.586 9H5a1 1 0 100 2h7.586l-3.293 3.293z" clipRule="evenodd" />
            </svg>
            Confirm Sign Out
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            You will be signed out from your WishList account
          </p>
        </div>
        
        <div style={{ padding: "1.5rem" }}>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "1rem"
          }}>
            <div style={{ 
              backgroundColor: "#f8fafc",
              borderRadius: "0.5rem",
              padding: "1.25rem",
              marginBottom: "1.5rem"
            }}>
              <p style={{ color: "#475569", fontSize: "0.9375rem", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: "600" }}>Note:</span> Signing out will end your current session, but won't affect your saved wishlists or account settings.
              </p>
              <p style={{ color: "#475569", fontSize: "0.9375rem" }}>
                You can sign in again at any time to access your account.
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "1rem" }}>
              <button 
                disabled={response.fetching} 
                onClick={() => submit()}
                style={{ 
                  backgroundColor: "#4f46e5", 
                  color: "white", 
                  fontWeight: "600", 
                  padding: "0.75rem 1.5rem", 
                  borderRadius: "0.5rem", 
                  border: "none",
                  boxShadow: "0 2px 4px rgba(79, 70, 229, 0.15)",
                  fontSize: "0.9375rem",
                  cursor: response.fetching ? "not-allowed" : "pointer",
                  opacity: response.fetching ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s ease",
                  flexGrow: 1
                }}
                onMouseOver={(e) => {
                  if (!response.fetching) {
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
                    Signing out...
                  </>
                ) : (
                  <>
                    <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm6.293 11.293a1 1 0 001.414 1.414l4-4a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 1.414L12.586 9H5a1 1 0 100 2h7.586l-3.293 3.293z" clipRule="evenodd" />
                    </svg>
                    Sign Out
                  </>
                )}
              </button>
              
              <a 
                href="/"
                style={{ 
                  backgroundColor: "white", 
                  color: "#4b5563", 
                  fontWeight: "600", 
                  padding: "0.75rem 1.5rem", 
                  borderRadius: "0.5rem", 
                  border: "1px solid #d1d5db",
                  fontSize: "0.9375rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  flexGrow: 1
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Return to Home
              </a>
            </div>
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
  )
}