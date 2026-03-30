import { useCallback, useState } from 'react'
import { createAsset as createAssetRequest, removeAsset, updateAsset } from '../api/assets'
import type { Asset } from '../types/models'

// Manage asset state and related actions
export function useAssets() {
  // All assets
  const [assets, setAssets] = useState<Asset[]>([])

  // Assets assigned to the current user
  const [myAssets, setMyAssets] = useState<Asset[]>([])

  // Replace both asset lists (e.g. after initial fetch)
  const replaceAssetsData = useCallback((nextAssets: Asset[], nextMyAssets: Asset[]) => {
    setAssets(nextAssets)
    setMyAssets(nextMyAssets)
  }, [])

  // Create a new asset and prepend to state
  const createAsset = useCallback(
    async (payload: {
      asset_tag: string
      name: string
      category: Asset['category']
      status: Asset['status']
      assigned_user_id: number | null
    }) => {
      const newAsset = await createAssetRequest(payload)
      setAssets((previous) => [newAsset, ...previous])
      return newAsset
    },
    [],
  )

  // Update an asset and sync changes across both lists
  const applyAssetUpdate = useCallback(
    async (assetId: number, payload: { status: Asset['status']; assigned_user_id: number | null }) => {
      const updatedAsset = await updateAsset(assetId, payload)

      setAssets((previous) =>
        previous.map((asset) => (asset.id === assetId ? updatedAsset : asset))
      )

      setMyAssets((previous) =>
        previous.map((asset) => (asset.id === assetId ? updatedAsset : asset))
      )

      return updatedAsset
    },
    [],
  )

  // Delete an asset and remove it from both lists
  const deleteAsset = useCallback(async (assetId: number) => {
    await removeAsset(assetId)

    setAssets((previous) => previous.filter((asset) => asset.id !== assetId))
    setMyAssets((previous) => previous.filter((asset) => asset.id !== assetId))
  }, [])

  // Clear all asset-related state (e.g. on logout)
  const clearAssetState = useCallback(() => {
    setAssets([])
    setMyAssets([])
  }, [])

  return {
    assets,
    myAssets,
    replaceAssetsData,
    createAsset,
    updateAsset: applyAssetUpdate,
    deleteAsset,
    clearAssetState,
  }
}
