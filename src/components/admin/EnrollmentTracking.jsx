"use client"

import { useState, useEffect } from "react"
import { useEnrollmentCounts } from "@/hooks/useEnrollment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Users, Clock, Calendar, RefreshCw, Plus } from "lucide-react"
import StudentListModal from "./StudentListModal"

const EnrollmentTracking = () => {
  const { data: enrollmentData, isLoading, error, refetch, isRefetching } = useEnrollmentCounts()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState({ title: '', filterType: '', filterValue: '' })
  const [refreshing, setRefreshing] = useState(false)
  
  // Get dynamic class times from enrollment data
  const classTimes = enrollmentData?.classTimes || []
  const enrollments = enrollmentData?.enrollments || {}
  const minimumRequired = enrollmentData?.minimumRequired || 40

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Class Enrollment Tracking</h2>
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
            <h3 className="text-red-800 font-medium">Failed to Load Enrollment Data</h3>
            <p className="text-red-600 text-sm">Unable to fetch current enrollment counts. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  const totalEnrolled = Object.values(enrollments).reduce((sum, count) => sum + count, 0)

  const handleViewStudents = (title, classTime) => {
    setModalData({
      title,
      filterType: 'classTime',
      filterValue: classTime
    })
    setModalOpen(true)
  }

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  }

  // Helper function to get appropriate icon
  const getClassTimeIcon = (classTime) => {
    const timeString = classTime.startTime || '';
    const isAfternoon = timeString.includes('16:') || timeString.includes('15:') || timeString.includes('14:');
    return isAfternoon ? <Calendar className="w-5 h-5" /> : <Clock className="w-5 h-5" />;
  }

  // Helper function to determine time period
  const getTimePeriod = (classTime) => {
    const timeString = classTime.startTime || '';
    if (timeString.includes('16:') || timeString.includes('15:') || timeString.includes('14:')) {
      return 'Afternoon';
    } else if (timeString.includes('19:') || timeString.includes('20:') || timeString.includes('18:')) {
      return 'Evening';
    } else if (timeString.includes('08:') || timeString.includes('09:') || timeString.includes('10:')) {
      return 'Morning';
    }
    return 'Session';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class Enrollment Tracking</h2>
          <p className="text-gray-600">Monitor real-time enrollments for all active class times</p>
        </div>
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
              <p className="text-sm text-gray-600">Total Enrolled</p>
              <p className="text-2xl font-semibold text-gray-900">{totalEnrolled}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Classes Ready</p>
              <p className="text-2xl font-semibold text-green-600">
                {classTimes.filter(ct => (enrollments[ct.name] || 0) >= (ct.minimumRequired || minimumRequired)).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Need Students</p>
              <p className="text-2xl font-semibold text-orange-600">
                {classTimes.filter(ct => (enrollments[ct.name] || 0) < (ct.minimumRequired || minimumRequired)).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Classes</p>
              <p className="text-2xl font-semibold text-blue-600">{classTimes.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Time Details */}
      {classTimes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classTimes.map(classTime => {
            const enrollmentCount = enrollments[classTime.name] || 0
            const classMinRequired = classTime.minimumRequired || minimumRequired
            const progress = Math.min((enrollmentCount / classMinRequired) * 100, 100)
            const isReady = enrollmentCount >= classMinRequired
            const studentsNeeded = Math.max(classMinRequired - enrollmentCount, 0)
            const days = classTime.dayOfWeek ? classTime.dayOfWeek.join(' & ') : 'Custom Schedule'
            const period = getTimePeriod(classTime)

            return (
              <Card 
                key={classTime._id || classTime.name} 
                className="border border-gray-200 cursor-pointer hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                onClick={() => handleViewStudents(`Students - ${days} ${period}`, classTime.name)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getClassTimeIcon(classTime)}
                      <div>
                        <CardTitle className="text-lg text-gray-900">{days}</CardTitle>
                        <p className="text-sm text-gray-600">{period} Session</p>
                      </div>
                    </div>
                    <Badge 
                      variant={isReady ? "default" : "secondary"}
                      className={isReady ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                    >
                      {isReady ? "Ready" : "Needs Students"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Enrollment Progress</span>
                        <span className="text-gray-600 font-medium">
                          {enrollmentCount} / {classMinRequired}
                        </span>
                      </div>
                      
                      <Progress 
                        value={progress} 
                        className="h-3"
                      />
                      
                      {enrollmentCount > classMinRequired && (
                        <div className="text-xs text-green-600 font-medium">
                          ✓ {enrollmentCount - classMinRequired} above minimum
                        </div>
                      )}
                    </div>
                    
                    {/* Time and Capacity Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">
                          {formatTime(classTime.startTime)} - {formatTime(classTime.endTime)} {classTime.timezone}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">
                          {classTime.capacity || 50} students
                        </span>
                      </div>
                      
                      {!isReady && (
                        <div className="flex items-center justify-between text-orange-600">
                          <span>Students needed:</span>
                          <span className="font-semibold">{studentsNeeded} more</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Status Indicator */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Click to view enrolled students
                        </div>
                        <div className="flex items-center gap-1">
                          {isReady ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border border-dashed border-gray-300">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Class Times Available</h3>
            <p className="text-gray-600 mb-4">
              No active class times have been created yet. Students cannot register until class times are set up.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                // This would typically navigate to class times management
                // For now, we'll show an alert
                alert('Navigate to Class Times tab to create class schedules')
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Class Times
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data Refresh Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 mt-0.5 text-blue-600" />
            <div>
              <p className="font-medium mb-1">Enrollment Tracking Information</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Enrollment data automatically refreshes every 3 seconds</li>
                <li>• Click any class card to view enrolled students</li>
                <li>• Classes need minimum enrollment to run</li>
                <li>• Manage class times in the "Class Times" section</li>
              </ul>
            </div>
          </div>
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

export default EnrollmentTracking
