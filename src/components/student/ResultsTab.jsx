"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Clock, 
  FileText, 
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Target,
  Calendar,
  Award,
  Eye
} from 'lucide-react'
import { toast } from "sonner"
import AssignmentReview from './AssignmentReview'

const ResultsTab = ({ student }) => {
  const [refreshing, setRefreshing] = useState(false)
  const [reviewingSubmission, setReviewingSubmission] = useState(null)

  // Fetch student results
  const { data: resultsData, isLoading, refetch, isRefetching, error } = useQuery({
    queryKey: ['student-results'],
    queryFn: async () => {
      const response = await fetch('/api/assignments/results/student')
      if (!response.ok) {
        throw new Error('Failed to fetch results')
      }
      return response.json()
    }
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast.success('Results refreshed')
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
  }

  const results = resultsData?.results || []

  // Calculate statistics
  const stats = {
    totalAssignments: results.length,
    averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) : 0,
    highestScore: results.length > 0 ? Math.max(...results.map(r => r.percentage)) : 0,
    totalTimeSpent: results.reduce((sum, r) => sum + r.timeSpent, 0),
    gradeDistribution: {
      A: results.filter(r => r.grade === 'A').length,
      B: results.filter(r => r.grade === 'B').length,
      C: results.filter(r => r.grade === 'C').length,
      D: results.filter(r => r.grade === 'D').length,
      F: results.filter(r => r.grade === 'F').length,
    }
  }

  const getGradeBadgeColor = (grade) => {
    const colors = {
      'A': 'bg-green-100 text-green-800 border-green-200',
      'B': 'bg-blue-100 text-blue-800 border-blue-200',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'D': 'bg-orange-100 text-orange-800 border-orange-200',
      'F': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[grade] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
  }

  const formatTotalTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Assignment Results</h3>
            <p className="text-gray-600">View your performance and progress</p>
          </div>
          <div className="animate-pulse w-20 h-8 bg-gray-200 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
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
            <h3 className="text-2xl font-bold text-gray-900">Assignment Results</h3>
            <p className="text-gray-600">View your performance and progress</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load results</h3>
            <p className="text-gray-500 mb-4">There was an error loading your assignment results.</p>
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
          <h3 className="text-2xl font-bold text-gray-900">Assignment Results</h3>
          <p className="text-gray-600">View your performance and progress</p>
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

      {results.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results yet</h3>
            <p className="text-gray-500">Complete some assignments to see your results here.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Assignments Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalAssignments}</p>
                  </div>
                  <FileText className="h-12 w-12 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-3xl font-bold text-green-600">{stats.averageScore}%</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Highest Score</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.highestScore}%</p>
                  </div>
                  <Target className="h-12 w-12 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Time</p>
                    <p className="text-3xl font-bold text-orange-600">{formatTotalTime(stats.totalTimeSpent)}</p>
                  </div>
                  <Clock className="h-12 w-12 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grade Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Grade Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                  <div key={grade} className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold mb-2 ${getGradeBadgeColor(grade)}`}>
                      {grade}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-500">assignments</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Results List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {result.assignmentTitle}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {result.assignmentDescription || 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getGradeBadgeColor(result.grade)}>
                          Grade {result.grade}
                        </Badge>
                        <Badge variant="outline">
                          {result.percentage}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          Score: <span className="font-medium text-gray-900">{result.correctAnswers}/{result.totalQuestions}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          Time: <span className="font-medium text-gray-900">{formatTime(result.timeSpent)}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          Date: <span className="font-medium text-gray-900">{new Date(result.submittedAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          Accuracy: <span className="font-medium text-gray-900">{result.percentage}%</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Button 
                        onClick={() => setReviewingSubmission(result._id)}
                        variant="outline" 
                        size="sm"
                        className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review Answers
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Assignment Review Modal */}
      {reviewingSubmission && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="min-h-screen py-8 px-4">
            <AssignmentReview
              assignmentId={reviewingSubmission}
              onBack={() => setReviewingSubmission(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultsTab
