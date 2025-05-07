import { Link, useLocation } from 'react-router-dom'
import { pathForFlow } from '../auth'
import { Flows, AuthenticatorType } from '../lib/allauth'

const flowLabels = {}
flowLabels[Flows.REAUTHENTICATE] = 'Use your password'
flowLabels[`${Flows.MFA_REAUTHENTICATE}:${AuthenticatorType.TOTP}`] = 'Use your authenticator app'
flowLabels[`${Flows.MFA_REAUTHENTICATE}:${AuthenticatorType.RECOVERY_CODES}`] = 'Use a recovery code'
flowLabels[`${Flows.MFA_REAUTHENTICATE}:${AuthenticatorType.WEBAUTHN}`] = 'Use security key'

function flowsToMethods (flows) {
  const methods = []
  flows.forEach(flow => {
    if (flow.id === Flows.MFA_REAUTHENTICATE) {
      flow.types.forEach(typ => {
        methods.push({
          label: flowLabels[`${flow.id}:${typ}`] || flow.id,
          id: flow.id,
          path: pathForFlow(flow, typ)
        })
      })
    } else {
      methods.push({
        label: flowLabels[flow.id] || flow.id,
        id: flow.id,
        path: pathForFlow(flow)
      })
    }
  })
  return methods
}

export default function ReauthenticateFlow (props) {
  const location = useLocation()
  const methods = flowsToMethods(location.state.reauth.data.flows)

  return (
    <main className="fade-in" style={{ 
      maxWidth: "600px",
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
          <span style={{ fontWeight: "800", color: "#1e293b" }}>Confirm</span> <span style={{ fontWeight: "800", color: "#4f46e5" }}>Access</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
          Please authenticate to continue to your account
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
            Authentication Required
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Please reauthenticate to safeguard your account
          </p>
        </div>
        
        <div style={{ padding: "1.5rem" }}>
          {props.children}
        </div>
      </div>

      {methods.length > 1 && (
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
                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
              </svg>
              Alternative Options
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Choose another authentication method
            </p>
          </div>
          
          <div style={{ padding: "1.5rem" }}>
            <div style={{ 
              display: "flex", 
              flexDirection: "column",
              gap: "1rem"
            }}>
              {methods.filter(method => method.id !== props.method).map(method => (
                <Link 
                  key={method.id}
                  replace 
                  state={location.state} 
                  to={method.path + location.search}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    padding: "1.25rem",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    textDecoration: "none",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.borderColor = "#c7d2fe";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.03)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ 
                    backgroundColor: "#eef2ff", 
                    padding: "0.75rem", 
                    borderRadius: "0.5rem", 
                    marginRight: "1rem",
                    color: "#4f46e5"
                  }}>
                    {method.id === Flows.REAUTHENTICATE ? (
                      <svg style={{ width: "1.5rem", height: "1.5rem" }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    ) : method.label.includes('authenticator') ? (
                      <svg style={{ width: "1.5rem", height: "1.5rem" }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a3 3 0 00-3 3v2H7a1 1 0 000 2h1v1a1 1 0 01-1 1 1 1 0 100 2h6a1 1 0 100-2H9.83c.11-.313.17-.65.17-1v-1h1a1 1 0 100-2h-1V7a1 1 0 112 0 1 1 0 102 0 3 3 0 00-3-3z" clipRule="evenodd" />
                      </svg>
                    ) : method.label.includes('recovery') ? (
                      <svg style={{ width: "1.5rem", height: "1.5rem" }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg style={{ width: "1.5rem", height: "1.5rem" }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 style={{ color: "#1e293b", fontWeight: "600", marginBottom: "0.25rem" }}>{method.label}</h3>
                    <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                      {method.id === Flows.REAUTHENTICATE 
                        ? 'Authenticate with your account password' 
                        : method.label.includes('authenticator')
                          ? 'Use a code from your authenticator app'
                          : method.label.includes('recovery')
                            ? 'Use one of your backup recovery codes'
                            : 'Use a physical security key'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Add this style for the fade-in animation */}
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