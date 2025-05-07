import { useState, useEffect } from 'react'
import FormErrors from '../components/FormErrors'
import { signUp } from '../lib/allauth'
import { Link } from 'react-router-dom'
import { useConfig } from '../auth'
import ProviderList from '../socialaccount/ProviderList'

export default function Signup () {
  const [email, setEmail] = useState('')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [password2Errors, setPassword2Errors] = useState([])
  const [response, setResponse] = useState({ fetching: false, content: null })
  const config = useConfig()
  const hasProviders = config.data.socialaccount?.providers?.length > 0

  useEffect(() => {
    // Set document title
    document.title = "Sign Up | WishList";
  }, []);

  function submit () {
    if (password2 !== password1) {
      setPassword2Errors([{ param: 'password2', message: 'Password does not match.' }])
      return
    }
    setPassword2Errors([])
    setResponse({ ...response, fetching: true })
    signUp({ email, password: password1 }).then((content) => {
      setResponse((r) => { return { ...r, content } })
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
          <span style={{ fontWeight: "800", color: "#1e293b" }}>Create</span> <span style={{ fontWeight: "800", color: "#4f46e5" }}>Account</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
          Join WishList to create and share wishlists with friends and family
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
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
            </svg>
            Your Information
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Already have an account? <Link to='/account/login' style={{ color: "#4f46e5", textDecoration: "none", fontWeight: "600" }}>Login here</Link>
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
              Create a strong password that is at least 8 characters long
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
                autoComplete='new-password' 
                value={password1} 
                onChange={(e) => setPassword1(e.target.value)} 
                type='password' 
                required 
                placeholder="Create a strong password"
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
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <FormErrors param='password' errors={response.content?.errors} />
          </div>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ 
              display: "block", 
              fontWeight: "500", 
              color: "#4b5563", 
              marginBottom: "0.5rem" 
            }}>
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input 
                value={password2} 
                onChange={(e) => setPassword2(e.target.value)} 
                type='password' 
                required 
                placeholder="Confirm your password"
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
                  if (e.key === 'Enter' && email && password1 && password2) {
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
            <FormErrors param='password2' errors={password2Errors} />
          </div>
          
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "1rem", 
            marginBottom: "1.5rem" 
          }}>
            <button 
              disabled={response.fetching || !email || !password1 || !password2 || password1 !== password2} 
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
                cursor: (response.fetching || !email || !password1 || !password2 || password1 !== password2) ? "not-allowed" : "pointer",
                opacity: (response.fetching || !email || !password1 || !password2 || password1 !== password2) ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                if (!(response.fetching || !email || !password1 || !password2 || password1 !== password2)) {
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
                  Creating account...
                </>
              ) : (
                <>
                  <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Account
                </>
              )}
            </button>
            
            <Link 
              to="/account/signup/passkey"
              style={{ 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                textAlign: "center",
                backgroundColor: "#f8fafc", 
                color: "#1e293b", 
                border: "1px solid #e2e8f0", 
                padding: "0.75rem 1.5rem", 
                borderRadius: "0.5rem",
                fontWeight: "600",
                textDecoration: "none",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#f1f5f9";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.05)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
              </svg>
              Sign up using a passkey
            </Link>
          </div>
        </div>
      </div>

      {hasProviders && (
        <div style={{ 
          backgroundColor: "white", 
          borderRadius: "0.75rem", 
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.03)",
          border: "1px solid #e5e7eb",
          marginBottom: "2rem",
          padding: "1.5rem" 
        }}>
          <h2 style={{ 
            fontSize: "1.25rem", 
            fontWeight: "700", 
            color: "#1e293b", 
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <svg style={{ width: "1.25rem", height: "1.25rem", color: "#4f46e5" }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
            Or continue with
          </h2>
          <ProviderList callbackURL='/account/provider/callback' />
        </div>
      )}

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