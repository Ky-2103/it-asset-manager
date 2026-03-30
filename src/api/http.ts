function trimLeadingSlash(value: string) {
  // Remove leading slash from path if present
  return value.startsWith('/') ? value.slice(1) : value
}

function resolveApiBaseUrl() {
  // Get API base URL from environment variables (fallback to empty string)
  return import.meta.env?.VITE_API_BASE_URL ?? ''
}

// Resolved base URL used for all API requests
export const API_BASE_URL = resolveApiBaseUrl()

type ApiErrorDetail = {
  // Location of the error (e.g. field path)
  loc?: Array<string | number>

  // Error message
  msg?: string
}

type ApiErrorBody = {
  // Detailed error (string or structured validation errors)
  detail?: string | ApiErrorDetail[]

  // Generic message field
  message?: string

  // Alternative error field
  error?: string
}

// Format structured API error details into a readable string
function formatApiDetail(detail: string | ApiErrorDetail[]): string {
  if (typeof detail === 'string') return detail

  const messages = detail
    .map((item) => {
      if (!item?.msg) return null

      const fieldPath = item.loc?.slice(1).join('.')
      return fieldPath ? `${fieldPath}: ${item.msg}` : item.msg
    })
    .filter((message): message is string => Boolean(message))

  return messages.join(' | ')
}

// Extract a meaningful error message from API response body
function getApiErrorMessage(rawBody: string, fallbackMessage: string): string {
  try {
    const errorData = JSON.parse(rawBody) as ApiErrorBody
    const detailMessage = errorData.detail ? formatApiDetail(errorData.detail) : ''
    return detailMessage || errorData.message || errorData.error || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

// Generic API request wrapper
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  // Get stored auth token
  const token = localStorage.getItem('token')

  // Initialize headers from request config
  const headers = new Headers(init?.headers)

  // Set JSON content type if body exists and header not already set
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }

  // Attach Authorization header if token exists
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Perform the API request
  const response = await fetch(`${API_BASE_URL}/${trimLeadingSlash(path)}`, {
    ...init,
    headers,
    credentials: 'include',
  })

  // Handle unauthorized responses
  if (response.status === 401) {
    // Special case for login failures
    if (trimLeadingSlash(path) === 'login') {
      throw new Error('Invalid username or password')
    }
  
    // Clear stored auth data and throw error
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    throw new Error('UNAUTHORIZED')
  }

  // Handle non-success responses
  if (!response.ok) {
    // Fallback message if no useful response body
    const fallbackMessage = `Request failed with status ${response.status}`
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
    const rawBody = await response.text()

    // Parse JSON error responses (e.g. validation errors)
    if (rawBody.trim() && contentType.includes('json')) {
      throw new Error(getApiErrorMessage(rawBody, fallbackMessage))
    }

    // Return plain text errors directly
    if (rawBody.trim() && !contentType.includes('json')) {
      throw new Error(rawBody)
    }

    throw new Error(fallbackMessage)
  }

  // Handle no-content responses
  if (response.status === 204) {
    return undefined as T
  }

  // Return parsed JSON response
  return (await response.json()) as T
}
