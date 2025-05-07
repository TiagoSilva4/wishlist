import { useEffect, createContext, useState } from 'react'
import { getAuth, getConfig, getSessionToken } from '../lib/allauth'

export const AuthContext = createContext(null)

function Loading () {
  return <div>Starting...</div>
}

function LoadingError () {
  return <div>Loading error!</div>
}

export function AuthContextProvider (props) {
  const [auth, setAuth] = useState(undefined)
  const [config, setConfig] = useState(undefined)
  const [user, setUser] = useState(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
  }, [])

  // Function to manually update the user in the context
  const updateUser = (updatedUser) => {
    console.log('AuthContext.updateUser called with:', updatedUser);
    
    if (updatedUser) {
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update the state directly
      setUser(updatedUser);
      
      // Update the auth state
      if (auth?.data) {
        const newAuth = {
          ...auth,
          data: {
            ...auth.data,
            user: updatedUser
          }
        };
        console.log('Updated auth state:', newAuth);
        setAuth(newAuth);
        
        // Dispatch a custom event that components can listen for
        const event = new CustomEvent('user:updated', { 
          detail: { user: updatedUser } 
        });
        document.dispatchEvent(event);
      }
    } else {
      localStorage.removeItem('user');
      setUser(null);
    }
    
    console.log('User context updated');
  };

  useEffect(() => {
    function onAuthChanged (e) {
      setAuth(auth => {
        const newAuth = e.detail
        
        // Update user information when auth changes
        if (newAuth.status === 200 && newAuth.data?.user) {
          setUser(newAuth.data.user)
          localStorage.setItem('user', JSON.stringify(newAuth.data.user))
        } else if (newAuth.status === 401 || newAuth.status === 410) {
          setUser(null)
          localStorage.removeItem('user')
        }

        return newAuth
      })
    }

    document.addEventListener('allauth.auth.change', onAuthChanged)
    
    // Initial auth check
    getAuth()
      .then(data => {
        setAuth(data)
        if (data.status === 200 && data.data?.user) {
          setUser(data.data.user)
          localStorage.setItem('user', JSON.stringify(data.data.user))
        }
      })
      .catch((e) => {
        setAuth(false)
        setUser(null)
        localStorage.removeItem('user')
      })

    getConfig()
      .then(data => {
        setConfig(data)
      })
      .catch((e) => {
        console.error('Error loading config:', e)
      })

    return () => {
      document.removeEventListener('allauth.auth.change', onAuthChanged)
    }
  }, [])

  const loading = (typeof auth === 'undefined') || config?.status !== 200
  
  const value = {
    auth,
    config,
    user,
    updateUser, // Expose the update function
    isAuthenticated: !!(auth?.status === 200 && user),
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {loading
        ? <Loading />
        : (auth === false
            ? <LoadingError />
            : props.children)}
    </AuthContext.Provider>
  )
}
