"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  MapPin
} from 'lucide-react'
import { toast } from 'sonner'

export default function DiagnosticTestManagement() {
  const [diagnosticTests, setDiagnosticTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'inactive', 'upcoming', 'past'
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    timezone: 'PST',
    capacity: 100,
    location: 'Online',
    description: '',
    instructions: '',
    sortOrder: 0,
    duration: 210,
    isActive: true
  })

  const timezones = ['PST', 'MST', 'CST', 'EST', 'Pacific', 'Mountain', 'Central', 'Eastern']

  useEffect(() => {
    fetchDiagnosticTests()
  }, [])

  const fetchDiagnosticTests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/diagnostic-tests?includeEnrollment=true')
      
      if (!response.ok) {
        throw new Error('Failed to fetch diagnostic tests')
      }
      
      const data = await response.json()
      setDiagnosticTests(data.diagnosticTests || [])
    } catch (error) {
      console.error('Error fetching diagnostic tests:', error)
      toast.error('Failed to load diagnostic tests')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      startTime: '',
      endTime: '',
      timezone: 'PST',
      capacity: 100,
      location: 'Online',
      description: '',
      instructions: '',
      sortOrder: 0,
      duration: 210,
      isActive: true
    })
    setShowCreateForm(false)
    setEditingTest(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate date is in the future
    const testDate = new Date(formData.date)
    if (testDate <= new Date()) {
      toast.error('Test date must be in the future')
      return
    }

    try {
      const url = editingTest 
        ? `/api/diagnostic-tests/${editingTest._id}`
        : '/api/diagnostic-tests'
      
      const method = editingTest ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save diagnostic test')
      }

      toast.success(editingTest ? 'Diagnostic test updated successfully' : 'Diagnostic test created successfully')
      resetForm()
      fetchDiagnosticTests()
    } catch (error) {
      console.error('Error saving diagnostic test:', error)
      toast.error(error.message)
    }
  }

  const handleEdit = (test) => {
    setFormData({
      name: test.name,
      date: new Date(test.date).toISOString().split('T')[0], // Format for date input
      startTime: test.startTime,
      endTime: test.endTime,
      timezone: test.timezone,
      capacity: test.capacity,
      location: test.location || 'Online',
      description: test.description || '',
      instructions: test.instructions || '',
      sortOrder: test.sortOrder || 0,
      duration: test.duration || 210,
      isActive: test.isActive
    })
    setEditingTest(test)
    setShowCreateForm(true)
  }

  const handleDelete = async (test) => {
    if (!confirm(`Are you sure you want to delete "${test.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/diagnostic-tests/${test._id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete diagnostic test')
      }

      toast.success('Diagnostic test deleted successfully')
      fetchDiagnosticTests()
    } catch (error) {
      console.error('Error deleting diagnostic test:', error)
      toast.error(error.message)
    }
  }

  const handleToggleActive = async (test) => {
    try {
      const response = await fetch(`/api/diagnostic-tests/${test._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !test.isActive })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update diagnostic test status')
      }

      toast.success(`Diagnostic test ${!test.isActive ? 'activated' : 'deactivated'} successfully`)
      fetchDiagnosticTests()
    } catch (error) {
      console.error('Error updating diagnostic test status:', error)
      toast.error(error.message)
    }
  }

  const getStatusBadge = (test) => {
    const now = new Date()
    const testDate = new Date(test.date)
    
    if (!test.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    
    if (testDate < now) {
      return <Badge className="bg-gray-100 text-gray-800">Past</Badge>
    }
    
    if (test.currentEnrollment >= test.capacity) {
      return <Badge className="bg-red-100 text-red-800">Full</Badge>
    }
    
    return <Badge className="bg-green-100 text-green-800">Available</Badge>
  }

  const getEnrollmentIcon = (test) => {
    const now = new Date()
    const testDate = new Date(test.date)
    
    if (testDate < now) {
      return <Clock className="h-4 w-4 text-gray-600" />
    }
    
    if (test.currentEnrollment >= test.capacity) {
      return <AlertCircle className="h-4 w-4 text-red-600" />
    }
    
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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

  const filteredTests = diagnosticTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const now = new Date()
    const testDate = new Date(test.date)
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && test.isActive) ||
                         (statusFilter === 'inactive' && !test.isActive) ||
                         (statusFilter === 'upcoming' && testDate >= now) ||
                         (statusFilter === 'past' && testDate < now)
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Diagnostic Test Management</h2>
          <p className="text-gray-600">Manage diagnostic test schedules and enrollment</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Diagnostic Test
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search diagnostic tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Tests</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic Tests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <Card key={test._id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                </div>
                {getStatusBadge(test)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date and Time Info */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(test.date)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(test.startTime)} - {formatTime(test.endTime)} {test.timezone}</span>
                </div>
                {test.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{test.location}</span>
                  </div>
                )}
              </div>

              {/* Enrollment Info */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getEnrollmentIcon(test)}
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">
                    {test.currentEnrollment}/{test.capacity}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {test.duration} min
                </span>
              </div>

              {/* Description */}
              {test.description && (
                <p className="text-sm text-gray-600">{test.description}</p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`active-${test._id}`} className="text-sm">
                    Active
                  </Label>
                  <Switch
                    id={`active-${test._id}`}
                    checked={test.isActive}
                    onCheckedChange={() => handleToggleActive(test)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(test)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(test)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No diagnostic tests found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'No tests match your search criteria.' 
                : 'Get started by creating your first diagnostic test.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Diagnostic Test
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">
                {editingTest ? 'Edit Diagnostic Test' : 'Create New Diagnostic Test'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name">Test Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Saturday September 27th 8:30am - noon PST"
                    required
                  />
                </div>

                {/* Date */}
                <div>
                  <Label htmlFor="date">Test Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>

                {/* Time and Timezone */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      value={formData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Capacity and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                {/* Location and Sort Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Online, Room 101, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-20 resize-none"
                    placeholder="Optional description of the test..."
                  />
                </div>

                {/* Instructions */}
                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-20 resize-none"
                    placeholder="Test instructions for students..."
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Active (visible to students)</Label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTest ? 'Update Test' : 'Create Test'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
