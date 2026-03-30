import type { Asset } from '../types/models.js'
import { apiRequest } from './http.js'

export type CreateAssetPayload = {
  // Unique identifier for the asset
  asset_tag: string

  // Name of the asset
  name: string

  // Category the asset belongs to
  category: string

  // Current status of the asset (derived from Asset type)
  status: Asset['status']

  // ID of the assigned user, or null if unassigned
  assigned_user_id: number | null
}

// Payload for updating an asset (all fields optional)
export type UpdateAssetPayload = Partial<CreateAssetPayload>

// Fetch all assets
export function listAssets() {
  return apiRequest<Asset[]>('assets')
}

// Fetch assets assigned to the current user
export function listMyAssets() {
  return apiRequest<Asset[]>('assets/my')
}

// Create a new asset
export function createAsset(payload: CreateAssetPayload) {
  return apiRequest<Asset>('assets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Update an existing asset by ID
export function updateAsset(assetId: number, payload: UpdateAssetPayload) {
  return apiRequest<Asset>(`assets/${assetId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

// Delete an asset by ID
export function removeAsset(assetId: number) {
  return apiRequest<void>(`assets/${assetId}`, {
    method: 'DELETE',
  })
}
