import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import * as allauth from '../lib/allauth'
import FormErrors from '../components/FormErrors'
import Button from '../components/Button'
import { useConfig } from '../auth/hooks'

export default function ChangeEmail () {
  const config = useConfig()
  const [email, setEmail] = useState('')
  const [redirectToVerification, setRedirectToVerification] = useState(false)
  const [emailAddresses, setEmailAddresses] = useState([])
  const [response, setResponse] = useState({ fetching: false, content: { status: 200, data: [] } })

  useEffect(() => {
    // Set document title
    document.title = "Email Settings | WishList";
    
    setResponse((r) => { return { ...r, fetching: true } })
    allauth.getEmailAddresses().then((resp) => {
      if (resp.status === 200) {
        setEmailAddresses(resp.data)
      }
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }, [])

  function requestRedirectToVerification () {
    if (config.data.account.email_verification_by_code_enabled) {
      setRedirectToVerification(true)
    }
  }

  function addEmail () {
    setResponse({ ...response, fetching: true })
    allauth.addEmail(email).then((resp) => {
      setResponse((r) => { return { ...r, content: resp } })
      if (resp.status === 200) {
        setEmailAddresses(resp.data)
        setEmail('')
        requestRedirectToVerification()
      }
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  function requestEmailVerification (email) {
    setResponse({ ...response, fetching: true })
    allauth.requestEmailVerification(email).then((resp) => {
      if (resp.status === 200) {
        requestRedirectToVerification()
      }
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  function deleteEmail (email) {
    setResponse({ ...response, fetching: true })
    allauth.deleteEmail(email).then((resp) => {
      setResponse((r) => { return { ...r, content: resp } })
      if (resp.status === 200) {
        setEmailAddresses(resp.data)
      }
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  function markAsPrimary (email) {
    setResponse({ ...response, fetching: true })
    allauth.markEmailAsPrimary(email).then((resp) => {
      setResponse((r) => { return { ...r, content: resp } })
      if (resp.status === 200) {
        setEmailAddresses(resp.data)
      }
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  if (redirectToVerification) {
    return <Navigate to='/account/verify-email' />
  }

  return (
    <main className="fade-in" style={{ 
      maxWidth: "1000px",
      margin: "3rem auto",
      padding: "0 2rem",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ 
        marginBottom: "3rem" 
      }}>
        <h1 style={{ 
          fontSize: "2.5rem",
          fontWeight: "800",
          color: "#1e293b",
          marginBottom: "1rem",
        }}>
          <span style={{ fontWeight: "800", color: "#1e293b" }}>Email</span> <span style={{ fontWeight: "800", color: "#4f46e5" }}>Settings</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
          Manage your email addresses and verification status
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

      {/* Email Addresses Table */}
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
            Your Email Addresses
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Manage your existing email addresses
          </p>
        </div>

        {response.fetching && emailAddresses.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{
              display: "inline-block",
              width: "3rem",
              height: "3rem",
              border: "3px solid #e5e7eb",
              borderRadius: "50%",
              borderTopColor: "#4f46e5",
              animation: "spin 1s linear infinite",
              marginBottom: "1rem"
            }}></div>
            <p style={{ color: "#64748b", fontSize: "1rem" }}>
              Loading your email addresses...
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Email Address</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "center", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Verified</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "center", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Primary</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "right", fontWeight: "600", color: "#475569", fontSize: "0.875rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emailAddresses.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                      No email addresses found
                    </td>
                  </tr>
                ) : (
                  emailAddresses.map(ea => (
                    <tr key={ea.email} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "1rem 1.5rem", color: "#1e293b", fontWeight: "500" }}>{ea.email}</td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        {ea.verified ? (
                          <span style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            backgroundColor: "#d1fae5", 
                            color: "#047857",
                            borderRadius: "9999px",
                            padding: "0.25rem 0.75rem",
                            fontSize: "0.75rem",
                            fontWeight: "600"
                          }}>
                            <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <span style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            backgroundColor: "#fee2e2", 
                            color: "#b91c1c",
                            borderRadius: "9999px",
                            padding: "0.25rem 0.75rem",
                            fontSize: "0.75rem",
                            fontWeight: "600"
                          }}>
                            <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.25rem" }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Unverified
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <input 
                            onChange={() => markAsPrimary(ea.email)} 
                            type="radio" 
                            checked={ea.primary} 
                            style={{ 
                              width: "1.25rem", 
                              height: "1.25rem", 
                              accentColor: "#4f46e5", 
                              cursor: "pointer" 
                            }} 
                          />
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                          {!ea.verified && (
                            <button 
                              onClick={() => requestEmailVerification(ea.email)} 
                              disabled={response.fetching}
                              style={{ 
                                backgroundColor: "#4f46e5", 
                                color: "white", 
                                fontWeight: "600", 
                                padding: "0.5rem 1rem", 
                                borderRadius: "0.375rem", 
                                border: "none",
                                fontSize: "0.875rem",
                                cursor: response.fetching ? "not-allowed" : "pointer",
                                opacity: response.fetching ? 0.7 : 1,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.375rem",
                                transition: "all 0.2s ease"
                              }}
                              onMouseOver={(e) => {
                                if (!response.fetching) {
                                  e.currentTarget.style.backgroundColor = "#4338ca";
                                  e.currentTarget.style.transform = "translateY(-1px)";
                                }
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "#4f46e5";
                                e.currentTarget.style.transform = "translateY(0)";
                              }}
                            >
                              <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                              </svg>
                              Verify
                            </button>
                          )}
                          {!ea.primary && (
                            <button 
                              onClick={() => deleteEmail(ea.email)} 
                              disabled={response.fetching}
                              style={{ 
                                backgroundColor: "#ef4444", 
                                color: "white", 
                                fontWeight: "600", 
                                padding: "0.5rem 1rem", 
                                borderRadius: "0.375rem", 
                                border: "none",
                                fontSize: "0.875rem",
                                cursor: response.fetching ? "not-allowed" : "pointer",
                                opacity: response.fetching ? 0.7 : 1,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.375rem",
                                transition: "all 0.2s ease"
                              }}
                              onMouseOver={(e) => {
                                if (!response.fetching) {
                                  e.currentTarget.style.backgroundColor = "#dc2626";
                                  e.currentTarget.style.transform = "translateY(-1px)";
                                }
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "#ef4444";
                                e.currentTarget.style.transform = "translateY(0)";
                              }}
                            >
                              <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Email Section */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "0.75rem", 
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.03)",
        border: "1px solid #e5e7eb"
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
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Email Address
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Add a new email address to your account
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
                type="email" 
                required 
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
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <FormErrors param="email" errors={response.content?.errors} />
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.5rem" }}>
              After adding a new email, you'll need to verify it
            </p>
          </div>
          
          <button 
            disabled={response.fetching || !email} 
            onClick={addEmail}
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
                Adding Email...
              </>
            ) : (
              <>
                <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Email
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