import { useState, useEffect } from 'react'
import FormErrors from '../components/FormErrors'
import { requestLoginCode } from '../lib/allauth'
import { Navigate, Link } from 'react-router-dom'

export default function RequestLoginCode () {
  const [email, setEmail] = useState('')
  const [response, setResponse] = useState({ fetching: false, content: null })

  useEffect(() => {
    // Set document title
    document.title = "Login with Code | WishList";
  }, []);

  function submit () {
    setResponse({ ...response, fetching: true })
    requestLoginCode(email).then((content) => {
      setResponse((r) => { return { ...r, content } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  if (response.content?.status === 401) {
    return <Navigate to='/account/login/code/confirm' />
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
          <span style={{ fontWeight: "800", color: "#1e293b" }}>Login with</span> <span style={{ fontWeight: "800", color: "#4f46e5" }}>Code</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
          We'll send you a secure code by email for a password-free login
        </p>
      </div>

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
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Enter Your Email
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            We'll send a secure login code to your email address
          </p>
        </div>
        
        <div style={{ padding: "1.5rem" }}>
          <div style={{ 
            backgroundColor: "#f8fafc",
            borderRadius: "0.5rem",
            padding: "1.25rem",
            marginBottom: "1.5rem",
            border: "1px solid #e2e8f0"
          }}>
            <p style={{ color: "#475569", fontSize: "0.9375rem" }}>
              <svg style={{ 
                width: "1.25rem", 
                height: "1.25rem", 
                color: "#4f46e5",
                display: "inline-block",
                marginRight: "0.5rem",
                verticalAlign: "text-bottom"
              }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              After receiving the code, you'll be prompted to enter it on the next screen.
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ 
              display: "block", 
              fontWeight: "500", 
              color: "#4b5563", 
              marginBottom: "0.5rem" 
            }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                type='email' 
                required 
                autoFocus
                placeholder="you@example.com"
                style={{ 
                  width: "100%", 
                  padding: "0.75rem", 
                  paddingLeft: "2.5rem",
                  borderRadius: "0.375rem", 
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && email) {
                    submit();
                  }
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
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <FormErrors param='email' errors={response.content?.errors} />
          </div>
          
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "1rem"
          }}>
            <button 
              disabled={response.fetching || !email} 
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
                cursor: (response.fetching || !email) ? "not-allowed" : "pointer",
                opacity: (response.fetching || !email) ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                if (!(response.fetching || !email)) {
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
                  Sending code...
                </>
              ) : (
                <>
                  <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  Send Login Code
                </>
              )}
            </button>
            
            <Link 
              to='/account/login' 
              style={{ 
                textAlign: "center",
                color: "#4b5563", 
                fontWeight: "500",
                padding: "0.75rem 0",
                fontSize: "0.9375rem",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = "#1e293b";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = "#4b5563";
              }}
            >
              <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Login
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
  )
}