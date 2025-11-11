"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Users, 
  FileText, 
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Target,
  Clock,
  User,
  Calendar,
  Award,
  BarChart3,
  Eye,
  CheckCircle,
  XCircle,
  HelpCircle,
  
} from 'lucide-react'
import { toast } from "sonner"

const AssignmentResults = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  // Fetch all assignments for admin
  const { data: assignmentsData, isLoading, refetch, isRefetching, error } = useQuery({
    queryKey: ['admin-assignments-results'],
    queryFn: async () => {
      const response = await fetch('/api/assignments')
      if (!response.ok) {
        throw new Error('Failed to fetch assignments')
      }
      return response.json()
    }
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast.success('Assignment results refreshed')
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
  }

  const assignments = assignmentsData?.assignments || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Assignment Results</h2>
            <p className="mt-2 text-gray-600">View student performance across all assignments</p>
          </div>
          <div className="animate-pulse w-20 h-8 bg-gray-200 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <h2 className="text-3xl font-bold text-gray-900">Assignment Results</h2>
            <p className="mt-2 text-gray-600">View student performance across all assignments</p>
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
            <p className="text-gray-500 mb-4">There was an error loading assignment data.</p>
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
          <h2 className="text-3xl font-bold text-gray-900">Assignment Results</h2>
          <p className="mt-2 text-gray-600">View student performance across all assignments</p>
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

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments created</h3>
            <p className="text-gray-500">Create some assignments to see student results here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assignments.map((assignment) => (
            <AssignmentResultCard 
              key={assignment._id} 
              assignment={assignment}
              onViewDetails={setSelectedAssignment}
            />
          ))}
        </div>
      )}

      {/* Assignment Details Modal */}
      {selectedAssignment && (
        <AssignmentDetailsModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onViewSubmission={setSelectedSubmission}
        />
      )}

      {/* Student Answers Modal */}
      {selectedSubmission && (
        <StudentAnswersModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  )
}

