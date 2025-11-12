import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Helper function to get admin auth headers
const getAdminHeaders = () => {
  const token = localStorage.getItem('adminToken')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

// Fetch coupons with pagination and filters
export const useCoupons = (page = 1, limit = 10, filters = {}) => {
  return useQuery({
    queryKey: ['coupons', page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      
      const response = await fetch(`/api/coupons?${params}`, {
        headers: getAdminHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch coupons')
      }
      
      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Fetch single coupon with usage stats
export const useCoupon = (id) => {
  return useQuery({
    queryKey: ['coupon', id],
    queryFn: async () => {
      const response = await fetch(`/api/coupons/${id}`, {
        headers: getAdminHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch coupon')
      }
      
      return response.json()
    },
    enabled: !!id,
  })
}

// Create coupon mutation
export const useCreateCoupon = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (couponData) => {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(couponData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create coupon')
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      toast.success('Coupon created successfully!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create coupon')
    }
  })
}

// Update coupon mutation
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...couponData }) => {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify(couponData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update coupon')
      }
      
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      queryClient.invalidateQueries({ queryKey: ['coupon', variables.id] })
      toast.success('Coupon updated successfully!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update coupon')
    }
  })
}

// Delete coupon mutation
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete coupon')
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      toast.success('Coupon deleted successfully!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete coupon')
    }
  })
}

// Fetch coupon usage history
export const useCouponUsage = (page = 1, limit = 20, filters = {}) => {
  return useQuery({
    queryKey: ['coupon-usage', page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (filters.couponId) params.append('couponId', filters.couponId)
      if (filters.search) params.append('search', filters.search)
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      
      const response = await fetch(`/api/coupons/usage?${params}`, {
        headers: getAdminHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch coupon usage')
      }
      
      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Validate coupon (public endpoint - no auth needed)
export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async ({ code, planType = 'all', amount = 99 }) => {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, planType, amount })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid coupon code')
      }
      
      return data
    }
  })
}
