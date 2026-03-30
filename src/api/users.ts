import type { AppUser } from '../types/models.js'
import { apiRequest } from './http.js'

// Fetch all users
export function listUsers() {
  return apiRequest<AppUser[]>('users')
}
