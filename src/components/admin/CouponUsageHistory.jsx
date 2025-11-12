"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Percent,
  Calendar,
  User,
  CreditCard,
  Gift
} from "lucide-react"
import { useCouponUsage } from "@/hooks/useCoupons"

const CouponUsageHistory = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [couponFilter, setCouponFilter] = useState("")

  const { data: usageData, isLoading } = useCouponUsage(page, 20, { 
    search, 
    status: statusFilter,
    couponId: couponFilter 
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      free: { color: "bg-green-100 text-green-800", label: "Free" },
      paid: { color: "bg-blue-100 text-blue-800", label: "Paid" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      failed: { color: "bg-red-100 text-red-800", label: "Failed" }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportUsageData = () => {
    // This would typically trigger a CSV export
    // For now, just show a toast
    toast.info("Export functionality coming soon!")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Coupon Usage History</h2>
          <p className="text-gray-600">Track how coupons are being used by students</p>
        </div>
        <Button onClick={exportUsageData} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Overview */}
      {usageData?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageData.stats.totalUsages}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
              <Percent className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${usageData.stats.totalDiscount?.toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${usageData.stats.totalRevenue?.toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Discount</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usageData.stats.averageDiscount?.toFixed(1) || '0'}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by coupon code or student name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label>Payment Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
          <CardDescription>
            Complete history of coupon usage across all students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading usage history...</div>
          ) : usageData?.usages?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No coupon usage found. Coupons will appear here once students start using them!
            </div>
          ) : (
            <div className="space-y-4">
              {usageData?.usages?.map((usage) => (
                <div key={usage._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-lg">{usage.couponCode}</span>
                        </div>
                        {getStatusBadge(usage.paymentStatus)}
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {usage.discountPercentage}% OFF
                        </Badge>
                        {usage.finalAmount === 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800">FREE</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Student:</span>
                          <span className="font-medium">
                            {usage.student?.firstName} {usage.student?.lastName}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Used:</span>
                          <span>{formatDate(usage.usedAt)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Plan:</span>
                          <span className="font-medium capitalize">
                            {usage.planType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-gray-800 mb-2">Pricing Breakdown</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Original:</span>
                            <div className="font-semibold">${usage.originalAmount}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Discount:</span>
                            <div className="font-semibold text-red-600">-${usage.discountAmount}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Final:</span>
                            <div className="font-semibold text-blue-600">
                              {usage.finalAmount === 0 ? 'FREE' : `$${usage.finalAmount}`}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Savings:</span>
                            <div className="font-semibold text-green-600">
                              {usage.discountPercentage}%
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {usage.stripePaymentIntentId && (
                        <div className="mt-2 text-xs text-gray-500">
                          Payment ID: {usage.stripePaymentIntentId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {usageData?.pagination && usageData.pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {usageData.pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= usageData.pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default CouponUsageHistory
