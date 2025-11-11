"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Mail, Phone, User, Calendar, Clock } from "lucide-react"

const StudentListModal = ({ isOpen, onClose, title, filterType, filterValue }) => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && filterType && filterValue) {
      fetchStudents()
    }
  }, [isOpen, filterType, filterValue])

  const fetchStudents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        limit: '100', // Get more students for the modal
        [filterType]: filterValue
      })
      
      const response = await fetch(`/api/students?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setStudents(data.students || [])
      } else {
        setError('Failed to fetch students')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('Error loading students')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800', 
      contacted: 'bg-green-100 text-green-800'
    }

    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </Badge>
    )
  }

  const formatClassTime = (classTime) => {
    if (!classTime) return 'N/A'
    return classTime.replace(' Pacific', '')
  }

  const formatDiagnosticDate = (diagnosticDate) => {
    if (!diagnosticDate) return 'N/A'
    
    if (diagnosticDate.includes('Saturday')) return 'Saturday Sept 27'
    if (diagnosticDate.includes('Sunday')) return 'Sunday Sept 28'
    return 'Cannot Attend'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-gray-600 mt-1">
                {loading ? 'Loading...' : `${students.length} student${students.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded">
                  <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">{error}</div>
              <Button onClick={fetchStudents} variant="outline">
                Try Again
              </Button>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">No students found for this selection</div>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <Card key={student._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Student Name & Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <h3 className="font-medium text-gray-900">
                            {student.firstName || 'N/A'} {student.lastName || 'N/A'}
                          </h3>
                        </div>
                        {getStatusBadge(student.status)}
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{student.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{student.phoneNumber || 'N/A'}</span>
                        </div>
                      </div>

                      {/* School & Academic Info */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                          <div><strong>School:</strong> {student.highSchoolName || 'N/A'}</div>
                          <div><strong>GPA:</strong> {student.currentGPA || 'N/A'}</div>
                        </div>
                      </div>

                      {/* Schedule Info */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatClassTime(student.classTime)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDiagnosticDate(student.diagnosticTestDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Submitted Date */}
                      <div className="text-xs text-gray-400">
                        Registered: {student.submittedAt ? new Date(student.submittedAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {!loading && !error && students.length > 0 && (
                `Total: ${students.length} student${students.length !== 1 ? 's' : ''}`
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {students.length > 0 && (
                <Button onClick={() => {
                  // Export functionality could be added here
                  const csvContent = students.map(s => 
                    `"${s.firstName} ${s.lastName}","${s.email}","${s.phoneNumber}","${s.highSchoolName}","${s.classTime}","${s.diagnosticTestDate}"`
                  ).join('\n')
                  const blob = new Blob([`Name,Email,Phone,School,Class Time,Diagnostic Test\n${csvContent}`], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `students_${filterValue.replace(/[^a-zA-Z0-9]/g, '_')}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                }}>
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
export default StudentListModal
