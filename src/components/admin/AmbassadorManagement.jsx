'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Eye, Trash2, Users, Copy, CheckCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

// Fetch all ambassadors
const fetchAmbassadors = async () => {
  const response = await fetch('/api/ambassadors')
  if (!response.ok) {
    throw new Error('Failed to fetch ambassadors')
  }
  return response.json()
}

// Create new ambassador
const createAmbassador = async (ambassadorData) => {
  const response = await fetch('/api/ambassadors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ambassadorData)
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create ambassador')
  }
  return response.json()
}

// Update ambassador
const updateAmbassador = async ({ id, data }) => {
  const response = await fetch(`/api/ambassadors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update ambassador')
  }
  return response.json()
}

// Delete ambassador
const deleteAmbassador = async (id) => {
  const response = await fetch(`/api/ambassadors/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete ambassador')
  }
  return response.json()
}

export default function AmbassadorManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAmbassador, setEditingAmbassador] = useState(null)
  const [viewingAmbassador, setViewingAmbassador] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    commission: 0,
    notes: ''
  })

  const queryClient = useQueryClient()

  // Queries
  const { data: ambassadorsData, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['ambassadors'],
    queryFn: fetchAmbassadors
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast.success('Ambassador data refreshed')
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: createAmbassador,
    onSuccess: (data) => {
      toast.success('Ambassador created successfully!')
      queryClient.invalidateQueries({ queryKey: ['ambassadors'] })
      setShowCreateForm(false)
      resetForm()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const updateMutation = useMutation({
    mutationFn: updateAmbassador,
    onSuccess: (data) => {
      toast.success('Ambassador updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['ambassadors'] })
      setEditingAmbassador(null)
      resetForm()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAmbassador,
    onSuccess: (data) => {
      toast.success('Ambassador deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['ambassadors'] })
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      commission: 0,
      notes: ''
    })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingAmbassador) {
      // Don't send password if it's empty during edit
      const updateData = { ...formData }
      if (!updateData.password) {
        delete updateData.password
      }
      updateMutation.mutate({ id: editingAmbassador._id, data: updateData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (ambassador) => {
    setEditingAmbassador(ambassador)
    setFormData({
      firstName: ambassador.firstName,
      lastName: ambassador.lastName,
      email: ambassador.email,
      password: '', // Don't pre-fill password
      phoneNumber: ambassador.phoneNumber,
      commission: ambassador.commission || 0,
      notes: ambassador.notes || ''
    })
    setShowCreateForm(true)
  }

  const handleDelete = (ambassador) => {
    if (window.confirm(`Are you sure you want to delete ${ambassador.firstName} ${ambassador.lastName}?`)) {
      deleteMutation.mutate(ambassador._id)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading ambassadors...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading ambassadors: {error.message}</div>
      </div>
    )
  }

  const ambassadors = ambassadorsData?.ambassadors || []

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ambassador Management</h1>
          <p className="text-gray-600">Manage ambassador accounts and track their performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing || isRefetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(refreshing || isRefetching) ? 'animate-spin' : ''}`} />
            {(refreshing || isRefetching) ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={() => {
              setShowCreateForm(true)
              setEditingAmbassador(null)
              resetForm()
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Ambassador
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Ambassadors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ambassadors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Ambassadors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ambassadors.filter(a => a.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ambassadors.reduce((sum, a) => sum + (a.totalStudents || 0), 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingAmbassador ? 'Edit Ambassador' : 'Create New Ambassador'}</CardTitle>
            <CardDescription>
              {editingAmbassador ? 'Update ambassador information' : 'Add a new ambassador to the system'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">
                  Password {editingAmbassador ? '(leave empty to keep current)' : '*'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required={!editingAmbassador}
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="commission">Commission (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commission}
                  onChange={(e) => handleInputChange('commission', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about this ambassador"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingAmbassador ? 'Update Ambassador' : 'Create Ambassador')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingAmbassador(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Ambassadors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ambassadors</CardTitle>
          <CardDescription>Manage your ambassador accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {ambassadors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No ambassadors found. Create your first ambassador!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Code</th>
                    <th className="text-left p-4 font-medium">Students</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ambassadors.map((ambassador) => (
                    <tr key={ambassador._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{ambassador.firstName} {ambassador.lastName}</div>
                          <div className="text-sm text-gray-500">{ambassador.phoneNumber}</div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{ambassador.email}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {ambassador.ambassadorCode}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(ambassador.ambassadorCode)}
                            className="p-1 h-6 w-6"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{ambassador.totalStudents || 0}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={ambassador.isActive ? "default" : "secondary"}>
                          {ambassador.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(ambassador)}
                            className="p-2 h-8 w-8"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewingAmbassador(ambassador)}
                            className="p-2 h-8 w-8"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(ambassador)}
                            className="p-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Ambassador Modal */}
      {viewingAmbassador && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Ambassador Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <div className="text-lg font-medium">{viewingAmbassador.firstName} {viewingAmbassador.lastName}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <div>{viewingAmbassador.email}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <div>{viewingAmbassador.phoneNumber}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Ambassador Code</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-lg">
                      {viewingAmbassador.ambassadorCode}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(viewingAmbassador.ambassadorCode)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Total Students</Label>
                  <div className="text-lg font-medium">{viewingAmbassador.totalStudents || 0}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Commission</Label>
                  <div>{viewingAmbassador.commission || 0}%</div>
                </div>
                {viewingAmbassador.notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Notes</Label>
                    <div className="text-sm">{viewingAmbassador.notes}</div>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div>
                    <Badge variant={viewingAmbassador.isActive ? "default" : "secondary"}>
                      {viewingAmbassador.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <div className="text-sm">{new Date(viewingAmbassador.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={() => setViewingAmbassador(null)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}