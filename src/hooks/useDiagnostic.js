import { useQuery } from '@tanstack/react-query'

const fetchDiagnosticCounts = async () => {
  const response = await fetch('/api/diagnostic')
  
  if (!response.ok) {
    throw new Error('Failed to fetch diagnostic test counts')
  }
  
  return response.json()
}

export const useDiagnosticCounts = () => {
  return useQuery({
    queryKey: ['diagnosticCounts'],
    queryFn: fetchDiagnosticCounts,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
    staleTime: 2000, // Consider data stale after 2 seconds
    retry: 3,
    retryDelay: 1000
  })
}

// Hook for checking specific diagnostic test date enrollment
export const useDiagnosticTestEnrollment = (diagnosticTestDate) => {
  return useQuery({
    queryKey: ['diagnosticTestEnrollment', diagnosticTestDate],
    queryFn: async () => {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ diagnosticTestDate })
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch diagnostic test enrollment')
      }
      
      return response.json()
    },
    enabled: !!diagnosticTestDate, // Only run if diagnosticTestDate is provided
    refetchInterval: 3000,
    staleTime: 2000
  })
}
