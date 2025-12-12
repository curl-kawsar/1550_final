"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Search, Shield, ShieldCheck, Eye, EyeOff, X } from 'lucide-react'

export default function AdminUserManagement() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    isActive: true
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins || [])
      } else {
        toast.error('Failed to fetch admin users')
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
      toast.error('An error occurred while fetching admin users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      setFormLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Admin user created successfully')
        setShowCreateModal(false)
        resetForm()
        fetchAdmins()
      } else {
        toast.error(data.error || 'Failed to create admin user')
      }
    } catch (error) {
      console.error('Error creating admin:', error)
      toast.error('An error occurred while creating admin user')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateAdmin = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setFormLoading(true)
      const token = localStorage.getItem('adminToken')
      
      // Don't send password if it's empty (no password change)
      const updateData = { ...formData }
      if (!updateData.password) {
        delete updateData.password
      }

      const response = await fetch(`/api/admin/users/${editingAdmin._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Admin user updated successfully')
        setShowEditModal(false)
        setEditingAdmin(null)
        resetForm()
        fetchAdmins()
      } else {
        toast.error(data.error || 'Failed to update admin user')
      }
    } catch (error) {
      console.error('Error updating admin:', error)
      toast.error('An error occurred while updating admin user')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteAdmin = async (adminId, adminEmail) => {
    if (!confirm(`Are you sure you want to delete admin: ${adminEmail}?`)) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/users/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Admin user deleted successfully')
        fetchAdmins()
      } else {
        toast.error(data.error || 'Failed to delete admin user')
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
      toast.error('An error occurred while deleting admin user')
    }
  }

  const openEditModal = (admin) => {
    setEditingAdmin(admin)
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      isActive: admin.isActive
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      isActive: true
    })
    setShowPassword(false)
  }

  const closeModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingAdmin(null)
    resetForm()
  }

  const filteredAdmins = admins.filter(admin => 
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadgeColor = (role) => {
    return role === 'super-admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
  }

  const getStatusBadgeColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Users</h2>
          <p className="text-gray-600 mt-1">Manage admin users and their permissions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Admin User
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admin List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading admin users...</p>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No admin users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAdmins.map((admin) => (
            <Card key={admin._id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-lg">
                        {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {admin.name}
                        </h3>
                        {admin.role === 'super-admin' && (
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <p className="text-gray-600 text-sm truncate">{admin.email}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={getRoleBadgeColor(admin.role)}>
                          {admin.role === 'super-admin' ? 'Super Admin' : 'Admin'}
                        </Badge>
                        <Badge className={getStatusBadgeColor(admin.isActive)}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {admin.lastLogin && (
                          <span className="text-xs text-gray-500">
                            Last login: {new Date(admin.lastLogin).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(admin)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAdmin(admin._id, admin.email)}
                      className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Create Admin User</CardTitle>
                  <CardDescription>Add a new admin user to the system</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModals}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>

                <div>
                  <Label htmlFor="role">Role *</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="super-admin">Super Admin</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={formLoading} className="flex-1">
                    {formLoading ? 'Creating...' : 'Create Admin'}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeModals} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Edit Admin User</CardTitle>
                  <CardDescription>Update admin user information</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModals}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateAdmin} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-password">New Password (optional)</Label>
                  <div className="relative">
                    <Input
                      id="edit-password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave blank to keep current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave blank to keep existing password</p>
                </div>

                <div>
                  <Label htmlFor="edit-role">Role *</Label>
                  <select
                    id="edit-role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="super-admin">Super Admin</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="edit-isActive" className="cursor-pointer">Active</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={formLoading} className="flex-1">
                    {formLoading ? 'Updating...' : 'Update Admin'}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeModals} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

