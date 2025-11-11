'use client'

import { useState, useEffect } from 'react'
import AmbassadorLogin from '@/components/ambassador/AmbassadorLogin'
import AmbassadorDashboard from '@/components/ambassador/AmbassadorDashboard'

export default function AmbassadorPortal() {
  const [ambassador, setAmbassador] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/ambassador/auth/me')
      if (response.ok) {
        const data = await response.json()
        setAmbassador(data.ambassador)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = (ambassadorData) => {
    setAmbassador(ambassadorData)
    // Refresh to get full data including students
    setTimeout(() => checkAuth(), 100)
  }

  const handleLogout = () => {
    setAmbassador(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!ambassador) {
    return <AmbassadorLogin onLoginSuccess={handleLoginSuccess} />
  }

  return <AmbassadorDashboard ambassador={ambassador} onLogout={handleLogout} />
}