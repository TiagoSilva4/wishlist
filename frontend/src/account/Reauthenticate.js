import { useState, useEffect } from 'react'
import FormErrors from '../components/FormErrors'
import { reauthenticate, Flows } from '../lib/allauth'
import ReauthenticateFlow from './ReauthenticateFlow'

export default function Reauthenticate () {
  const [password, setPassword] = useState('')
  const [response, setResponse] = useState({ fetching: false, content: null })
  
  useEffect(() => {
    // Set document title
    document.title = "Confirm Access | WishList";
  }, []);

  function submit () {
    setResponse({ ...response, fetching: true })
    reauthenticate({ password }).then((content) => {
      setResponse((r) => { return { ...r, content } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }
  
  return (
    <ReauthenticateFlow flow={Flows.REAUTHENTICATE}>
      <div style={{ 
        backgroundColor: "#f8fafc",
        borderRadius: "0.5rem",
        padding: "1.25rem",
        marginBottom: "1.5rem",
        border: "1px solid #e2e8f0"
      }}>
        <p style={{ color: "#475569", fontSize: "0.9375rem" }}>
          To protect your account, please confirm your password before continuing.
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
              <p style={{ fontWeight: "600", fontSize: "1rem" }}>Authentication Error</p>
              <FormErrors errors={response.content?.errors} />
            </div>
          </div>
        </div>
      )}

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
            autoFocus
            placeholder="Enter your password"
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
        <FormErrors param='password' errors={response.content?.errors} />
      </div>
      
      <button 
        disabled={response.fetching || !password} 
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
          cursor: (response.fetching || !password) ? "not-allowed" : "pointer",
          opacity: (response.fetching || !password) ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          transition: "all 0.2s ease",
          width: "100%"
        }}
        onMouseOver={(e) => {
          if (!(response.fetching || !password)) {
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
            Confirming...
          </>
        ) : (
          <>
            <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Confirm Access
          </>
        )}
      </button>

      {/* Add this style for the spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg) }
        }
      `}</style>
    </ReauthenticateFlow>
  )
}