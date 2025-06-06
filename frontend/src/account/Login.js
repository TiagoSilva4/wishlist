import { useState, useEffect } from 'react'
import FormErrors from '../components/FormErrors'
import { login } from '../lib/allauth'
import { Link, useNavigate } from 'react-router-dom'
import { useConfig } from '../auth'

export default function Login () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [response, setResponse] = useState({ fetching: false, content: null })
  const [nonExistentAccount, setNonExistentAccount] = useState(false)
  const config = useConfig()
  const navigate = useNavigate()

  useEffect(() => {
    // Set document title
    document.title = "Login | WishList";
  }, []);

  function submit () {
    setResponse({ ...response, fetching: true })
    setNonExistentAccount(false)
    
    login({ email, password }).then((content) => {
      setResponse((r) => { return { ...r, content } })
      
      // Check for non-existent account error
      if (content?.errors && content.errors.length > 0) {
        const nonExistentError = content.errors.some(error => 
          error.message.toLowerCase().includes("no account with this email") ||
          error.message.toLowerCase().includes("user does not exist") ||
          error.message.toLowerCase().includes("invalid credentials") ||
          error.message.toLowerCase().includes("email and password") 
        )
        
        if (nonExistentError) {
          setNonExistentAccount(true)
        }
      }
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
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
          <span style={{ fontWeight: "800", color: "#1e293b" }}>Wish</span><span style={{ fontWeight: "800", color: "#4f46e5" }}>List</span> <span style={{ fontWeight: "800", color: "#1e293b" }}>Login</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
          No account? <Link to='/account/signup' style={{ color: "#4f46e5", textDecoration: "none", fontWeight: "600", transition: "all 0.2s" }}>Sign up here</Link>
        </p>
      </div>

      {/* Non-existent account message */}
      {nonExistentAccount && (
        <div style={{ 
          backgroundColor: "#eff6ff", // Blue background
          border: "1px solid #dbeafe",
          borderRadius: "0.75rem",
          padding: "1.25rem",
          color: "#1e40af",
          marginBottom: "2rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <svg style={{ width: "1.5rem", height: "1.5rem", flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p style={{ fontWeight: "600", fontSize: "1rem" }}>Account Not Found</p>
              <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                We couldn't find an account with this email address. Would you like to 
                <Link to='/account/signup' style={{ 
                  color: "#4f46e5", 
                  fontWeight: "600", 
                  marginLeft: "0.25rem",
                  textDecoration: "none"
                }}>create a new account</Link>?
              </p>
              <button 
                onClick={() => navigate('/account/signup', { state: { email } })}
                style={{
                  marginTop: "0.75rem",
                  backgroundColor: "#4f46e5",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Sign Up Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form errors - only show if not showing non-existent account message */}
      {!nonExistentAccount && response.content?.errors && response.content.errors.length > 0 && (
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
              <p style={{ fontWeight: "600", fontSize: "1rem" }}>Login Error</p>
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
            Access Your Account
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Enter your credentials to access your WishList account
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
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ 
              display: "block", 
              fontWeight: "500", 
              color: "#4b5563", 
              marginBottom: "0.5rem" 
            }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type='password' 
                required 
                placeholder="Your password"
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
                  if (e.key === 'Enter') {
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
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div style={{ 
              display: "flex", 
              justifyContent: "flex-end", 
              marginTop: "0.5rem" 
            }}>
              <Link to='/account/password/reset' style={{ 
                color: "#4f46e5", 
                textDecoration: "none", 
                fontSize: "0.875rem",
                fontWeight: "500",
                transition: "all 0.2s"
              }}>
                Forgot your password?
              </Link>
            </div>
            <FormErrors param='password' errors={response.content?.errors} />
          </div>
          
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "1rem", 
            marginTop: "1.5rem" 
          }}>
            <button 
              disabled={response.fetching || !email || !password} 
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
                cursor: (response.fetching || !email || !password) ? "not-allowed" : "pointer",
                opacity: (response.fetching || !email || !password) ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                if (!(response.fetching || !email || !password)) {
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
                  Signing in...
                </>
              ) : (
                <>
                  <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
            
            {config.data.account.login_by_code_enabled && (
              <Link 
                to='/account/login/code'
                style={{ 
                  textAlign: "center",
                  backgroundColor: "white", 
                  color: "#4f46e5", 
                  border: "1px solid #4f46e5", 
                  padding: "0.75rem 1.5rem", 
                  borderRadius: "0.5rem",
                  fontWeight: "600",
                  fontSize: "0.9375rem",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s ease"
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
                  <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v4a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" />
                  <path fill-rule="evenodd" d="M2 9.5a1 1 0 011-1h6a1 1 0 011 1V15a1 1 0 01-1 1H3a1 1 0 01-1-1V9.5zm10 0a1 1 0 011-1h6a1 1 0 011 1V15a1 1 0 01-1 1h-6a1 1 0 01-1-1V9.5z" clip-rule="evenodd" />
                </svg>
                Send me a sign-in code
              </Link>
            )}
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