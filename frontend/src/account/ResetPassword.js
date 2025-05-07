import { useState, useEffect } from 'react'
import FormErrors from '../components/FormErrors'
import { getPasswordReset, resetPassword } from '../lib/allauth'
import { Navigate, Link, useLocation, useLoaderData } from 'react-router-dom'

export async function resetPasswordByLinkLoader ({ params }) {
  const key = params.key
  const resp = await getPasswordReset(key)
  return { resetKey: key, resetKeyResponse: resp }
}

function ResetPassword ({ resetKey, resetKeyResponse }) {
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [password2Errors, setPassword2Errors] = useState([])
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [response, setResponse] = useState({ fetching: false, content: null })

  useEffect(() => {
    // Set document title
    document.title = "Set New Password | WishList";
  }, []);
  
  // Check password match whenever either password field changes
  useEffect(() => {
    if (password1 && password2) {
      setPasswordsMatch(password1 === password2)
    } else {
      setPasswordsMatch(true) // Don't show error when fields are empty
    }
  }, [password1, password2]);

  function submit () {
    if (password2 !== password1) {
      setPassword2Errors([{ param: 'password2', message: 'Password does not match.' }])
      return
    }
    setPassword2Errors([])
    setResponse({ ...response, fetching: true })
    resetPassword({ key: resetKey, password: password1 }).then((resp) => {
      setResponse((r) => { return { ...r, content: resp } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }
  
  if ([200, 401].includes(response.content?.status)) {
    return <Navigate to='/account/login' />
  }
  
  let body
  if (resetKeyResponse.status !== 200) {
    body = (
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
            <p style={{ fontWeight: "600", fontSize: "1rem" }}>Reset Code Error</p>
            <FormErrors param='key' errors={resetKeyResponse.errors} />
          </div>
        </div>
      </div>
    )
  } else if (response.content?.errors?.filter(e => e.param === 'key')) {
    body = (
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
            <p style={{ fontWeight: "600", fontSize: "1rem" }}>Reset Error</p>
            <FormErrors param='key' errors={response.content?.errors} />
          </div>
        </div>
      </div>
    )
  } else {
    body = (
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
            New Password
          </label>
          <div style={{ position: "relative" }}>
            <input 
              autoComplete='new-password' 
              value={password1} 
              onChange={(e) => setPassword1(e.target.value)} 
              type='password' 
              required 
              autoFocus
              placeholder="Enter your new password"
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
              placeholder="Confirm your new password"
              style={{ 
                width: "100%", 
                padding: "0.75rem", 
                paddingLeft: "2.5rem",
                borderRadius: "0.375rem", 
                border: `1px solid ${!passwordsMatch && password2 ? "#f87171" : "#d1d5db"}`,
                fontSize: "0.9375rem",
                transition: "all 0.2s",
                outline: "none"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = passwordsMatch ? "#a5b4fc" : "#f87171";
                e.target.style.boxShadow = `0 0 0 3px ${passwordsMatch ? "rgba(165, 180, 252, 0.1)" : "rgba(248, 113, 113, 0.1)"}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = !passwordsMatch && password2 ? "#f87171" : "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && password1 && password2 && passwordsMatch) {
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
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            
            {!passwordsMatch && password2 && (
              <div style={{ 
                position: "absolute", 
                right: "0.75rem", 
                top: "50%", 
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center", 
                color: "#ef4444" 
              }}>
                <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {!passwordsMatch && password2 && (
            <div style={{ 
              color: "#ef4444", 
              fontSize: "0.875rem", 
              marginTop: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem" 
            }}>
              <svg style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Passwords do not match
            </div>
          )}
          <FormErrors param='password2' errors={password2Errors} />
        </div>

        <button 
          disabled={response.fetching || !password1 || !password2 || !passwordsMatch} 
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
            cursor: (response.fetching || !password1 || !password2 || !passwordsMatch) ? "not-allowed" : "pointer",
            opacity: (response.fetching || !password1 || !password2 || !passwordsMatch) ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease",
            width: "100%"
          }}
          onMouseOver={(e) => {
            if (!(response.fetching || !password1 || !password2 || !passwordsMatch)) {
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
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Reset Password
            </>
          )}
        </button>
      </div>
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
          Create a new secure password for your account
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
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Choose New Password
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Create a secure password that you don't use on other websites
          </p>
        </div>
        
        {body}
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

export function ResetPasswordByLink () {
  const { resetKey, resetKeyResponse } = useLoaderData()
  return <ResetPassword resetKey={resetKey} resetKeyResponse={resetKeyResponse} />
}

export function ResetPasswordByCode () {
  const location = useLocation()
  const { resetKey, resetKeyResponse } = location.state || {}
  if (!resetKey) return <Navigate to='/account/password/reset' />
  return <ResetPassword resetKey={resetKey} resetKeyResponse={resetKeyResponse} />
}