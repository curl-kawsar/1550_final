"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Percent, 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react"
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from "@/hooks/useCoupons"

const CouponManagement = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)

  const { data: couponsData, isLoading } = useCoupons(page, 10, { search, status: statusFilter })
  const createCouponMutation = useCreateCoupon()
  const updateCouponMutation = useUpdateCoupon()
  const deleteCouponMutation = useDeleteCoupon()

  const handleCreateCoupon = async (formData) => {
    try {
      await createCouponMutation.mutateAsync(formData)
      setIsCreateModalOpen(false)
      toast.success("Coupon created successfully!")
    } catch (error) {
      toast.error(error.message || "Failed to create coupon")
    }
  }

  const handleUpdateCoupon = async (formData) => {
    try {
      await updateCouponMutation.mutateAsync({
        id: selectedCoupon._id,
        ...formData
      })
      setIsEditModalOpen(false)
      setSelectedCoupon(null)
      toast.success("Coupon updated successfully!")
    } catch (error) {
      toast.error(error.message || "Failed to update coupon")
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return
    
    try {
      await deleteCouponMutation.mutateAsync(couponId)
      toast.success("Coupon deleted successfully!")
    } catch (error) {
      toast.error(error.message || "Failed to delete coupon")
    }
  }

  const getStatusBadge = (coupon) => {
    const now = new Date()
    const isExpired = new Date(coupon.validUntil) < now
    const isNotStarted = new Date(coupon.validFrom) > now
    const isOverUsed = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit

    if (!coupon.isActive) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>
    } else if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>
    } else if (isNotStarted) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Scheduled</Badge>
    } else if (isOverUsed) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Used Up</Badge>
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Coupon Management</h2>
          <p className="text-gray-600">Create and manage discount coupons</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{couponsData?.pagination?.total || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {couponsData?.coupons?.filter(c => c.isCurrentlyValid).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {couponsData?.coupons?.reduce((sum, c) => sum + c.usedCount, 0) || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Discount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {couponsData?.coupons?.length > 0
                ? Math.round(couponsData.coupons.reduce((sum, c) => sum + c.discountPercentage, 0) / couponsData.coupons.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Coupons</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by code, name, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label>Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Coupons</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Coupons</CardTitle>
          <CardDescription>
            Manage your discount coupons and track their usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading coupons...</div>
          ) : couponsData?.coupons?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No coupons found. Create your first coupon to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {couponsData?.coupons?.map((coupon) => (
                <div key={coupon._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{coupon.code}</h3>
                        {getStatusBadge(coupon)}
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {coupon.discountPercentage}% OFF
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{coupon.name}</p>
                      {coupon.description && (
                        <p className="text-sm text-gray-500 mb-2">{coupon.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Valid until: {new Date(coupon.validUntil).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Used: {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}
                        </span>
                        {coupon.minimumAmount > 0 && (
                          <span>Min: ${coupon.minimumAmount}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCoupon(coupon)
                          setIsEditModalOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        disabled={coupon.usedCount > 0}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {couponsData?.pagination && couponsData.pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {couponsData.pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= couponsData.pagination.pages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <CouponModal
          isOpen={isCreateModalOpen || isEditModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false)
            setIsEditModalOpen(false)
            setSelectedCoupon(null)
          }}
          onSubmit={isEditModalOpen ? handleUpdateCoupon : handleCreateCoupon}
          coupon={selectedCoupon}
          isLoading={createCouponMutation.isLoading || updateCouponMutation.isLoading}
        />
      )}
    </div>
  )
}

// Coupon Create/Edit Modal Component
const CouponModal = ({ isOpen, onClose, onSubmit, coupon, isLoading }) => {
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    name: coupon?.name || '',
    description: coupon?.description || '',
    discountPercentage: coupon?.discountPercentage || 10,
    usageLimit: coupon?.usageLimit || '',
    validFrom: coupon?.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    validUntil: coupon?.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
    minimumAmount: coupon?.minimumAmount || 0,
    applicablePlans: coupon?.applicablePlans || ['all'],
    isActive: coupon?.isActive !== undefined ? coupon.isActive : true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.code || !formData.name || !formData.validUntil) {
      toast.error('Please fill in all required fields')
      return
    }
    
    if (formData.discountPercentage < 1 || formData.discountPercentage > 100) {
      toast.error('Discount percentage must be between 1 and 100')
      return
    }
    
    if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      toast.error('Valid until date must be after valid from date')
      return
    }

    onSubmit({
      ...formData,
      code: formData.code.toUpperCase(),
      discountPercentage: parseInt(formData.discountPercentage),
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      minimumAmount: parseFloat(formData.minimumAmount) || 0
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {coupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <Button type="button" variant="ghost" onClick={onClose}>×</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Coupon Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SAVE50"
                maxLength={20}
                required
              />
            </div>

            <div>
              <Label htmlFor="discountPercentage">Discount Percentage * (%)</Label>
              <Input
                id="discountPercentage"
                type="number"
                min="1"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="name">Coupon Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Black Friday Sale"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Special discount for limited time"
              />
            </div>

            <div>
              <Label htmlFor="validFrom">Valid From *</Label>
              <Input
                id="validFrom"
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="validUntil">Valid Until *</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                min="1"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <Label htmlFor="minimumAmount">Minimum Amount ($)</Label>
              <Input
                id="minimumAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.minimumAmount}
                onChange={(e) => setFormData({ ...formData, minimumAmount: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CouponManagement
