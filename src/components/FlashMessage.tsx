import type { Flash } from '../types/models'

type Props = {
  // Flash message object (or null if no message)
  flash: Flash | null
}

// Display a flash message if one exists
export function FlashMessage({ flash }: Props) {
  // Do not render anything if there is no message
  if (!flash) return null

  // Render message with styling based on its type
  return <div className={`flash ${flash.kind}`}>{flash.text}</div>
}
