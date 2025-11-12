"use client"

import { useState, useEffect } from 'react'
import AdminLogin from '@/components/admin/AdminLogin'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DashboardStats from '@/components/admin/DashboardStats'
import StudentTable from '@/components/admin/StudentTable'
import ContactMessages from '@/components/admin/ContactMessages'
import EnrollmentTracking from '@/components/admin/EnrollmentTracking'
import DiagnosticTracking from '@/components/admin/DiagnosticTracking'
import DiagnosticTestManagement from '@/components/admin/DiagnosticTestManagement'
import MaintenanceToggle from '@/components/admin/MaintenanceToggle'
import AdminChat from '@/components/admin/AdminChat'
import AmbassadorManagement from '@/components/admin/AmbassadorManagement'
import AppointmentManagement from '@/components/admin/AppointmentManagement'
import AssignmentManagement from '@/components/admin/AssignmentManagement'
import AssignmentResults from '@/components/admin/AssignmentResults'
import ClassTimeManagement from '@/components/admin/ClassTimeManagement'
import ClassroomManagement from '@/components/admin/ClassroomManagement'
import SalesReport from '@/components/admin/SalesReport'
import CouponManagement from '@/components/admin/CouponManagement'
import CouponUsageHistory from '@/components/admin/CouponUsageHistory'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [admin, setAdmin] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/me')
      if (response.ok) {
        const data = await response.json()
        setAdmin(data.admin)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = (adminData) => {
    setAdmin(adminData)
  }

  const handleLogout = () => {
    setAdmin(null)
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

  if (!admin) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        admin={admin}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
        {activeTab === 'overview' && (
          <DashboardStats />
        )}

        {activeTab === 'students' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Student Management</h2>
              <p className="mt-2 text-gray-600">
                View and manage all student registrations.
              </p>
            </div>
            <StudentTable />
          </div>
        )}

        {activeTab === 'sales' && (
          <div>
            <SalesReport />
          </div>
        )}

        {activeTab === 'coupons' && (
          <div>
            <CouponManagement />
          </div>
        )}

        {activeTab === 'coupon-usage' && (
          <div>
            <CouponUsageHistory />
          </div>
        )}

        {activeTab === 'assignments' && (
          <div>
            <AssignmentManagement />
          </div>
        )}

        {activeTab === 'assignment-results' && (
          <div>
            <AssignmentResults />
          </div>
        )}

        {activeTab === 'class-times' && (
          <div>
            <ClassTimeManagement />
          </div>
        )}

        {activeTab === 'classroom' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Classroom Content Management</h2>
              <p className="mt-2 text-gray-600">
                Manage class structures, modules, and videos for the student classroom.
              </p>
            </div>
            <ClassroomManagement />
          </div>
        )}

        {activeTab === 'diagnostic-tests' && (
          <div>
            <DiagnosticTestManagement />
          </div>
        )}

        {activeTab === 'ambassadors' && (
          <div>
            <AmbassadorManagement />
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Appointment Management</h2>
              <p className="mt-2 text-gray-600">
                View appointments for students who are registered on the 1550Plus platform.
              </p>
            </div>
            <AppointmentManagement />
          </div>
        )}

        {activeTab === 'chat' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Student Messages</h2>
              <p className="mt-2 text-gray-600">
                Communicate with students through real-time chat messages.
              </p>
            </div>
            <AdminChat />
          </div>
        )}

        {activeTab === 'contacts' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Contact Messages</h2>
              <p className="mt-2 text-gray-600">
                View and manage contact form submissions.
              </p>
            </div>
            <ContactMessages />
          </div>
        )}

        {activeTab === 'enrollment' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Class Enrollment Tracking</h2>
              <p className="mt-2 text-gray-600">
                Monitor real-time class enrollments and track minimum requirements.
              </p>
            </div>
            <EnrollmentTracking />
          </div>
        )}

        {activeTab === 'diagnostic' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Diagnostic Test Tracking</h2>
              <p className="mt-2 text-gray-600">
                Monitor diagnostic test date selections and attendance planning.
              </p>
            </div>
            <DiagnosticTracking />
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Maintenance Mode</h2>
              <p className="mt-2 text-gray-600">
                Control site maintenance mode and display custom messages to users.
              </p>
            </div>
            <MaintenanceToggle adminEmail={admin?.email} />
          </div>
        )}
        </div>
      </div>
    </div>
  )
}