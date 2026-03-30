import type { BackendTicketStatus, Priority, Ticket, TicketStatus } from '../types/models.js'
import { apiRequest } from './http.js'

// Backend ticket type where status uses backend-specific values
type BackendTicket = Omit<Ticket, 'status'> & { status: BackendTicketStatus }

// Convert backend status to frontend-friendly status
function mapTicketStatusFromBackend(status: BackendTicketStatus): TicketStatus {
  return status === 'Closed' ? 'Resolved' : status
}

// Convert frontend status to backend format
function mapTicketStatusToBackend(status: TicketStatus): BackendTicketStatus {
  return status === 'Resolved' ? 'Closed' : status
}

// Map a full backend ticket object to frontend format
function mapTicketFromBackend(ticket: BackendTicket): Ticket {
  return {
    ...ticket,
    status: mapTicketStatusFromBackend(ticket.status),
  }
}

export type CreateTicketPayload = {
  // ID of the related asset
  asset_id: number

  // Description of the issue
  description: string

  // Priority level of the ticket
  priority: Priority
}

export type UpdateTicketPayload = {
  // Updated description (optional)
  description?: string

  // Updated priority (optional)
  priority?: Priority

  // Updated status (optional, frontend format)
  status?: TicketStatus
}

// Fetch all tickets and map them to frontend format
export function listTickets() {
  return apiRequest<BackendTicket[]>('tickets')
    .then((tickets) => tickets.map(mapTicketFromBackend))
}

// Fetch tickets assigned to the current user
export function listMyTickets() {
  return apiRequest<BackendTicket[]>('tickets/my')
    .then((tickets) => tickets.map(mapTicketFromBackend))
}

// Create a new ticket and map response to frontend format
export function createTicket(payload: CreateTicketPayload) {
  return apiRequest<BackendTicket>('tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then(mapTicketFromBackend)
}

// Update an existing ticket, converting status if provided
export function updateTicket(ticketId: number, payload: UpdateTicketPayload) {
  const requestPayload = {
    ...payload,
    ...(payload.status
      ? { status: mapTicketStatusToBackend(payload.status) }
      : {}),
  }

  return apiRequest<BackendTicket>(`tickets/${ticketId}`, {
    method: 'PUT',
    body: JSON.stringify(requestPayload),
  }).then(mapTicketFromBackend)
}

// Delete a ticket by ID
export function removeTicket(ticketId: number) {
  return apiRequest<void>(`tickets/${ticketId}`, {
    method: 'DELETE',
  })
}