// Assignment Result Card Component
const AssignmentResultCard = ({ assignment, onViewDetails }) => {
  const [resultData, setResultData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch results for this specific assignment
  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['assignment-results', assignment._id],
    queryFn: async () => {
      const response = await fetch(`/api/assignments/results/${assignment._id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch assignment results')
      }
      return response.json()
    },
    enabled: !!assignment._id
  })

  const stats = results?.statistics || {
    totalSubmissions: 0,
    averageScore: 0,
    averagePercentage: 0,
    highestScore: 0,
    lowestScore: 0,
    gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 }
  }

  const getStatusBadge = (assignment) => {
    return assignment.isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {assignment.title}
              </CardTitle>
              {getStatusBadge(assignment)}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {assignment.description || 'No description available'}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {resultsLoading ? (
          <div className="space-y-3">
            <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="animate-pulse h-8 bg-gray-200 rounded w-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Assignment Info */}
            <div className="flex items-center justify-between text-sm text-gray-500">
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

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Submissions</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalSubmissions}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Avg Score</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.averagePercentage}%</p>
              </div>
            </div>

            {/* Grade Distribution */}
            {stats.totalSubmissions > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Grade Distribution</h4>
                <div className="flex space-x-1">
                  {Object.entries(stats.gradeDistribution).map(([grade, count]) => {
                    const colors = {
                      'A': 'bg-green-500',
                      'B': 'bg-blue-500',
                      'C': 'bg-yellow-500',
                      'D': 'bg-orange-500',
                      'F': 'bg-red-500'
                    }
                    const percentage = stats.totalSubmissions > 0 ? (count / stats.totalSubmissions) * 100 : 0
                    
                    return (
                      <div
                        key={grade}
                        className={`h-2 ${colors[grade]} rounded-full flex-1`}
                        style={{ width: `${percentage}%` }}
                        title={`Grade ${grade}: ${count} students (${Math.round(percentage)}%)`}
                      />
                    )
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                    <span key={grade}>{grade}: {count}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              <Button 
                onClick={() => onViewDetails(assignment)}
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Detailed Results
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Assignment Details Modal Component
const AssignmentDetailsModal = ({ assignment, onClose, onViewSubmission }) => {
  const { data: results, isLoading } = useQuery({
    queryKey: ['assignment-details', assignment._id],
    queryFn: async () => {
      const response = await fetch(`/api/assignments/results/${assignment._id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch assignment details')
      }
      return response.json()
    }
  })

  const stats = results?.statistics || {}
  const submissions = results?.results || []

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getGradeBadgeColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800 border-green-200'
    if (percentage >= 80) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (percentage >= 60) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    return 'F'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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
                <Badge className={assignment.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {assignment.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions || 0}</p>
                    <p className="text-sm text-gray-600">Total Submissions</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats.averagePercentage || 0}%</p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats.highestScore || 0}%</p>
                    <p className="text-sm text-gray-600">Highest Score</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats.lowestScore || 0}%</p>
                    <p className="text-sm text-gray-600">Lowest Score</p>
                  </CardContent>
                </Card>
              </div>

              {/* Student Submissions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Submissions</h3>
                
                {submissions.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h4>
                      <p className="text-gray-500">Students haven't submitted this assignment yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <Card key={submission._id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  {submission.studentId?.firstName} {submission.studentId?.lastName}
                                </h4>
                                <Badge className={getGradeBadgeColor(submission.percentage)}>
                                  Grade {getGradeLetter(submission.percentage)}
                                </Badge>
                                <Badge variant="outline">
                                  {submission.percentage}%
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-3">
                                {submission.studentId?.email}
                              </p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Target className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600">
                                    Score: <span className="font-medium text-gray-900">{submission.correctAnswers}/{submission.totalQuestions}</span>
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600">
                                    Time: <span className="font-medium text-gray-900">{formatTime(submission.timeSpent)}</span>
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600">
                                    Date: <span className="font-medium text-gray-900">{new Date(submission.submittedAt).toLocaleDateString()}</span>
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Award className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600">
                                    Accuracy: <span className="font-medium text-gray-900">{submission.percentage}%</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Button 
                                onClick={() => onViewSubmission(submission)}
                                variant="outline" 
                                size="sm"
                                className="w-full"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Answers
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Student Answers Modal Component
const StudentAnswersModal = ({ submission, onClose }) => {
  const [detailedSubmission, setDetailedSubmission] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch detailed submission data with questions and answers
  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/assignments/admin-review/${submission._id}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch submission details')
        }
        const data = await response.json()
        setDetailedSubmission(data.submission)
      } catch (error) {
        console.error('Error fetching submission details:', error)
        toast.error(`Failed to load submission details: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (submission._id) {
      fetchSubmissionDetails()
    }
  }, [submission._id])

  const getAnswerIcon = (isCorrect) => {
    return isCorrect ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    )
  }

  const getAnswerBadge = (isCorrect) => {
    return isCorrect ? (
      <Badge className="bg-green-100 text-green-800">Correct</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Incorrect</Badge>
    )
  }

  const getGradeBadgeColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800 border-green-200'
    if (percentage >= 80) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (percentage >= 60) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    return 'F'
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Student Answers: {submission.studentId?.firstName} {submission.studentId?.lastName}
              </h2>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className={getGradeBadgeColor(submission.percentage)}>
                  Grade {getGradeLetter(submission.percentage)}
                </Badge>
                <Badge variant="outline">
                  {submission.correctAnswers}/{submission.totalQuestions} Correct
                </Badge>
                <Badge variant="outline">
                  {submission.percentage}% Score
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-20 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : detailedSubmission ? (
            <div className="space-y-6">
              {detailedSubmission.assignmentId?.questions?.map((question, index) => {
                const studentAnswerObj = detailedSubmission.answers[index]
                const studentAnswer = studentAnswerObj?.selectedAnswer || null
                const isCorrect = studentAnswer === question.answer

                return (
                  <Card key={index} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Question Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Question {index + 1}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getAnswerIcon(isCorrect)}
                            {getAnswerBadge(isCorrect)}
                          </div>
                        </div>

                        {/* Question Text */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-800 font-medium">{question.question}</p>
                        </div>

                        {/* Answer Options */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700">Answer Options:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {question.options.map((option, optionIndex) => {
                              const optionLetter = String.fromCharCode(65 + optionIndex) // A, B, C, D
                              const isStudentAnswer = studentAnswer === optionLetter
                              const isCorrectAnswer = question.answer === optionLetter

                              return (
                                <div
                                  key={optionIndex}
                                  className={`p-3 rounded-lg border-2 ${
                                    isCorrectAnswer 
                                      ? 'border-green-500 bg-green-50' 
                                      : isStudentAnswer 
                                        ? 'border-red-500 bg-red-50' 
                                        : 'border-gray-200 bg-white'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                      isCorrectAnswer
                                        ? 'bg-green-500 text-white'
                                        : isStudentAnswer
                                          ? 'bg-red-500 text-white'
                                          : 'bg-gray-200 text-gray-600'
                                    }`}>
                                      {optionLetter}
                                    </div>
                                    <span className={`flex-1 ${
                                      isCorrectAnswer ? 'text-green-800 font-medium' : 
                                      isStudentAnswer ? 'text-red-800' : 'text-gray-700'
                                    }`}>
                                      {option}
                                    </span>
                                    {isCorrectAnswer && (
                                      <CheckCircle className="w-5 h-5 text-green-500" />
                                    )}
                                    {isStudentAnswer && !isCorrectAnswer && (
                                      <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Answer Summary */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Student Answer: </span>
                              <span className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                {studentAnswer || 'No Answer'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Correct Answer: </span>
                              <span className="font-medium text-green-800">{question.answer}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Points: </span>
                              <span className="font-medium text-gray-900">
                                {isCorrect ? question.points : 0}/{question.points}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Summary Footer */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Assignment Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-blue-900">{submission.correctAnswers}</p>
                        <p className="text-sm text-blue-700">Correct Answers</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-900">{submission.totalQuestions - submission.correctAnswers}</p>
                        <p className="text-sm text-blue-700">Incorrect Answers</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-900">{submission.percentage}%</p>
                        <p className="text-sm text-blue-700">Final Score</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-900">{formatTime(submission.timeSpent)}</p>
                        <p className="text-sm text-blue-700">Time Spent</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load answers</h3>
                <p className="text-gray-500">The detailed answers for this submission could not be loaded.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default AssignmentResults
