import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function VerificationEmailSent () {
  useEffect(() => {
    // Set document title
    document.title = "Verify Email | WishList";
  }, []);

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
          <span style={{ fontWeight: "800", color: "#1e293b" }}>Verify</span> <span style={{ fontWeight: "800", color: "#4f46e5" }}>Email</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.125rem" }}>
          We've sent a verification email to your inbox
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
            Verification Email Sent
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Please check your inbox and follow the instructions to verify your email address
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
              <span style={{ fontWeight: "600" }}>Next steps:</span>
            </p>
            <ol style={{ color: "#166534", fontSize: "0.9375rem", paddingLeft: "1.5rem", margin: 0 }}>
              <li style={{ marginBottom: "0.375rem" }}>Check your email inbox (and spam folder if needed)</li>
              <li style={{ marginBottom: "0.375rem" }}>Click the verification link in the email</li>
              <li>Once verified, you'll have full access to your account</li>
            </ol>
          </div>
          
          <div style={{ 
            backgroundColor: "#f8fafc",
            borderRadius: "0.5rem",
            padding: "1.25rem",
            marginBottom: "1.5rem",
            border: "1px solid #e2e8f0"
          }}>
            <p style={{ color: "#475569", fontSize: "0.9375rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <svg style={{ 
                width: "1.25rem", 
                height: "1.25rem", 
                color: "#4f46e5",
                display: "inline-block",
                marginRight: "0.5rem",
                flexShrink: 0,
                marginTop: "0.125rem"
              }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>
                Didn't receive the email? Check your spam folder or <Link to="/account/resend-verification" style={{ color: "#4f46e5", fontWeight: "600", textDecoration: "none" }}>request a new verification email</Link>
              </span>
            </p>
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