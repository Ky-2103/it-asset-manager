import type { CreateAssetPayload } from '../../api/assets.js'

// Convert FormData into a structured CreateAssetPayload
export function parseCreateAssetFormData(formData: FormData): CreateAssetPayload {
  // Extract and clean assigned user ID
  const assignedUserIdRaw = String(formData.get('assigned_user_id') ?? '').trim()

  return {
    // Extract and trim form values
    asset_tag: String(formData.get('asset_tag') ?? '').trim(),
    name: String(formData.get('name') ?? '').trim(),
    category: String(formData.get('category') ?? '').trim(),

    // Default status to 'Available' if not provided
    status: String(formData.get('status') ?? 'Available') as CreateAssetPayload['status'],

    // Convert to number if present, otherwise null
    assigned_user_id: assignedUserIdRaw ? Number(assignedUserIdRaw) : null,
  }
}

// Validate required fields before submitting
export function validateCreateAssetPayload(payload: CreateAssetPayload) {
  // Ensure required fields are present
  if (!payload.asset_tag || !payload.name || !payload.category) {
    throw new Error('Asset tag, name, category are required.')
  }

  // Ensure assigned user is provided when status is 'Assigned'
  if (payload.status === 'Assigned' && !payload.assigned_user_id) {
    throw new Error('Please select an assigned user when status is Assigned.')
  }
}

// Handle full create asset flow (parse → validate → submit)
export async function createAssetAction(
  formData: FormData,
  createAsset: (payload: CreateAssetPayload) => Promise<unknown>
) {
  const payload = parseCreateAssetFormData(formData)
  validateCreateAssetPayload(payload)

  // Submit payload to API
  await createAsset(payload)
}
