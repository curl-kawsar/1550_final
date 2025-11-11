"use client"

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Upload, 
  Eye, 
  Edit2, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  RefreshCw,
  Download,
  FileText,
  Users,
  BarChart3,
  Clock
} from 'lucide-react'
import { toast } from "sonner"

const AssignmentManagement = () => {
  const [activeTab, setActiveTab] = useState('list') // 'list', 'create', 'upload'
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const fileInputRef = useRef(null)
  const queryClient = useQueryClient()

  // Fetch assignments
  const { data: assignmentsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const response = await fetch('/api/assignments')
      if (!response.ok) {
        throw new Error('Failed to fetch assignments')
      }
      return response.json()
    }
  })

  // Toggle assignment status
  const toggleAssignmentMutation = useMutation({
    mutationFn: async (assignmentId) => {
      const response = await fetch(`/api/assignments/${assignmentId}/toggle`, {
        method: 'PATCH'
      })
      if (!response.ok) {
        throw new Error('Failed to toggle assignment status')
      }
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to toggle assignment status')
    }
  })

  // Delete assignment
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId) => {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('Failed to delete assignment')
      }
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      setSelectedAssignment(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete assignment')
    }
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

  const getStatusBadge = (assignment) => {
    return assignment.isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    )
  }

  const assignments = assignmentsData?.assignments || []
  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.isActive).length,
    inactive: assignments.filter(a => !a.isActive).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Assignment Management</h2>
          <p className="mt-2 text-gray-600">
            Create and manage assignments for students
          </p>
        </div>
        <div className="flex space-x-2">
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
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <ToggleRight className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Assignments</p>
                <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <ToggleLeft className="h-12 w-12 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assignment List
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Create Assignment
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upload CSV
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <AssignmentList 
          assignments={assignments}
          isLoading={isLoading}
          onToggleStatus={toggleAssignmentMutation.mutate}
          onDelete={deleteAssignmentMutation.mutate}
          onView={setSelectedAssignment}
          isToggling={toggleAssignmentMutation.isPending}
          isDeleting={deleteAssignmentMutation.isPending}
        />
      )}

      {activeTab === 'create' && (
        <CreateAssignment onSuccess={() => setActiveTab('list')} />
      )}

      {activeTab === 'upload' && (
        <UploadCSV onSuccess={() => setActiveTab('list')} />
      )}

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}
    </div>
  )
}

