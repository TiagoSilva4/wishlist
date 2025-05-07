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
        const id = `${flow.id}:${typ}`
        methods.push({
          label: flowLabels[id],
          id,
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

// Icons for different authentication methods
const methodIcons = {
  [Flows.REAUTHENTICATE]: (
    <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  ),
  [`${Flows.MFA_REAUTHENTICATE}:${AuthenticatorType.TOTP}`]: (
    <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  [`${Flows.MFA_REAUTHENTICATE}:${AuthenticatorType.RECOVERY_CODES}`]: (
    <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
    </svg>
  ),
  [`${Flows.MFA_REAUTHENTICATE}:${AuthenticatorType.WEBAUTHN}`]: (
    <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
    </svg>
  )
};

export default function ReauthenticateFlow (props) {
  const location = useLocation()
  const methods = flowsToMethods(location.state.reauth.data.flows)

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
          <span style={{ fontWeight: "800", color: "#1e293b" }}>Confirm</span> <span style={{ fontWeight: "800", color: "#4f46e5" }}>Access</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
          Please verify your identity to continue
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
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Security Verification
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            For your security, this action requires additional verification
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
                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
              </svg>
              Alternative Verification Methods
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Choose another method to verify your identity
            </p>
          </div>
          
          <div style={{ padding: "1.5rem" }}>
            <ul style={{ 
              listStyleType: "none", 
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem" 
            }}>
              {methods.filter(method => method.id !== props.flow).map(method => {
                return (
                  <li key={method.id}>
                    <Link 
                      replace 
                      state={location.state} 
                      to={method.path + location.search}
                      style={{ 
                        display: "flex",
                        alignItems: "center", 
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #e2e8f0",
                        color: "#4f46e5", 
                        textDecoration: "none", 
                        fontWeight: "500",
                        transition: "all 0.2s ease"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {methodIcons[method.id] || (
                        <svg style={{ width: "1rem", height: "1rem" }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                      )}
                      {method.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
      
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