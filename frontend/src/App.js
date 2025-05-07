import { AuthContextProvider } from './auth'
import Router from './Router'
import { testApiConnections } from './test-api'

function App () {
  // Test multiple endpoints
  testApiConnections();
  
  return (
    <AuthContextProvider>
      <Router />
    </AuthContextProvider>
  )
}

export default App
