// Extract a user-friendly error message with a fallback
export function getActionErrorMessage(error: unknown, fallbackMessage: string) {
  // Return the error message if it's a valid Error with content
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  // Fallback message if error is not usable
  return fallbackMessage
}