// Assignment List Component
const AssignmentList = ({ assignments, isLoading, onToggleStatus, onDelete, onView, isToggling, isDeleting }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
        <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </CardContent>
        </Card>
      </div>
        ))}
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first assignment.</p>
        </CardContent>
      </Card>
    )
  }

  return (
            <div className="space-y-4">
              {assignments.map((assignment) => (
        <Card key={assignment._id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
                    <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                  <Badge className={assignment.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {assignment.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                
                <p className="text-gray-600 mb-3">{assignment.description || 'No description'}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{assignment.totalQuestions} questions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                        <span>{assignment.timeLimit} minutes</span>
                      </div>
                  <div className="flex items-center space-x-1">
                    <span>Created by {assignment.createdBy?.firstName} {assignment.createdBy?.lastName}</span>
                    </div>
                  <div>
                    <span>{new Date(assignment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                      <Button
                  variant="outline"
                        size="sm"
                  onClick={() => onView(assignment)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                
                      <Button
                  variant="outline"
                        size="sm"
                  onClick={() => onToggleStatus(assignment._id)}
                  disabled={isToggling}
                  className={assignment.isActive ? "text-orange-600 border-orange-600 hover:bg-orange-50" : "text-green-600 border-green-600 hover:bg-green-50"}
                      >
                  {assignment.isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                      </Button>
                
                      <Button
                  variant="outline"
                        size="sm"
                  onClick={() => onDelete(assignment._id)}
                  disabled={isDeleting}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
        </CardContent>
      </Card>
      ))}
              </div>
  )
}

// Create Assignment Component
const CreateAssignment = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 60,
    questions: [
      {
        question: '',
        instruction: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        answer: 'A'
      }
    ]
  })

  const queryClient = useQueryClient()

  const createAssignmentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create assignment')
      }
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    
    const validQuestions = formData.questions.filter(q => 
      q.question.trim() && q.optionA.trim() && q.optionB.trim() && q.optionC.trim() && q.optionD.trim()
    )
    
    if (validQuestions.length === 0) {
      toast.error('At least one complete question is required')
      return
    }
    
    createAssignmentMutation.mutate({
      ...formData,
      questions: validQuestions
    })
  }

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        instruction: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        answer: 'A'
      }]
    }))
  }

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const updateQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
              <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter assignment title"
                    required
                  />
                </div>
            
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    value={formData.timeLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter assignment description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
                />
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-medium">Questions</Label>
                  <Button type="button" onClick={addQuestion} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
                
                {formData.questions.map((question, index) => (
              <Card key={index} className="border-2 border-gray-200">
                <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        {formData.questions.length > 1 && (
                          <Button
                            type="button"
                        variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                </CardHeader>
                <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Question *</Label>
                        <textarea
                          value={question.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          placeholder="Enter the question"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Instruction (optional)</Label>
                        <Input
                          value={question.instruction}
                      onChange={(e) => updateQuestion(index, 'instruction', e.target.value)}
                      placeholder="Additional instructions for this question"
                        />
                      </div>
                      
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Option A *</Label>
                          <Input
                            value={question.optionA}
                        onChange={(e) => updateQuestion(index, 'optionA', e.target.value)}
                            placeholder="Option A"
                            required
                          />
                        </div>
                    
                        <div className="space-y-2">
                          <Label>Option B *</Label>
                          <Input
                            value={question.optionB}
                        onChange={(e) => updateQuestion(index, 'optionB', e.target.value)}
                            placeholder="Option B"
                            required
                          />
                        </div>
                    
                        <div className="space-y-2">
                          <Label>Option C *</Label>
                          <Input
                            value={question.optionC}
                        onChange={(e) => updateQuestion(index, 'optionC', e.target.value)}
                            placeholder="Option C"
                            required
                          />
                        </div>
                    
                        <div className="space-y-2">
                          <Label>Option D *</Label>
                          <Input
                            value={question.optionD}
                        onChange={(e) => updateQuestion(index, 'optionD', e.target.value)}
                            placeholder="Option D"
                            required
                          />
                        </div>
                      </div>
                      
                        <div className="space-y-2">
                          <Label>Correct Answer *</Label>
                          <select
                            value={question.answer}
                      onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                </CardContent>
                  </Card>
                ))}
              </div>

          <div className="flex justify-end space-x-2">
                <Button
                  type="submit"
              disabled={createAssignmentMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createAssignmentMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Assignment'
              )}
                </Button>
              </div>
            </form>
      </CardContent>
    </Card>
  )
}

// Upload CSV Component
const UploadCSV = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 60,
    csvFile: null
  })
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const queryClient = useQueryClient()

  const uploadCSVMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData()
      formDataToSend.append('csvFile', data.csvFile)
      formDataToSend.append('title', data.title)
      formDataToSend.append('description', data.description)
      formDataToSend.append('timeLimit', data.timeLimit.toString())
      
      const response = await fetch('/api/assignments/upload-csv', {
        method: 'POST',
        body: formDataToSend
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload CSV')
      }
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(`${data.message} - ${data.questionsImported} questions imported`)
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    
    if (!formData.csvFile) {
      toast.error('CSV file is required')
      return
    }
    
    uploadCSVMutation.mutate(formData)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setFormData(prev => ({ ...prev, csvFile: file }))
      } else {
        toast.error('Please upload a CSV file')
      }
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, csvFile: file }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Assignment from CSV</CardTitle>
        <p className="text-sm text-gray-600">
          Upload a CSV file with columns: Question, Instruction, Option A, Option B, Option C, Option D, Answer
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
              <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter assignment title"
                    required
                  />
                </div>
            
                <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                id="timeLimit"
                    type="number"
                    min="1"
                value={formData.timeLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
                <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter assignment description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
            <Label>CSV File *</Label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                  type="file"
                  accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {formData.csvFile ? (
                  <span className="font-medium text-green-600">
                    {formData.csvFile.name}
                  </span>
                ) : (
                  <>
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500">CSV files only</p>
                  </div>
                </div>

          {/* CSV Format Example */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Expected CSV Format:</h4>
            <div className="text-xs font-mono text-gray-600 bg-white p-2 rounded border overflow-x-auto">
              <div>Question,Instruction,Option A,Option B,Option C,Option D,Answer</div>
              <div>"What is 2+2?","","2","3","4","5","C"</div>
              <div>"Capital of France?","","London","Paris","Berlin","Madrid","B"</div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
                <Button
                  type="submit"
              disabled={uploadCSVMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploadCSVMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Create
                </>
              )}
                </Button>
              </div>
            </form>
      </CardContent>
    </Card>
  )
}

// Assignment Detail Modal
const AssignmentDetailModal = ({ assignment, onClose }) => {
  return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
          <div className="flex justify-between items-start">
                <div>
              <h2 className="text-2xl font-bold">{assignment.title}</h2>
              <p className="text-gray-600 mt-1">{assignment.description || 'No description'}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{assignment.totalQuestions} questions</span>
                <span>{assignment.timeLimit} minutes</span>
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
          <h3 className="text-lg font-semibold mb-4">Questions ({assignment.questions?.length || 0})</h3>
          <div className="space-y-6">
            {assignment.questions?.map((question, index) => (
              <Card key={question._id || index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900">
                        Question {index + 1}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Answer: {question.answer}
                      </Badge>
              </div>

                    <p className="text-gray-800">{question.question}</p>
                    
                        {question.instruction && (
                      <p className="text-sm text-gray-600 italic">
                        Instructions: {question.instruction}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className={`p-2 rounded ${question.answer === 'A' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                        <strong>A:</strong> {question.optionA}
                          </div>
                      <div className={`p-2 rounded ${question.answer === 'B' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                        <strong>B:</strong> {question.optionB}
                          </div>
                      <div className={`p-2 rounded ${question.answer === 'C' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                        <strong>C:</strong> {question.optionC}
                          </div>
                      <div className={`p-2 rounded ${question.answer === 'D' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                        <strong>D:</strong> {question.optionD}
                          </div>
                        </div>
                      </div>
                </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
    </div>
  )
}

export default AssignmentManagement
