import { useCallback, useEffect, useState } from 'react'
import { listAssets, listMyAssets } from '../api/assets'
import { listTickets, listMyTickets } from '../api/tickets'
import { listUsers } from '../api/users'
import type { AppUser, Asset, Ticket } from '../types/models'

export type BootstrapData = {
  users: AppUser[]
  assets: Asset[]
  myAssets: Asset[]
  tickets: Ticket[]
  error: string | null
  reload: () => Promise<void>
}

// Normalize errors into user-friendly messages
function normalizeBootstrapError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    // Handle session expiry explicitly
    if (error.message === 'UNAUTHORIZED') {
      return 'Your session has expired. Please log in again.'
    }

    return error.message
  }

  return 'Unable to load dashboard data.'
}

// Fetch and manage initial dashboard data
export function useBootstrapData(currentUser: AppUser | null, isAuthenticated: boolean): BootstrapData {
  const [users, setUsers] = useState<AppUser[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [myAssets, setMyAssets] = useState<Asset[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load all required data based on user role
  const reload = useCallback(async () => {
    // Reset state if not authenticated
    if (!currentUser || !isAuthenticated) {
      setUsers([])
      setAssets([])
      setMyAssets([])
      setTickets([])
      setError(null)
      return
    }

    try {
      const isAdmin = currentUser.role === 'admin'

      // Share request for non-admin users to avoid duplicate API calls
      const sharedMyAssetsPromise = isAdmin
        ? Promise.resolve<Asset[]>([])
        : listMyAssets()

      const [assetsResponse, myAssetsResponse, ticketsResponse, usersResponse] =
        await Promise.all([
          isAdmin ? listAssets() : sharedMyAssetsPromise,
          sharedMyAssetsPromise,
          isAdmin ? listTickets() : listMyTickets(),
          isAdmin ? listUsers() : Promise.resolve<AppUser[]>([]),
        ])

      setAssets(assetsResponse)
      setMyAssets(myAssetsResponse)
      setTickets(ticketsResponse)
      setUsers(usersResponse)
      setError(null)
    } catch (caughtError: unknown) {
      setError(normalizeBootstrapError(caughtError))
    }
  }, [currentUser, isAuthenticated])

  useEffect(() => {
    // Trigger initial load asynchronously
    queueMicrotask(() => {
      void reload()
    })
  }, [reload])

  return { users, assets, myAssets, tickets, error, reload }
}
