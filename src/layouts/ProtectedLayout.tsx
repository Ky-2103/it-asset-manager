import { Navigate, Outlet } from 'react-router-dom'

type ProtectedLayoutProps = {
  // Whether the user is authenticated
  isAuthenticated: boolean

  // Whether auth state is still being initialised
  isHydratingSession?: boolean
}

// Guard routes that require authentication
export default function ProtectedLayout({
  isAuthenticated,
  isHydratingSession = false,
}: ProtectedLayoutProps) {
  // Wait until session hydration completes
  if (isHydratingSession) {
    return null
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Render protected content
  return <Outlet />
}
