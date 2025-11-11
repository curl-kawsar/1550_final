"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Eye, Search, Filter, Download, ChevronLeft, ChevronRight, Edit2, Save, X, Trash2, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from "sonner"
import { useDebounce } from '@/hooks/useDebounce'

const StudentTable = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalStudents: 0
  })
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    diagnosticTest: '',
    classTime: ''
  })
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [editingStudent, setEditingStudent] = useState(null)
  const [editForm, setEditForm] = useState({
    classTime: '',
    diagnosticTestDate: ''
  })
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    student: null
  })
  const [refreshing, setRefreshing] = useState(false)
  
  // Dynamic schedule options
  const [classTimeOptions, setClassTimeOptions] = useState([])
  const [diagnosticTestOptions, setDiagnosticTestOptions] = useState([])
  const [loadingScheduleOptions, setLoadingScheduleOptions] = useState(true)

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebounce(filters.search, 500)

  // Create memoized filters object to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => ({
    search: debouncedSearch,
    status: filters.status,
    diagnosticTest: filters.diagnosticTest,
    classTime: filters.classTime
  }), [debouncedSearch, filters.status, filters.diagnosticTest, filters.classTime])

  // Helper functions for formatting
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const formatDiagnosticDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatScheduleOption = (optionName, changeType) => {
    if (!optionName) return 'Not set';
    
    // Find the option details from our loaded options
    const options = changeType === 'classTime' ? classTimeOptions : diagnosticTestOptions;
    
    
    const option = options.find(opt => {
      // Handle both dynamic objects and legacy strings
      if (typeof opt === 'object') {
        return opt.name === optionName;
      }
      return opt === optionName;
    });
    
    if (option && typeof option === 'object') {
      // This is a dynamic option with details
      if (changeType === 'classTime') {
        if (option.dayOfWeek && option.startTime && option.endTime) {
          return `${option.dayOfWeek.join(' & ')} - ${formatTime(option.startTime)} to ${formatTime(option.endTime)} ${option.timezone || 'Pacific'}`;
        }
      } else if (changeType === 'diagnosticTest') {
        if (option.date && option.startTime && option.endTime) {
          return `${formatDiagnosticDate(option.date)} - ${formatTime(option.startTime)} to ${formatTime(option.endTime)} ${option.timezone || 'Pacific'}`;
        }
      }
    }
    
    // For legacy string options, try to extract and format time information  
    if (changeType === 'classTime' && typeof optionName === 'string') {
      // Try to format legacy class time strings like "Mon & Wed - 4:00 PM Pacific"
      const match = optionName.match(/^(.+?)\s*-\s*(.+?)\s+(Pacific|PST|EST|CST|MST)$/i);
      if (match) {
        const [, days, time, timezone] = match;
        return `${days.trim()} - ${time.trim()} ${timezone}`;
      }
      
      // Handle other legacy formats
      if (optionName.includes(' - ') && optionName.includes(' PM ') || optionName.includes(' AM ')) {
        return optionName; // Already formatted
      }
    }
    
    if (changeType === 'diagnosticTest' && typeof optionName === 'string') {
      // Try to format legacy diagnostic test strings
      const satMatch = optionName.match(/Saturday\s+(.+?)\s+(\d+:\d+\w+)\s*-\s*(\w+)\s+(PST|Pacific)/i);
      if (satMatch) {
        return `Saturday, ${satMatch[1]} - ${satMatch[2]} to ${satMatch[3]} ${satMatch[4]}`;
      }
      const sunMatch = optionName.match(/Sunday\s+(.+?)\s+(\d+:\d+\w+)\s*-\s*(\w+)\s+(PST|Pacific)/i);
      if (sunMatch) {
        return `Sunday, ${sunMatch[1]} - ${sunMatch[2]} to ${sunMatch[3]} ${sunMatch[4]}`;
      }
      
      // Handle "can't make" options
      if (optionName.includes("can't make") || optionName.includes("cannot")) {
        return "Cannot Attend - Alternative Required";
      }
    }
    
    // Fallback to original name if we can't find details or format
    return optionName;
  };

  useEffect(() => {
    fetchStudents()
  }, [pagination.currentPage, memoizedFilters])

  useEffect(() => {
    fetchScheduleOptions()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '10'
      })
      
      if (memoizedFilters.search) params.append('search', memoizedFilters.search)
      if (memoizedFilters.status) params.append('status', memoizedFilters.status)
      if (memoizedFilters.diagnosticTest) params.append('diagnosticTest', memoizedFilters.diagnosticTest)
      if (memoizedFilters.classTime) params.append('classTime', memoizedFilters.classTime)
      
      const response = await fetch(`/api/students?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch students')
      }
      
      setStudents(data.students || [])
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalStudents: 0,
        hasNext: false,
        hasPrev: false
      })
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error(error.message || 'Error fetching students')
    } finally {
      setLoading(false)
    }
  }

  const fetchScheduleOptions = async () => {
    setLoadingScheduleOptions(true)
    try {
      // Fetch class times and diagnostic tests in parallel
      const [classTimesResponse, diagnosticTestsResponse] = await Promise.all([
        fetch('/api/class-times/active?includeEnrollment=true'),
        fetch('/api/diagnostic-tests/active?includeEnrollment=true')
      ])

      if (classTimesResponse.ok) {
        const classTimesData = await classTimesResponse.json()
        setClassTimeOptions(classTimesData.classTimes || [])
      } else {
        console.warn('Failed to fetch class times, using fallback')
        // Fallback to legacy options
        setClassTimeOptions([
          'Mon & Wed - 4:00 PM Pacific',
          'Mon & Wed - 7:00 PM Pacific',
          'Tue & Thu - 4:00 PM Pacific',
          'Tue & Thu - 7:00 PM Pacific'
        ])
      }

      if (diagnosticTestsResponse.ok) {
        const diagnosticTestsData = await diagnosticTestsResponse.json()
        setDiagnosticTestOptions(diagnosticTestsData.diagnosticTests || [])
      } else {
        console.warn('Failed to fetch diagnostic tests, using fallback')
        // Fallback to legacy options
        setDiagnosticTestOptions([
          'Saturday September 27th 8:30am - noon PST',
          'Sunday September 28th 8:30am - noon PST',
          'I can\'t make either of these dates (reply below with if neither option works for you)'
        ])
      }
    } catch (error) {
      console.error('Error fetching schedule options:', error)
      // Use fallback options on error
      setClassTimeOptions([
        'Mon & Wed - 4:00 PM Pacific',
        'Mon & Wed - 7:00 PM Pacific',
        'Tue & Thu - 4:00 PM Pacific',
        'Tue & Thu - 7:00 PM Pacific'
      ])
      setDiagnosticTestOptions([
        'Saturday September 27th 8:30am - noon PST',
        'Sunday September 28th 8:30am - noon PST',
        'I can\'t make either of these dates (reply below with if neither option works for you)'
      ])
    } finally {
      setLoadingScheduleOptions(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([fetchStudents(), fetchScheduleOptions()])
      toast.success('Student list refreshed')
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
  }

  const handleDeleteStudent = async (studentId) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        toast.success('Student deleted successfully')
        setDeleteModal({ isOpen: false, student: null })
        // Refresh the students list
        fetchStudents()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete student')
      }
    } catch (error) {
      console.error('Error deleting student:', error)
      toast.error('Failed to delete student')
    }
  }

  const updateStudentStatus = async (studentId, newStatus) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success('Student status updated successfully')
        fetchStudents()
      } else {
        toast.error('Error updating student status')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      toast.error('Error updating student')
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Name', 'Email', 'Phone', 'High School', 'GPA', 'Class Rigor', 
      'University Preference', 'Class Time', 'Diagnostic Test Date', 'Graduation Year', 'Status', 'Submitted At'
    ]
    
    const csvData = students.map(student => [
      `${student.firstName || 'N/A'} ${student.lastName || 'N/A'}`,
      student.email || 'N/A',
      student.phoneNumber || 'N/A',
      student.highSchoolName || 'N/A',
      student.currentGPA || 'N/A',
      student.classRigor || 'N/A',
      student.universitiesWant || 'N/A',
      formatScheduleOption(student.classTime, 'classTime'),
      formatScheduleOption(student.diagnosticTestDate, 'diagnosticTest'),
      student.graduationYear ? new Date(student.graduationYear).getFullYear() : 'N/A',
      student.status || 'N/A',
      student.submittedAt ? new Date(student.submittedAt).toLocaleDateString() : 'N/A'
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'default',
      reviewed: 'secondary',
      contacted: 'destructive'
    }
    
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800', 
      contacted: 'bg-green-100 text-green-800'
    }

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleEditStart = (student) => {
    setEditingStudent(student._id)
    setEditForm({
      classTime: student.classTime || '',
      diagnosticTestDate: student.diagnosticTestDate || ''
    })
  }

  const handleEditCancel = () => {
    setEditingStudent(null)
    setEditForm({
      classTime: '',
      diagnosticTestDate: ''
    })
  }

  const handleEditSave = async (studentId) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        toast.success('Student updated successfully')
        setEditingStudent(null)
        setEditForm({
          classTime: '',
          diagnosticTestDate: ''
        })
        // Refresh the students list
        fetchStudents()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update student')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      toast.error('Failed to update student')
    }
  }


  const DeleteConfirmationModal = ({ isOpen, student, onClose, onConfirm }) => {
    if (!isOpen || !student) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            Delete Student
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            Are you sure you want to delete <strong>{student.firstName} {student.lastName}</strong>? 
            This action cannot be undone and all student data will be permanently removed.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onConfirm(student._id)}
            >
              Delete Student
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const StudentDetailModal = ({ student, onClose, onStatusUpdate }) => {
    if (!student) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{student.firstName || 'N/A'} {student.lastName || 'N/A'}</h2>
                <p className="text-gray-600">{student.email || 'N/A'}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(student.status)}
                <Button variant="outline" size="sm" onClick={onClose}>
                  ✕
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Student Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Student Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p>{student.firstName || 'N/A'} {student.lastName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p>{student.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p>{student.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p>{student.gender || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">High School</label>
                  <p>{student.highSchoolName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Graduation Year</label>
                  <p>{student.graduationYear ? new Date(student.graduationYear).getFullYear() : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Parent Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Parent Name</label>
                  <p>{student.parentFirstName || 'N/A'} {student.parentLastName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Parent Email</label>
                  <p>{student.parentEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Parent Phone</label>
                  <p>{student.parentPhoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">State</label>
                  <p>{student.state || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Current GPA</label>
                  <p>{student.currentGPA || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Class Rigor</label>
                  <p>{student.classRigor || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">University Preference</label>
                  <p>{student.universitiesWant || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Registration Code</label>
                  <p>{student.registrationCode || 'N/A'}</p>
                </div>
              </div>
              
              {student.topCollegeChoices && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Top 3 College Choices</label>
                  <p className="mt-1">{student.topCollegeChoices}</p>
                </div>
              )}
              
              {student.satActScores && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">SAT/ACT Scores</label>
                  <p className="mt-1">{student.satActScores}</p>
                </div>
              )}
              
              {student.typeOfStudent && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Type of Student</label>
                  <p className="mt-1">{student.typeOfStudent}</p>
                </div>
              )}
              
              {student.biggestStressor && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Biggest Stressor</label>
                  <p className="mt-1">{student.biggestStressor}</p>
                </div>
              )}
              
              {student.parentWorry && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Parent's Biggest Worry</label>
                  <p className="mt-1">{student.parentWorry}</p>
                </div>
              )}
            </div>

            {/* Class Schedule Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Class Schedule Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Selected Class Time</label>
                  <p>{formatScheduleOption(student.classTime, 'classTime')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Diagnostic Test Date</label>
                  <p>{formatScheduleOption(student.diagnosticTestDate, 'diagnosticTest')}</p>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Update Status</h3>
              <div className="flex space-x-2">
                {['pending', 'reviewed', 'contacted'].map((status) => (
                  <Button
                    key={status}
                    variant={student.status === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onStatusUpdate(student._id, status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Trafft Integration Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Trafft Booking Platform</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Created</label>
                    <div className="flex items-center mt-1">
                      {student.trafftCustomerCreated ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-green-700 font-medium">Yes</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-sm text-red-700 font-medium">No</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer ID</label>
                    <p className="text-sm mt-1">{student.trafftCustomerId || 'Not available'}</p>
                  </div>
                </div>
                {student.trafftError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <label className="text-sm font-medium text-red-800">Error</label>
                    <p className="text-sm text-red-700 mt-1">{student.trafftError}</p>
                  </div>
                )}
                {student.trafftCustomerCreated && student.trafftCustomerId && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      ✅ Student can book appointments through the booking system
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Student Registrations</CardTitle>
            <div className="flex space-x-2">
              <Button 
                onClick={handleRefresh} 
                size="sm" 
                variant="outline"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button onClick={exportToCSV} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or school..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 border-[#457BF5]"
                />
              </div>
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-[#457BF5] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#457BF5] focus:border-[#457BF5] min-w-32"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="contacted">Contacted</option>
            </select>
            <select
              value={filters.classTime}
              onChange={(e) => setFilters(prev => ({ ...prev, classTime: e.target.value }))}
              className="border border-[#457BF5] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#457BF5] focus:border-[#457BF5] min-w-48"
              disabled={loadingScheduleOptions}
            >
              <option value="">All Class Times</option>
              {loadingScheduleOptions ? (
                <option disabled>Loading...</option>
              ) : (
                classTimeOptions.map((classTime) => (
                  <option key={classTime.name || classTime} value={classTime.name || classTime}>
                    {classTime.name || classTime}
                  </option>
                ))
              )}
            </select>
            <select
              value={filters.diagnosticTest}
              onChange={(e) => setFilters(prev => ({ ...prev, diagnosticTest: e.target.value }))}
              className="border border-[#457BF5] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#457BF5] focus:border-[#457BF5] min-w-48"
              disabled={loadingScheduleOptions}
            >
              <option value="">All Diagnostic Tests</option>
              {loadingScheduleOptions ? (
                <option disabled>Loading...</option>
              ) : (
                diagnosticTestOptions.map((diagnosticTest) => (
                  <option key={diagnosticTest.name || diagnosticTest} value={diagnosticTest.name || diagnosticTest}>
                    {diagnosticTest.name || diagnosticTest}
                  </option>
                ))
              )}
            </select>
            {(filters.search || filters.status || filters.classTime || filters.diagnosticTest) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ search: '', status: '', classTime: '', diagnosticTest: '' })}
                className="px-3 py-2"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Student</th>
                    <th className="text-left p-4">Contact</th>
                    <th className="text-left p-4">Academic</th>
                    <th className="text-left p-4">Class Time</th>
                    <th className="text-left p-4">Diagnostic Test</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Submitted</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{student.firstName || 'N/A'} {student.lastName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{student.highSchoolName || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-sm">{student.email || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{student.phoneNumber || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-sm">GPA: {student.currentGPA || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{student.universitiesWant || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          {editingStudent === student._id ? (
                            <select
                              value={editForm.classTime}
                              onChange={(e) => setEditForm({...editForm, classTime: e.target.value})}
                              className="text-sm border rounded px-2 py-1 w-full max-w-xs"
                              disabled={loadingScheduleOptions}
                            >
                              <option value="">Select Class Time</option>
                              {loadingScheduleOptions ? (
                                <option disabled>Loading...</option>
                              ) : (
                                classTimeOptions.map((option) => (
                                  <option key={option.name || option} value={option.name || option}>
                                    {option.name || option}
                                  </option>
                                ))
                              )}
                            </select>
                          ) : (
                            <div className="text-sm font-medium">
                              {formatScheduleOption(student.classTime, 'classTime')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          {editingStudent === student._id ? (
                            <select
                              value={editForm.diagnosticTestDate}
                              onChange={(e) => setEditForm({...editForm, diagnosticTestDate: e.target.value})}
                              className="text-sm border rounded px-2 py-1 w-full max-w-xs"
                              disabled={loadingScheduleOptions}
                            >
                              <option value="">Select Diagnostic Test</option>
                              {loadingScheduleOptions ? (
                                <option disabled>Loading...</option>
                              ) : (
                                diagnosticTestOptions.map((option) => (
                                  <option key={option.name || option} value={option.name || option}>
                                    {option.name || option}
                                  </option>
                                ))
                              )}
                            </select>
                          ) : (
                            <div className="text-sm font-medium">
                              {formatScheduleOption(student.diagnosticTestDate, 'diagnosticTest')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(student.status)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {student.submittedAt ? new Date(student.submittedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          {editingStudent === student._id ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditSave(student._id)}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleEditCancel}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditStart(student)}
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedStudent(student)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setDeleteModal({ isOpen: true, student: student })}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalStudents || 0)} of {pagination.totalStudents || 0} students
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={!pagination.hasNext}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onStatusUpdate={(id, status) => {
            updateStudentStatus(id, status)
            setSelectedStudent(null)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        student={deleteModal.student}
        onClose={() => setDeleteModal({ isOpen: false, student: null })}
        onConfirm={handleDeleteStudent}
      />
    </div>
  )
}

export default StudentTable