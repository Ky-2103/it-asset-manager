import { useCallback, useMemo, useState } from 'react'
import { createTicket as createTicketRequest, updateTicket as updateTicketRequest } from '../api/tickets'
import type { AppUser, Ticket, TicketStatus } from '../types/models'

// Manage ticket state and related actions
export function useTickets(currentUser: AppUser | null) {
  // All tickets
  const [tickets, setTickets] = useState<Ticket[]>([])

  // Tickets created by the current user
  const myTickets = useMemo(
    () => tickets.filter((ticket) => currentUser && ticket.created_by === currentUser.id),
    [tickets, currentUser],
  )

  // Replace full ticket list (e.g. after fetch)
  const replaceTicketsData = useCallback((nextTickets: Ticket[]) => {
    setTickets(nextTickets)
  }, [])

  // Create a new ticket and prepend to state
  const createTicket = useCallback(
    async (payload: { description: string; asset_id: number; priority: Ticket['priority'] }) => {
      const newTicket = await createTicketRequest(payload)
      setTickets((previous) => [newTicket, ...previous])
      return newTicket
    },
    [],
  )

  // Update ticket status and merge updated data into state
  const updateTicketStatus = useCallback(
    async (ticketId: number, status: TicketStatus) => {
      const updatedTicket = await updateTicketRequest(ticketId, { status })

      setTickets((previous) =>
        previous.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                ...updatedTicket,
              }
            : ticket,
        ),
      )

      return updatedTicket
    },
    [],
  )

  // Clear all ticket data (e.g. on logout)
  const clearTicketState = useCallback(() => {
    setTickets([])
  }, [])

  return {
    tickets,
    myTickets,
    replaceTicketsData,
    createTicket,
    updateTicketStatus,
    clearTicketState,
  }
}
