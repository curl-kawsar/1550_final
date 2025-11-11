"use client"

import { useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import StudentLoginForm from '@/components/auth/StudentLoginForm'
import { useStudentAuth } from '@/hooks/useStudentAuth'

export default function StudentLoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useStudentAuth()

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push('/student-dashboard')
    }
  }, [isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="text-4xl font-bold text-[#113076]">1550+</div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Student Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your dashboard and track your progress
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          }>
            <StudentLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}