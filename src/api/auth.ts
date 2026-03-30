import { apiRequest } from './http.js'

export type LoginPayload = {
  // Username used for login
  username: string

  // Password for authentication
  password: string
}

export type RegisterPayload = {
  // Username for the new account
  username: string

  // Password for the new account
  password: string

  // Email address for the new account
  email: string
}

export type AuthUser = {
  // Unique user ID
  id: number

  // Username of the user
  username: string

  // Email address of the user
  email: string

  // Role of the user (admin or regular)
  role: 'admin' | 'regular'
}

export type LoginResponse = {
  // Access token returned from API (if present)
  access_token?: string

  // Alternative token field (depending on backend)
  token?: string

  // Token type (e.g. Bearer)
  token_type?: string

  // Authenticated user details (if returned)
  user?: AuthUser
}

type JwtClaims = {
  // Subject (user ID)
  sub?: string

  // Username stored in token
  username?: string

  // Role stored in token
  role?: 'admin' | 'regular'

  // Expiry timestamp (seconds since epoch)
  exp?: number
}

// Decode a base64url string (JWT format) into a normal string
function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  return atob(padded)
}

// Extract and parse the payload section of a JWT
function decodeJwtPayload(token: string): JwtClaims | null {
  const [, payload] = token.split('.')
  if (!payload) return null

  try {
    return JSON.parse(decodeBase64Url(payload)) as JwtClaims
  } catch {
    return null
  }
}

// Convert a JWT into an AuthUser object (if valid)
export function getUserFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token)
  if (!payload?.sub || !payload.username) return null

  const userId = Number(payload.sub)
  if (!Number.isInteger(userId) || userId <= 0) return null

  // Check if token has expired
  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    return null
  }

  return {
    id: userId,
    username: payload.username,
    email: '',
    role: payload.role === 'admin' ? 'admin' : 'regular',
  }
}

// Send login request to API
export async function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>('login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Send registration request to API
export async function register(payload: RegisterPayload) {
  return apiRequest<AuthUser>('register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
