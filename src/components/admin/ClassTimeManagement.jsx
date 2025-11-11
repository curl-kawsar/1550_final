"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

export default function ClassTimeManagement() {
  const [classTimes, setClassTimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingClassTime, setEditingClassTime] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'inactive'
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dayOfWeek: [],
    startTime: '',
    endTime: '',
    timezone: 'Pacific',
    capacity: 50,
    minimumRequired: 40,
    description: '',
    sortOrder: 0,
    isActive: true
  })

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const timezones = ['Pacific', 'Mountain', 'Central', 'Eastern']

  useEffect(() => {
    fetchClassTimes()
  }, [])

  const fetchClassTimes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/class-times?includeEnrollment=true')
      
      if (!response.ok) {
        throw new Error('Failed to fetch class times')
      }
      
      const data = await response.json()
      setClassTimes(data.classTimes || [])
    } catch (error) {
      console.error('Error fetching class times:', error)
      toast.error('Failed to load class times')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      dayOfWeek: prev.dayOfWeek.includes(day)
        ? prev.dayOfWeek.filter(d => d !== day)
        : [...prev.dayOfWeek, day]
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      dayOfWeek: [],
      startTime: '',
      endTime: '',
      timezone: 'Pacific',
      capacity: 50,
      minimumRequired: 40,
      description: '',
      sortOrder: 0,
      isActive: true
    })
    setShowCreateForm(false)
    setEditingClassTime(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || formData.dayOfWeek.length === 0 || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const url = editingClassTime 
        ? `/api/class-times/${editingClassTime._id}`
        : '/api/class-times'
      
      const method = editingClassTime ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save class time')
      }

      toast.success(editingClassTime ? 'Class time updated successfully' : 'Class time created successfully')
      resetForm()
      fetchClassTimes()
    } catch (error) {
      console.error('Error saving class time:', error)
      toast.error(error.message)
    }
  }

  const handleEdit = (classTime) => {
    setFormData({
      name: classTime.name,
      dayOfWeek: classTime.dayOfWeek,
      startTime: classTime.startTime,
      endTime: classTime.endTime,
      timezone: classTime.timezone,
      capacity: classTime.capacity,
      minimumRequired: classTime.minimumRequired,
      description: classTime.description || '',
      sortOrder: classTime.sortOrder || 0,
      isActive: classTime.isActive
    })
    setEditingClassTime(classTime)
    setShowCreateForm(true)
  }

  const handleDelete = async (classTime) => {
    if (!confirm(`Are you sure you want to delete "${classTime.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/class-times/${classTime._id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete class time')
      }

      toast.success('Class time deleted successfully')
      fetchClassTimes()
    } catch (error) {
      console.error('Error deleting class time:', error)
      toast.error(error.message)
    }
  }

  const handleToggleActive = async (classTime) => {
    try {
      const response = await fetch(`/api/class-times/${classTime._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !classTime.isActive })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update class time status')
      }

      toast.success(`Class time ${!classTime.isActive ? 'activated' : 'deactivated'} successfully`)
      fetchClassTimes()
    } catch (error) {
      console.error('Error updating class time status:', error)
      toast.error(error.message)
    }
  }

  const getStatusBadge = (classTime) => {
    if (!classTime.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    
    if (classTime.currentEnrollment >= classTime.capacity) {
      return <Badge className="bg-red-100 text-red-800">Full</Badge>
    }
    
    if (classTime.currentEnrollment >= classTime.minimumRequired) {
      return <Badge className="bg-green-100 text-green-800">Available</Badge>
    }
    
    return <Badge className="bg-yellow-100 text-yellow-800">Needs Students</Badge>
  }

  const getEnrollmentIcon = (classTime) => {
    if (classTime.currentEnrollment >= classTime.minimumRequired) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    return <AlertCircle className="h-4 w-4 text-yellow-600" />
  }

  const filteredClassTimes = classTimes.filter(classTime => {
    const matchesSearch = classTime.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classTime.dayOfWeek.some(day => day.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && classTime.isActive) ||
                         (statusFilter === 'inactive' && !classTime.isActive)
    
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
          <h2 className="text-2xl font-bold text-gray-900">Class Time Management</h2>
          <p className="text-gray-600">Manage class schedules and time slots</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Class Time
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
                  placeholder="Search class times..."
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
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Times List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClassTimes.map((classTime) => (
          <Card key={classTime._id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{classTime.name}</CardTitle>
                </div>
                {getStatusBadge(classTime)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Schedule Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{classTime.dayOfWeek.join(', ')}</span>
                </div>
                <div className="text-sm font-medium">
                  {classTime.startTime} - {classTime.endTime} {classTime.timezone}
                </div>
              </div>

              {/* Enrollment Info */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getEnrollmentIcon(classTime)}
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">
                    {classTime.currentEnrollment}/{classTime.capacity}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  Min: {classTime.minimumRequired}
                </span>
              </div>

              {/* Description */}
              {classTime.description && (
                <p className="text-sm text-gray-600">{classTime.description}</p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`active-${classTime._id}`} className="text-sm">
                    Active
                  </Label>
                  <Switch
                    id={`active-${classTime._id}`}
                    checked={classTime.isActive}
                    onCheckedChange={() => handleToggleActive(classTime)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(classTime)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(classTime)}
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

      {filteredClassTimes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No class times found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'No class times match your search criteria.' 
                : 'Get started by creating your first class time.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Class Time
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
                {editingClassTime ? 'Edit Class Time' : 'Create New Class Time'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name">Class Time Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Mon & Wed - 4:00 PM Pacific"
                    required
                  />
                </div>

                {/* Days of Week */}
                <div>
                  <Label>Days of Week *</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                          formData.dayOfWeek.includes(day)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
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

                {/* Capacity and Minimum */}
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
                    <Label htmlFor="minimumRequired">Minimum Required</Label>
                    <Input
                      id="minimumRequired"
                      type="number"
                      min="1"
                      value={formData.minimumRequired}
                      onChange={(e) => handleInputChange('minimumRequired', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                {/* Sort Order */}
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

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-20 resize-none"
                    placeholder="Optional description..."
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
                    {editingClassTime ? 'Update Class Time' : 'Create Class Time'}
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
