"use client"

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Search, RefreshCw, ChevronLeft, ChevronRight, Building2,
  Users, Mail, Calendar, Filter, Loader2, Eye, BarChart3, Trash2
} from 'lucide-react'
import DistrictDetail from './DistrictDetail'
import DistrictStats from './DistrictStats'

const STATUS_COLORS = {
  'New': 'bg-blue-100 text-blue-800',
  'Under Review': 'bg-yellow-100 text-yellow-800',
  'Ready for Generation': 'bg-indigo-100 text-indigo-800',
  'Package In Progress': 'bg-purple-100 text-purple-800',
  'Sent to Representative': 'bg-green-100 text-green-800',
  'Partially Converted': 'bg-orange-100 text-orange-800',
  'Completed': 'bg-emerald-100 text-emerald-800',
  'Archived': 'bg-gray-100 text-gray-800'
}

const STATUSES = [
  'New', 'Under Review', 'Ready for Generation', 'Package In Progress',
  'Sent to Representative', 'Partially Converted', 'Completed', 'Archived'
]

export default function DistrictManagement() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/district/submissions?${params}`)
      const data = await res.json()
      if (data.success) {
        setSubmissions(data.submissions)
        setPagination(data.pagination)
      }
    } catch {
      toast.error('Failed to load district submissions')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])

  useEffect(() => { setPage(1) }, [search, statusFilter])

  const handleDeleteSubmission = async (e, sub) => {
    e.stopPropagation()
    const label = `${sub.districtName} / ${sub.schoolName}`.trim()
    if (!window.confirm(
      `Delete this district submission and all data for it (representative, student list, packages, logs)?\n\n${label}\n\nThis cannot be undone.`
    )) {
      return
    }
    setDeletingId(sub._id)
    try {
      const res = await fetch(`/api/district/submissions/${sub._id}`, { method: 'DELETE' })
      const data = await res.json()
        if (data.success) {
        toast.success('District submission deleted')
        await fetchSubmissions()
      } else {
        toast.error(data.error || 'Delete failed')
      }
    } catch {
      toast.error('Failed to delete district submission')
    } finally {
      setDeletingId(null)
    }
  }

  if (selectedSubmission) {
    return (
      <DistrictDetail
        submissionId={selectedSubmission}
        onBack={() => { setSelectedSubmission(null); fetchSubmissions() }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Toggle */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
          <BarChart3 className="w-4 h-4 mr-2" />
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </Button>
        <Button variant="outline" size="sm" onClick={fetchSubmissions}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {showStats && <DistrictStats />}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by district, school, representative..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">District</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">School</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Representative</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Students</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Method</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Registered</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    No district submissions found
                  </td>
                </tr>
              ) : submissions.map(sub => (
                <tr key={sub._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedSubmission(sub._id)}>
                  <td className="px-4 py-3 font-medium text-gray-900">{sub.districtName}</td>
                  <td className="px-4 py-3 text-gray-600">{sub.schoolName}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{sub.representativeName}</div>
                    <div className="text-xs text-gray-400">{sub.representativeEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold">{sub.studentCount}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className="text-xs capitalize">{sub.submissionMethod}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-green-600">{sub.totalRegistered || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[sub.status] || 'bg-gray-100 text-gray-800'}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => { e.stopPropagation(); setSelectedSubmission(sub._id) }}
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete district submission and all related data"
                        disabled={deletingId === sub._id}
                        onClick={e => handleDeleteSubmission(e, sub)}
                      >
                        {deletingId === sub._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
