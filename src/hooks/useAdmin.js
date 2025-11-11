import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Admin Students Queries
export const useStudents = (page = 1, limit = 10, filters = {}) => {
  return useQuery({
    queryKey: ['students', page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      
      const response = await fetch(`/api/students?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }
      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useStudent = (id) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const response = await fetch(`/api/students/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch student')
      }
      return response.json()
    },
    enabled: !!id,
  })
}

export const useUpdateStudentStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await fetch(`/api/students/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update student status')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Student status updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update student status')
    }
  })
}

export const useDeleteStudent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete student')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Student deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete student')
    }
  })
}

// Dashboard Stats Query
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}