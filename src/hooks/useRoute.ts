import { useEffect, useState } from 'react'

// Check if running in a browser environment
const hasWindow = typeof window !== 'undefined'

// Ensure route always starts with a leading slash
function normalizeRoute(route: string) {
  return route.startsWith('/') ? route : `/${route}`
}

// Manage client-side routing state
export function useRoute(defaultRoute = '/') {
  // Initialise route from current location or fallback
  const [route, setRoute] = useState(() => {
    if (!hasWindow) return normalizeRoute(defaultRoute)
    return normalizeRoute(window.location.pathname || defaultRoute)
  })

  useEffect(() => {
    if (!hasWindow) return

    // Update route when browser navigation occurs (back/forward)
    const onPopState = () => {
      setRoute(normalizeRoute(window.location.pathname || defaultRoute))
    }

    window.addEventListener('popstate', onPopState)

    // Cleanup listener on unmount
    return () => window.removeEventListener('popstate', onPopState)
  }, [defaultRoute])

  // Navigate to a new route and update history
  function navigate(to: string, options?: { replace?: boolean }) {
    const nextRoute = normalizeRoute(to)

    if (hasWindow) {
      const method = options?.replace ? 'replaceState' : 'pushState'
      window.history[method](null, '', nextRoute)
    }

    setRoute(nextRoute)
  }

  return { route, navigate }
}
