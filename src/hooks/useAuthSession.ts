import { useCallback, useMemo, useState } from 'react'
import { getUserFromToken, login as loginRequest, register as registerRequest } from '../api/auth'
import type { AppUser } from '../types/models'

type AuthSessionState = {
  token: string | null
  currentUser: AppUser | null
}

// Initialise session state from localStorage and validate token
function getInitialSessionState(): AuthSessionState {
  const token = localStorage.getItem('token')

  if (!token) {
    // Clean up any stale user data
    localStorage.removeItem('currentUser')
    return { token: null, currentUser: null }
  }

  const currentUser = getUserFromToken(token)

  if (!currentUser) {
    // Remove invalid or expired session data
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    return { token: null, currentUser: null }
  }

  // Ensure stored user is in sync with token
  localStorage.setItem('currentUser', JSON.stringify(currentUser))
  return { token, currentUser }
}

// Manage authentication session state and actions
export function useAuthSession() {
  const [session, setSession] = useState<AuthSessionState>(getInitialSessionState)

  // Whether the user is currently authenticated
  const isAuthenticated = Boolean(session.token && session.currentUser)

  // Check if a valid authenticated user exists
  const hasAuthenticatedUser = useCallback(() => {
    return Boolean(session.currentUser && session.token)
  }, [session.currentUser, session.token])

  // Check if current user has a specific role
  const hasRole = useCallback(
    (role: AppUser['role']) => {
      return Boolean(session.currentUser && session.currentUser.role === role)
    },
    [session.currentUser],
  )

  // Handle login and persist session data
  const login = useCallback(async (credentials: { username: string; password: string }) => {
    const data = await loginRequest(credentials)

    const resolvedToken = data.access_token || data.token

    if (!resolvedToken) {
      throw new Error('Login succeeded but no access token was returned.')
    }

    const resolvedUser = data.user ?? getUserFromToken(resolvedToken)

    if (!resolvedUser) {
      throw new Error('Login succeeded but no user context was returned.')
    }

    localStorage.setItem('token', resolvedToken)
    localStorage.setItem('currentUser', JSON.stringify(resolvedUser))
    setSession({ token: resolvedToken, currentUser: resolvedUser })

    return resolvedUser
  }, [])

  // Handle registration with basic validation
  const register = useCallback(
    async (payload: { username: string; email: string; password: string; confirmPassword: string }) => {
      const { username, email, password, confirmPassword } = payload

      // Ensure all required fields are filled
      if (!username || !email || !password || !confirmPassword) {
        throw new Error('Please complete all registration fields.')
      }

      // Ensure passwords match
      if (password !== confirmPassword) {
        throw new Error('Password and confirmation do not match.')
      }

      await registerRequest({ username, email, password })
    },
    [],
  )

  // Clear all session data from storage and state
  const clearSessionState = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    setSession({ token: null, currentUser: null })
  }, [])

  // Logout user by clearing session
  const logout = useCallback(() => {
    clearSessionState()
  }, [clearSessionState])

  return useMemo(
    () => ({
      currentUser: session.currentUser,
      isAuthenticated,
      hasAuthenticatedUser,
      hasRole,
      login,
      register,
      logout,
    }),
    [hasAuthenticatedUser, hasRole, isAuthenticated, login, logout, register, session.currentUser],
  )
}
