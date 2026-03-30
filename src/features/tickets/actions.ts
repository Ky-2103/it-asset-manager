import type { CreateTicketPayload } from '../../api/tickets.js'

// Convert FormData into a structured CreateTicketPayload
export function parseCreateTicketFormData(formData: FormData): CreateTicketPayload {
  return {
    // Extract and trim description
    description: String(formData.get('description') ?? '').trim(),

    // Convert asset ID to number (default to 0 if missing)
    asset_id: Number(formData.get('asset_id') ?? 0),

    // Default priority to 'Medium' if not provided
    priority: String(formData.get('priority') ?? 'Medium') as CreateTicketPayload['priority'],
  }
}

// Validate required fields before submitting
export function validateCreateTicketPayload(payload: CreateTicketPayload) {
  // Ensure description and asset are provided
  if (!payload.description || !payload.asset_id) {
    throw new Error('Please add a description and select an asset.')
  }
}

// Handle full create ticket flow (parse → validate → submit)
export async function createTicketAction(
  formData: FormData,
  createTicket: (payload: CreateTicketPayload) => Promise<unknown>,
) {
  const payload = parseCreateTicketFormData(formData)
  validateCreateTicketPayload(payload)

  // Submit payload to API
  await createTicket(payload)
}
