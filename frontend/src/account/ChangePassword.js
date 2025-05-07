import { useState, useEffect } from 'react'
import FormErrors from '../components/FormErrors'
import { changePassword } from '../lib/allauth'
import { Navigate } from 'react-router-dom'
import { useUser } from '../auth'

export default function ChangePassword () {
  const hasCurrentPassword = useUser().has_usable_password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [newPassword2Errors, setNewPassword2Errors] = useState([])
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [response, setResponse] = useState({ fetching: false, content: null })

  useEffect(() => {
    // Set document title
    document.title = "Password Settings | WishList";
  }, []);

  // Check password match whenever either password field changes
  useEffect(() => {
    if (newPassword && newPassword2) {
      setPasswordsMatch(newPassword === newPassword2)
    } else {
      setPasswordsMatch(true) // Don't show error when fields are empty
    }
  }, [newPassword, newPassword2]);

  function submit () {
    if (newPassword !== newPassword2) {
      setNewPassword2Errors([{ param: 'new_password2', message: 'Password does not match.' }])
      return
    }
    setNewPassword2Errors([])
    setResponse({ ...response, fetching: true })
    changePassword({ current_password: currentPassword, new_password: newPassword }).then((resp) => {
      setResponse((r) => { return { ...r, content: resp } })
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }
  
  if (response.content?.status === 200) {
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
        marginBottom: "3rem" 
      }}>
        <h1 style={{ 
          fontSize: "2.5rem",
          fontWeight: "800",
          color: "#1e293b",
          marginBottom: "1rem",
        }}>
          <span style={{ fontWeight: "800", color: "#1e293b" }}>Password</span> <span style={{ fontWeight: "800", color: "#4f46e5" }}>Settings</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
          {hasCurrentPassword ? 'Update your account password to keep your account secure' : 'Create a strong password to secure your account'}
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
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            {hasCurrentPassword ? 'Change Password' : 'Set Password'}
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            {hasCurrentPassword ? 'Enter your current password, followed by your new password.' : 'You currently have no password set. Enter your (new) password.'}
          </p>
        </div>
        
        <div style={{ padding: "1.5rem" }}>
          {hasCurrentPassword && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ 
                display: "block", 
                fontWeight: "500", 
                color: "#4b5563", 
                marginBottom: "0.5rem" 
              }}>
                Current Password
              </label>
              <div style={{ position: "relative" }}>
                <input 
                  autoComplete='password' 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  type='password' 
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
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <FormErrors param='current_password' errors={response.content?.errors} />
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.5rem" }}>
                Enter your current password for verification
              </p>
            </div>
          )}
          
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
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                type='password' 
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
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <FormErrors param='new_password' errors={response.content?.errors} />
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.5rem" }}>
              Use at least 8 characters with a mix of letters, numbers & symbols
            </p>
          </div>
          
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ 
              display: "block", 
              fontWeight: "500", 
              color: "#4b5563", 
              marginBottom: "0.5rem" 
            }}>
              Confirm New Password
            </label>
            <div style={{ position: "relative" }}>
              <input 
                value={newPassword2} 
                onChange={(e) => setNewPassword2(e.target.value)} 
                type='password' 
                required 
                style={{ 
                  width: "100%", 
                  padding: "0.75rem", 
                  paddingLeft: "2.5rem",
                  borderRadius: "0.375rem", 
                  border: `1px solid ${!passwordsMatch && newPassword2 ? "#f87171" : "#d1d5db"}`,
                  fontSize: "0.875rem",
                  transition: "all 0.2s",
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = passwordsMatch ? "#a5b4fc" : "#f87171";
                  e.target.style.boxShadow = `0 0 0 3px ${passwordsMatch ? "rgba(165, 180, 252, 0.1)" : "rgba(248, 113, 113, 0.1)"}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = !passwordsMatch && newPassword2 ? "#f87171" : "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (currentPassword || !hasCurrentPassword) && newPassword && newPassword2 && passwordsMatch) {
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
              
              {!passwordsMatch && newPassword2 && (
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
            {!passwordsMatch && newPassword2 && (
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
            <FormErrors param='new_password2' errors={newPassword2Errors} />
          </div>
          
          <button 
            disabled={
              response.fetching || 
              (hasCurrentPassword && !currentPassword) || 
              !newPassword || 
              !newPassword2 || 
              !passwordsMatch
            } 
            onClick={() => submit()}
            style={{ 
              backgroundColor: "#4f46e5", 
              color: "white", 
              fontWeight: "600", 
              padding: "0.75rem 1.5rem", 
              borderRadius: "0.5rem", 
              border: "none",
              boxShadow: "0 2px 4px rgba(79, 70, 229, 0.15)",
              fontSize: "0.875rem",
              cursor: (
                response.fetching || 
                (hasCurrentPassword && !currentPassword) || 
                !newPassword || 
                !newPassword2 || 
                !passwordsMatch
              ) ? "not-allowed" : "pointer",
              opacity: (
                response.fetching || 
                (hasCurrentPassword && !currentPassword) || 
                !newPassword || 
                !newPassword2 || 
                !passwordsMatch
              ) ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.2s ease",
              width: "100%"
            }}
            onMouseOver={(e) => {
              if (!(
                response.fetching || 
                (hasCurrentPassword && !currentPassword) || 
                !newPassword || 
                !newPassword2 || 
                !passwordsMatch
              )) {
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
                {hasCurrentPassword ? 'Update Password' : 'Set Password'}
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