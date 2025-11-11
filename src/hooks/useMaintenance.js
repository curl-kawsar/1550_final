import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Get maintenance status
export const useMaintenanceStatus = () => {
  return useQuery({
    queryKey: ['maintenance-status'],
    queryFn: async () => {
      const response = await fetch('/api/maintenance')
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance status')
      }
      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// Toggle maintenance mode (Admin only)
export const useToggleMaintenance = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ isEnabled, message, adminEmail }) => {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isEnabled,
          message,
          adminEmail
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to toggle maintenance mode')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-status'] })
      toast.success(data.message || 'Maintenance mode updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update maintenance mode')
    }
  })
}
