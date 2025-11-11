"use client"

import { useState } from "react"
import { useDiagnosticCounts } from "@/hooks/useDiagnostic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Users, Clock, Calendar, X, RefreshCw } from "lucide-react"
import StudentListModal from "./StudentListModal"

const DiagnosticTracking = () => {
  const { data: diagnosticData, isLoading, error, refetch, isRefetching } = useDiagnosticCounts()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState({ title: '', filterType: '', filterValue: '' })
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Diagnostic Test Tracking</h2>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing || isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(refreshing || isRefetching) ? 'animate-spin' : ''}`} />
            {(refreshing || isRefetching) ? 'Retrying...' : 'Retry'}
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Failed to Load Diagnostic Data</h3>
            <p className="text-red-600 text-sm">Unable to fetch current diagnostic test registrations. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  const diagnosticTests = diagnosticData?.diagnosticTests || {}
  const statistics = diagnosticData?.statistics || {}

  const handleViewStudents = (title, diagnosticDate) => {
    // Convert the diagnostic date to the filter value used by the API
    let filterValue = ''
    if (diagnosticDate.includes('Saturday')) {
      filterValue = 'saturday'
    } else if (diagnosticDate.includes('Sunday')) {
      filterValue = 'sunday'
    } else if (diagnosticDate.includes("can't make")) {
      filterValue = 'cannot'
    }

    setModalData({
      title,
      filterType: 'diagnosticTest',
      filterValue: filterValue
    })
    setModalOpen(true)
  }

  const diagnosticTestSlots = [
    { 
      date: "Saturday September 27th 8:30am - noon PST", 
      icon: <Calendar className="w-5 h-5" />,
      day: "Saturday",
      time: "8:30am - noon PST",
      shortLabel: "Sat Sept 27"
    },
    { 
      date: "Sunday September 28th 8:30am - noon PST", 
      icon: <Calendar className="w-5 h-5" />,
      day: "Sunday", 
      time: "8:30am - noon PST",
      shortLabel: "Sun Sept 28"
    },
    { 
      date: "I can't make either of these dates (reply below with if neither option works for you)", 
      icon: <X className="w-5 h-5" />,
      day: "Cannot Attend",
      time: "Alternative needed",
      shortLabel: "Cannot Attend"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Diagnostic Test Tracking</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing || isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(refreshing || isRefetching) ? 'animate-spin' : ''}`} />
            {(refreshing || isRefetching) ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Registered</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.totalRegistered || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Saturday</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.saturdayCount || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Sunday</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.sundayCount || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Cannot Attend</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.cannotAttendCount || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Rate Card */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Attendance Rate</h3>
              <p className="text-sm text-gray-600">Students who can attend either test date</p>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {statistics.attendanceRate || 0}%
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-600 h-2 rounded-full transition-all" 
                style={{ width: `${statistics.attendanceRate || 0}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic Test Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {diagnosticTestSlots.map(slot => {
          const count = diagnosticTests[slot.date] || 0
          const percentage = statistics.totalRegistered > 0 ? 
            ((count / statistics.totalRegistered) * 100).toFixed(1) : 0
          const isCannotAttend = slot.date.includes("can't make")

          return (
            <Card 
              key={slot.date} 
              className="border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => handleViewStudents(`Students - ${slot.day}`, slot.date)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-900">{slot.day}</CardTitle>
                    <p className="text-sm text-gray-600">{slot.time}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                    {slot.shortLabel}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-semibold text-gray-900">{count}</span>
                    <span className="text-sm text-gray-600">students</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Share of Total</span>
                    <span className="text-gray-600">{percentage}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-600 h-2 rounded-full transition-all" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      {isCannotAttend ? 
                        "Need follow-up for alternative arrangements" :
                        `${slot.time} - All students welcome`
                      }
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Click to view students
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Important Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <div className="text-sm text-gray-600">
            <strong>Test Schedule:</strong> Both Saturday and Sunday tests run the same diagnostic assessment. Students only need to attend one session.
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <div className="text-sm text-gray-600">
            <strong>Follow-up Required:</strong> Students who cannot attend either date need individual scheduling assistance.
          </div>
        </div>
      </div>

      {/* Data Refresh Info */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3">
        <div className="text-sm text-gray-600">
          <strong>Note:</strong> Diagnostic test registrations automatically refresh every 3 seconds.
        </div>
      </div>

      {/* Student List Modal */}
      <StudentListModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalData.title}
        filterType={modalData.filterType}
        filterValue={modalData.filterValue}
      />
    </div>
  )
}

export default DiagnosticTracking
