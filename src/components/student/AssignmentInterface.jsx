"use client"

import { useState, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import { toast } from "sonner"

const AssignmentInterface = ({ assignment, student, onComplete, onCancel }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(assignment.timeLimit * 60) // Convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const timerRef = useRef(null)
  const startTimeRef = useRef(Date.now())

  // Fetch assignment details with questions
  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const response = await fetch(`/api/assignments/${assignment._id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch assignment details')
        }
        const data = await response.json()
        setQuestions(data.assignment.questions || [])
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching assignment:', error)
        toast.error('Failed to load assignment questions')
        onCancel()
      }
    }

    fetchAssignmentDetails()
  }, [assignment._id, onCancel])

  // Timer effect
  useEffect(() => {
    if (isLoading) return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isLoading])

  // Submit assignment mutation
  const submitAssignmentMutation = useMutation({
    mutationFn: async (submissionData) => {
      const response = await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit assignment')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      toast.success('Assignment submitted successfully!')
      onComplete(data.submission)
    },
    onError: (error) => {
      toast.error(error.message)
      setIsSubmitting(false)
    }
  })

  const handleTimeUp = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    toast.warning('Time is up! Submitting your assignment...')
    handleSubmit(true)
  }

  const handleAnswerSelect = (questionIndex, selectedAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedAnswer
    }))
  }

  const handleSubmit = (isAutoSubmit = false) => {
    if (isSubmitting) return

    const unansweredQuestions = questions.length - Object.keys(answers).length
    
    if (!isAutoSubmit && unansweredQuestions > 0) {
      const confirmed = window.confirm(
        `You have ${unansweredQuestions} unanswered question(s). Are you sure you want to submit?`
      )
      if (!confirmed) return
    }

    setIsSubmitting(true)
    
    // Calculate time spent
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)
    
    // Prepare answers array in correct order
    const answersArray = questions.map((_, index) => answers[index] || 'A')
    
    const submissionData = {
      assignmentId: assignment._id,
      answers: answersArray,
      timeSpent
    }

    submitAssignmentMutation.mutate(submissionData)
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length
  const isTimeRunningOut = timeLeft <= 300 // 5 minutes

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading assignment questions...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-500 mb-4">This assignment doesn't have any questions.</p>
            <Button onClick={onCancel} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with Timer and Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className={`w-5 h-5 ${isTimeRunningOut ? 'text-red-500' : 'text-gray-500'}`} />
                <span className={`font-mono text-lg ${isTimeRunningOut ? 'text-red-500 font-bold' : 'text-gray-900'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Answered: {answeredCount}/{questions.length}
              </div>
              <Badge variant={answeredCount === questions.length ? "default" : "secondary"}>
                {Math.round((answeredCount / questions.length) * 100)}% Complete
              </Badge>
            </div>
          </div>
          
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                Question {currentQuestion + 1}
              </CardTitle>
              {currentQ.instruction && (
                <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded mb-3">
                  <strong>Instructions:</strong> {currentQ.instruction}
                </div>
              )}
            </div>
            {answers[currentQuestion] && (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-lg text-gray-800 leading-relaxed">
            {currentQ.question}
          </div>
          
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswerSelect(currentQuestion, option)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${
                  answers[currentQuestion] === option
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    answers[currentQuestion] === option
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {option}
                  </div>
                  <div className="flex-1 text-gray-800">
                    {currentQ[`option${option}`]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation and Submit */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Assignment
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              {answeredCount === questions.length && (
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Now
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Question Navigator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded text-sm font-medium border-2 transition-all duration-200 ${
                  currentQuestion === index
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : answers[index]
                    ? 'border-green-500 bg-green-100 text-green-800'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}
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
              <span>Answered</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
              <span>Unanswered</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AssignmentInterface
