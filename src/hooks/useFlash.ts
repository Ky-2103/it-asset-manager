import { useCallback, useState } from 'react'
import type { Flash } from '../types/models'

// Manage flash message state and helpers
export function useFlash() {
  // Current flash message (or null if none)
  const [flash, setFlash] = useState<Flash | null>(null)

  // Show a flash message with type and text
  const showFlash = useCallback((kind: Flash['kind'], text: string) => {
    setFlash({ kind, text })
  }, [])

  // Clear the current flash message
  const clearFlash = useCallback(() => {
    setFlash(null)
  }, [])

  return { flash, showFlash, clearFlash }
}
