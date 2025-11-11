import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// API Functions
const loginStudent = async ({ email, password }) => {
  const response = await fetch('/api/student/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  })

  const data = await response.json()
  
  if (!response.ok) {
    // Special case: password setup required
    if (response.status === 428) {
      const error = new Error(data.error || 'Password setup required')
      error.needsPasswordSetup = true
      error.redirectTo = data.redirectTo
      error.email = data.email
      throw error
    }
    
    throw new Error(data.error || 'Login failed')
  }
  
  return data
}

const logoutStudent = async () => {
  const response = await fetch('/api/student/auth/logout', {
    method: 'POST',
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Logout failed')
  }
  
  return data
}

const getCurrentStudent = async () => {
  const response = await fetch('/api/student/auth/me')

  if (!response.ok) {
    if (response.status === 401) {
      return null // Not authenticated
    }
    const data = await response.json()
    throw new Error(data.error || 'Failed to get student profile')
  }
  
  const data = await response.json()
  return data.student
}

// Hooks
export const useStudentLogin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: loginStudent,
    onSuccess: (data) => {
      toast.success('Login successful! Welcome to your dashboard.')
      
      // Store JWT token in localStorage for chat authentication
      if (data.token) {
        localStorage.setItem('studentToken', data.token)
      }
      
      // Update the student query cache
      queryClient.setQueryData(['current-student'], data.student)
      queryClient.invalidateQueries({ queryKey: ['current-student'] })
    },
    onError: (error) => {
      // Don't show toast for password setup case - let the component handle it
      if (!error.needsPasswordSetup) {
        toast.error(error.message || 'Login failed. Please check your credentials.')
      }
    }
  })
}

export const useStudentLogout = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  
  return useMutation({
    mutationFn: logoutStudent,
    onSuccess: () => {
      toast.success('Logged out successfully')
      
      // Clear JWT token from localStorage
      localStorage.removeItem('studentToken')
      
      // Clear the student query cache
      queryClient.setQueryData(['current-student'], null)
      queryClient.invalidateQueries({ queryKey: ['current-student'] })
      // Redirect to home page
      router.push('/')
    },
    onError: (error) => {
      toast.error(error.message || 'Logout failed')
    }
  })
}

export const useCurrentStudent = () => {
  return useQuery({
    queryKey: ['current-student'],
    queryFn: getCurrentStudent,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Helper hook to check if student is authenticated
export const useStudentAuth = () => {
  const { data: student, isLoading, error } = useCurrentStudent()
  
  return {
    student,
    isAuthenticated: !!student,
    isLoading,
    error
  }
}