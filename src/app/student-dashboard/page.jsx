"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStudentAuth, useStudentLogout } from '@/hooks/useStudentAuth'
import { useQueryClient } from '@tanstack/react-query'
import StudentDashboard from '@/components/student/StudentDashboard'

export default function StudentDashboardPage() {
  const router = useRouter()
  const { student, isAuthenticated, isLoading } = useStudentAuth()
  const logoutMutation = useStudentLogout()
  const queryClient = useQueryClient()

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/student-login')
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/student-login')
      }
    })
  }

  const handleRefreshStudent = async () => {
    // Invalidate and refetch the current student data
    await queryClient.invalidateQueries({ queryKey: ['current-student'] })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#457BF5] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !student) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentDashboard 
        student={student} 
        onLogout={handleLogout} 
        onRefreshStudent={handleRefreshStudent}
      />
    </div>
  )
}