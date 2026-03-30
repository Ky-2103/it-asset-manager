import { useEffect, useRef, useState } from 'react'
import type { AppUser } from '../types/models'

type Props = {
  // Currently logged-in user
  currentUser: AppUser

  // Navigation handler
  navigate: (to: string) => void

  // Logout handler
  onLogout: () => void
}

// Top navigation bar with links, mobile menu, and profile dropdown
export function TopNav({ currentUser, navigate, onLogout }: Props) {
  // Controls visibility of profile dropdown
  const [showProfile, setShowProfile] = useState(false)

  // Controls visibility of mobile navigation menu
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Reference to profile menu for outside click detection
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  // Navigate to a route and close menus
  function handleNavigate(to: string) {
    setShowMobileMenu(false)
    setShowProfile(false)
    navigate(to)
  }

  // Handle logout and close menus
  function handleLogoutClick() {
    setShowMobileMenu(false)
    setShowProfile(false)
    onLogout()
  }

  useEffect(() => {
    // Close profile menu when clicking outside of it
    function closeOnOutsideClick(event: MouseEvent) {
      if (profileMenuRef.current?.contains(event.target as Node)) {
        return
      }

      setShowProfile(false)
    }

    // Close profile menu when pressing Escape key
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowProfile(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)

    // Cleanup event listeners on unmount
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <header className="top-nav">
      <div className="brand">IT Asset & Maintenance Manager</div>

      {/* Mobile menu toggle button */}
      <button
        className="ghost nav-toggle"
        aria-expanded={showMobileMenu}
        aria-controls="top-nav-links"
        aria-label="Toggle navigation menu"
        onClick={() => setShowMobileMenu((prev) => !prev)}
      >
        ☰
      </button>

      {/* Navigation links */}
      <nav id="top-nav-links" className={showMobileMenu ? 'open' : ''}>
        <button onClick={() => handleNavigate('/dashboard')}>Dashboard</button>
        <button onClick={() => handleNavigate('/assets')}>Assets</button>

        {/* Show different label depending on user role */}
        <button onClick={() => handleNavigate('/tickets')}>
          {currentUser.role === 'admin' ? 'Tickets' : 'My Tickets'}
        </button>

        {/* Admin-only users page */}
        {currentUser.role === 'admin' && (
          <button onClick={() => handleNavigate('/users')}>Users</button>
        )}

        {/* Profile dropdown */}
        <div className="profile-menu" ref={profileMenuRef}>
          <button
            className="ghost profile-trigger"
            aria-expanded={showProfile}
            aria-haspopup="true"
            aria-label="Open profile menu"
            onClick={() => setShowProfile((prev) => !prev)}
          >
            <span className="profile-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5Zm0 2c-3.34 0-10 1.68-10 5v3h20v-3c0-3.32-6.66-5-10-5Z" />
              </svg>
            </span>
          </button>

          {/* Profile popover */}
          {showProfile && (
            <div className="profile-popover" role="dialog" aria-label="Logged in user profile">
              <p className="profile-name">{currentUser.username}</p>
              <p className="profile-meta">{currentUser.email}</p>
              <p className="profile-meta">Role: {currentUser.role}</p>

              {/* Logout button */}
              <button className="profile-logout" onClick={handleLogoutClick}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
