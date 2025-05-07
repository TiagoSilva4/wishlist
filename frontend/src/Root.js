import { Outlet } from 'react-router-dom'
import NavBar from './components/NavBar'

export default function Root() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  )
}