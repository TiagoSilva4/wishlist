import { useState, useEffect } from 'react'
import FormErrors from '../components/FormErrors'
import { requestPasswordReset, Flows } from '../lib/allauth'
import { Navigate, Link } from 'react-router-dom'

export default function RequestPasswordReset () {
  const [email, setEmail] = useState('')
  const [response, setResponse] = useState({ fetching: false, content: null })

  useEffect(() => {
    // Set document title
    document.title = "Reset Password | WishList";
  }, []);

  function submit () {
    setResponse({ ...response, fetching: true })
    requestPasswordReset(email).then((content) => {
      setResponse((r) => { return { ...r, content } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  if (response.content?.status === 401) {
    return <Navigate to='/account/password/reset/confirm' />
  }
  
  if (response.content?.status === 200) {
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
            <span style={{ fontWeight: "800", color: "#1e293b" }}>Reset</span> <span style={{ fontWeight: "800", color: "#4f46e5" }}>Sent</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
            Check your email for instructions to reset your password
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
              <svg style={{ width: "1.25rem", height: "1.25rem", color: "#10b981" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Reset Email Sent Successfully
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
              We've sent instructions to reset your password
            </p>
          </div>
          
          <div style={{ padding: "1.5rem" }}>
            <div style={{ 
              backgroundColor: "#f0fdf4",
              borderRadius: "0.5rem",
              padding: "1.25rem",
              marginBottom: "1.5rem",
              border: "1px solid #dcfce7"
            }}>
              <p style={{ color: "#166534", fontSize: "0.9375rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg style={{ width: "1.25rem", height: "1.25rem", flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
                <span style={{ fontWeight: "600" }}>What to do next:</span>
              </p>
              <ol style={{ color: "#166534", fontSize: "0.9375rem", paddingLeft: "1.5rem", margin: 0 }}>
                <li style={{ marginBottom: "0.375rem" }}>Check your email inbox for instructions</li>
                <li style={{ marginBottom: "0.375rem" }}>Click the link in the email to continue</li>
                <li>Follow the prompts to create a new password</li>
              </ol>
            </div>
            
            <div style={{ textAlign: "center" }}>
              <Link 
                to='/account/login' 
                style={{ 
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  backgroundColor: "#4f46e5", 
                  color: "white", 
                  fontWeight: "600", 
                  padding: "0.75rem 1.5rem", 
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  boxShadow: "0 2px 4px rgba(79, 70, 229, 0.15)",
                  fontSize: "0.9375rem",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#4338ca";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(79, 70, 229, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#4f46e5";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(79, 70, 229, 0.15)";
                }}
              >
                <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Return to Login
              </Link>
            </div>
          </div>
        </div>
        
        {/* Add this style for animations */}
        <style>{`
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
          <span style={{ fontWeight: "800", color: "#1e293b" }}>Reset</span> <span style={{ fontWeight: "800", color: "#4f46e5" }}>Password</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
          Enter your email and we'll send you instructions to reset your password
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
              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
            </svg>
            Recover Your Account
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            We'll email you a link to reset your password
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
              Remember your password? <Link to='/account/login' style={{ color: "#4f46e5", fontWeight: "600", textDecoration: "none" }}>Sign in instead</Link>
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
              transition: "all 0.2s ease",
              width: "100%"
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
                Sending instructions...
              </>
            ) : (
              <>
                <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                Reset Password
              </>
            )}
          </button>
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