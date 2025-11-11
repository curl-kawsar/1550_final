import { useQuery } from '@tanstack/react-query'

const fetchEnrollmentCounts = async () => {
  const response = await fetch('/api/class-times/active?includeEnrollment=true')
  
  if (!response.ok) {
    throw new Error('Failed to fetch enrollment counts')
  }
  
  return response.json()
}

export const useEnrollmentCounts = () => {
  return useQuery({
    queryKey: ['enrollmentCounts'],
    queryFn: fetchEnrollmentCounts,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
    staleTime: 2000, // Consider data stale after 2 seconds
    retry: 3,
    retryDelay: 1000
  })
}

// Hook for checking specific class enrollment
export const useClassEnrollment = (classTime) => {
  return useQuery({
    queryKey: ['classEnrollment', classTime],
    queryFn: async () => {
      const response = await fetch('/api/enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ classTime })
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch class enrollment')
      }
      
      return response.json()
    },
    enabled: !!classTime, // Only run if classTime is provided
    refetchInterval: 3000,
    staleTime: 2000
  })
}
