import { useState, useEffect } from 'react'
import FormErrors from '../components/FormErrors'
import {
  Navigate,
  Link
} from 'react-router-dom'
import { verifyEmail } from '../lib/allauth'

export default function VerifyEmailByCode () {
  const [code, setCode] = useState('')
  const [response, setResponse] = useState({ fetching: false, content: null })

  useEffect(() => {
    // Set document title
    document.title = "Verify Email | WishList";
  }, []);

  function submit () {
    setResponse({ ...response, fetching: true })
    verifyEmail(code).then((content) => {
      setResponse((r) => { return { ...r, content } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  if ([200, 401].includes(response.content?.status)) {
    return <Navigate to='/account/email' />
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
          <span style={{ fontWeight: "800", color: "#1e293b" }}>Confirm</span> <span style={{ fontWeight: "800", color: "#4f46e5" }}>Email</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
          Enter the verification code sent to your email address
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
            Email Verification Code
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Please enter the verification code that was sent to your email
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
              Check your inbox for a verification code and enter it below
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ 
              display: "block", 
              fontWeight: "500", 
              color: "#4b5563", 
              marginBottom: "0.5rem" 
            }}>
              Verification Code
            </label>
            <div style={{ position: "relative" }}>
              <input 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                type='text'
                required
                autoFocus
                placeholder="Enter your verification code"
                style={{ 
                  width: "100%", 
                  padding: "0.75rem", 
                  paddingLeft: "2.5rem",
                  borderRadius: "0.375rem", 
                  border: "1px solid #d1d5db",
                  fontSize: "0.9375rem",
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
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
                  if (e.key === 'Enter' && code) {
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
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-6a1 1 0 11-2 0 1 1 0 012 0zm-1-4a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <FormErrors param='key' errors={response.content?.errors} />
          </div>
          
          <button 
            disabled={response.fetching || !code} 
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
              cursor: (response.fetching || !code) ? "not-allowed" : "pointer",
              opacity: (response.fetching || !code) ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.2s ease",
              width: "100%",
              marginBottom: "1.5rem"
            }}
            onMouseOver={(e) => {
              if (!(response.fetching || !code)) {
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
                Verifying...
              </>
            ) : (
              <>
                <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verify Email
              </>
            )}
          </button>
          
          <div style={{ 
            backgroundColor: "#f9fafb",
            borderRadius: "0.5rem",
            padding: "1.25rem",
            marginBottom: "1.5rem",
            border: "1px solid #f3f4f6",
            textAlign: "center"
          }}>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1rem" }}>
              Didn't receive a code?
            </p>
            <Link 
              to="/account/resend-verification" 
              style={{ 
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                backgroundColor: "#f3f4f6", 
                color: "#4b5563", 
                fontWeight: "600", 
                padding: "0.5rem 1rem", 
                borderRadius: "0.375rem",
                textDecoration: "none",
                fontSize: "0.875rem",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#e5e7eb";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
            >
              <svg style={{ width: "0.875rem", height: "0.875rem" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Resend Verification Code
            </Link>
          </div>
        </div>
      </div>
      
      {/* Add this style for animations */}
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