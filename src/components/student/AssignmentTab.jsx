"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Clock, 
  Play, 
  CheckCircle2, 
  RefreshCw,
  AlertCircle,
  Trophy,
  Eye
} from 'lucide-react'
import { toast } from "sonner"
import AssignmentInterface from './AssignmentInterface'
import AssignmentReview from './AssignmentReview'

const AssignmentTab = ({ student }) => {
  const [refreshing, setRefreshing] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [reviewingAssignment, setReviewingAssignment] = useState(null)

  // Fetch assignments for student
  const { data: assignmentsData, isLoading, refetch, isRefetching, error } = useQuery({
    queryKey: ['student-assignments'],
    queryFn: async () => {
      const response = await fetch('/api/assignments/student')
      if (!response.ok) {
        throw new Error('Failed to fetch assignments')
      }
      return response.json()
    },
    refetchInterval: 30000, // Refresh every 30 seconds to check for new assignments
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast.success('Assignments refreshed')
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
  }

  const handleStartAssignment = (assignment) => {
    setSelectedAssignment(assignment)
  }

  const handleReviewAssignment = (assignment) => {
    if (assignment.submissionId) {
      setReviewingAssignment(assignment.submissionId)
    } else {
      toast.error('No submission found for this assignment')
    }
  }

  const assignments = assignmentsData?.assignments || []
  const completedCount = assignments.filter(a => a.isCompleted).length
  const activeCount = assignments.filter(a => !a.isCompleted).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Assignments</h3>
            <p className="text-gray-600">Complete your assignments to test your knowledge</p>
          </div>
          <div className="animate-pulse w-20 h-8 bg-gray-200 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Assignments</h3>
            <p className="text-gray-600">Complete your assignments to test your knowledge</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            variant="outline"
            disabled={refreshing || isRefetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(refreshing || isRefetching) ? 'animate-spin' : ''}`} />
            {(refreshing || isRefetching) ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load assignments</h3>
            <p className="text-gray-500 mb-4">There was an error loading your assignments.</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Assignments</h3>
          <p className="text-gray-600">Complete your assignments to test your knowledge</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          size="sm" 
          variant="outline"
          disabled={refreshing || isRefetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${(refreshing || isRefetching) ? 'animate-spin' : ''}`} />
          {(refreshing || isRefetching) ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
              </div>
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              </div>
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{activeCount}</p>
              </div>
              <Clock className="h-12 w-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments available</h3>
            <p className="text-gray-500">Your instructor hasn't assigned any assignments yet. Check back later!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment._id} className={`transition-all duration-200 hover:shadow-lg ${assignment.isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {assignment.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {assignment.description || 'No description available'}
                    </p>
                  </div>
                  <div className="ml-4">
                    {assignment.isCompleted ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{assignment.totalQuestions} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{assignment.timeLimit} min</span>
                    </div>
                  </div>
                  <div>
                    {new Date(assignment.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  {assignment.isCompleted ? (
                    <>
                      <Button 
                        onClick={() => handleReviewAssignment(assignment)}
                        variant="outline" 
                        size="sm"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review Answers
                      </Button>
                      <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                        <Trophy className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    </>
                  ) : (
                    <Button 
                      onClick={() => handleStartAssignment(assignment)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Assignment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {selectedAssignment && (
        <AssignmentModal
          assignment={selectedAssignment}
          student={student}
          onClose={() => setSelectedAssignment(null)}
          onComplete={() => {
            setSelectedAssignment(null)
            refetch() // Refresh assignments list
          }}
        />
      )}

      {/* Assignment Review */}
      {reviewingAssignment && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="min-h-screen py-8 px-4">
            <AssignmentReview
              assignmentId={reviewingAssignment}
              onBack={() => setReviewingAssignment(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Assignment Modal Component
const AssignmentModal = ({ assignment, student, onClose, onComplete }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{assignment.title}</h2>
              <p className="text-gray-600 mt-1">{assignment.description}</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>{assignment.totalQuestions} questions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{assignment.timeLimit} minutes</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You have {assignment.timeLimit} minutes to complete this assignment</li>
              <li>• You can only submit this assignment once</li>
              <li>• Make sure you have a stable internet connection</li>
              <li>• Review your answers before submitting</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <AssignmentInterface 
              assignment={assignment}
              student={student}
              onComplete={onComplete}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentTab
