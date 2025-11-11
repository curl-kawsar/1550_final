import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Submit contact form
const submitContactForm = async (formData) => {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to send message')
  }
  
  return data
}

export const useSubmitContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: submitContactForm,
    onSuccess: (data) => {
      toast.success(data.message || "Thank you for your message! We will get back to you soon.")
      // Invalidate and refetch contact messages for admin panel
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message. Please try again.")
    }
  })
}

// Admin: Get contact messages
export const useContactMessages = (page = 1, limit = 10, status = '') => {
  return useQuery({
    queryKey: ['contact-messages', page, limit, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (status) params.append('status', status)
      
      const response = await fetch(`/api/contact?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch contact messages')
      }
      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Admin: Get single contact message
export const useContactMessage = (id) => {
  return useQuery({
    queryKey: ['contact-message', id],
    queryFn: async () => {
      const response = await fetch(`/api/contact/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch contact message')
      }
      return response.json()
    },
    enabled: !!id,
  })
}

// Admin: Update contact message status
export const useUpdateContactStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update message status')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
      queryClient.invalidateQueries({ queryKey: ['contact-message'] })
      toast.success('Message status updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update message status')
    }
  })
}

// Admin: Delete contact message
export const useDeleteContactMessage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete message')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
      toast.success('Message deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete message')
    }
  })
}