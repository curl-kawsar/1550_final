"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trophy,
  Target,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Award
} from 'lucide-react'
import { toast } from "sonner"

const AssignmentReview = ({ assignmentId, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)

  // Fetch assignment review data (assignmentId is actually submissionId now)
  const { data: reviewData, isLoading, error, refetch } = useQuery({
    queryKey: ['assignment-review', assignmentId],
    queryFn: async () => {
      const response = await fetch(`/api/assignments/student-review/${assignmentId}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch assignment review')
      }
      return response.json()
    },
    enabled: !!assignmentId
  })

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading assignment review...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load review</h3>
            <p className="text-gray-500 mb-4">{error.message}</p>
            <div className="space-x-2">
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { assignment, submission, questions } = reviewData
  const currentQ = questions[currentQuestion]
  const correctCount = questions.filter(q => q.isCorrect).length
  const incorrectCount = questions.length - correctCount

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with Results Summary */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {assignment.title} - Review
              </CardTitle>
              <p className="text-gray-600">{assignment.description}</p>
            </div>
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assignments
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{submission.percentage}%</p>
              <p className="text-sm text-blue-700">Final Score</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{correctCount}</p>
              <p className="text-sm text-green-700">Correct</p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-900">{incorrectCount}</p>
              <p className="text-sm text-red-700">Incorrect</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <Badge className={`text-lg px-3 py-1 ${getGradeBadgeColor(submission.grade)}`}>
                Grade {submission.grade}
              </Badge>
              <p className="text-sm text-purple-700 mt-1">Letter Grade</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-900">{formatTime(submission.timeSpent)}</p>
              <p className="text-sm text-orange-700">Time Taken</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Question {currentQuestion + 1} of {questions.length}</CardTitle>
            <div className="flex items-center space-x-2">
              {currentQ.isCorrect ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Correct
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">
                  <XCircle className="w-3 h-3 mr-1" />
                  Incorrect
                </Badge>
              )}
            </div>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Question */}
            <div>
              {currentQ.instruction && (
                <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded mb-4">
                  <strong>Instructions:</strong> {currentQ.instruction}
                </div>
              )}
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((option) => {
                const isStudentAnswer = currentQ.studentAnswer === option
                const isCorrectAnswer = currentQ.correctAnswer === option
                const isWrongChoice = isStudentAnswer && !isCorrectAnswer
                
                let className = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200 "
                
                if (isCorrectAnswer) {
                  className += "border-green-500 bg-green-50 text-green-900"
                } else if (isWrongChoice) {
                  className += "border-red-500 bg-red-50 text-red-900"
                } else {
                  className += "border-gray-200 bg-gray-50 text-gray-700"
                }

                return (
                  <div key={option} className={className}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                        isCorrectAnswer
                          ? 'border-green-500 bg-green-500 text-white'
                          : isWrongChoice
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-gray-300 text-gray-500'
                      }`}>
                        {option}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800">{currentQ.options[option]}</span>
                          <div className="flex items-center space-x-2">
                            {isStudentAnswer && (
                              <Badge variant="outline" className="text-xs">
                                Your Answer
                              </Badge>
                            )}
                            {isCorrectAnswer && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Correct Answer
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Explanation for wrong answers */}
            {!currentQ.isCorrect && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">Review</h4>
                    <p className="text-sm text-yellow-800">
                      You selected <strong>option {currentQ.studentAnswer}</strong>, but the correct answer is <strong>option {currentQ.correctAnswer}</strong>. 
                      Review the question and options above to understand why option {currentQ.correctAnswer} is correct.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous Question
            </Button>

            <div className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestion === questions.length - 1}
            >
              Next Question
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Overview Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Question Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((question, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded text-sm font-medium border-2 transition-all duration-200 ${
                  currentQuestion === index
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : question.isCorrect
                    ? 'border-green-500 bg-green-100 text-green-800'
                    : 'border-red-500 bg-red-100 text-red-800'
                }`}
                title={`Question ${index + 1}: ${question.isCorrect ? 'Correct' : 'Incorrect'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 border border-green-500 rounded"></div>
              <span>Correct</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-100 border border-red-500 rounded"></div>
              <span>Incorrect</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AssignmentReview
