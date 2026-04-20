"use client"

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  ArrowLeft, RefreshCw, Search, Mail, Send, Eye, Edit2, Trash2,
  Check, X, Users, Building2, FileText, Download, Loader2,
  ChevronDown, Save, AlertCircle, Package, History
} from 'lucide-react'
import DistrictStudentTable from './DistrictStudentTable'
import DistrictPackagePreview from './DistrictPackagePreview'

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

export default function DistrictDetail({ submissionId, onBack }) {
  const [submission, setSubmission] = useState(null)
  const [students, setStudents] = useState([])
  const [packages, setPackages] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedStudents, setSelectedStudents] = useState([])
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [showAudit, setShowAudit] = useState(false)
  const [editingStatus, setEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/district/submissions/${submissionId}`)
      const data = await res.json()
      if (data.success) {
        setSubmission(data.submission)
        setStudents(data.students)
        setPackages(data.packages)
        setStats(data.stats)
        setNewStatus(data.submission.status)
      }
    } catch {
      toast.error('Failed to load submission details')
    } finally {
      setLoading(false)
    }
  }, [submissionId])

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/district/templates?approvedOnly=true')
      const data = await res.json()
      if (data.success) {
        setTemplates(data.templates)
        if (data.templates.length > 0) setSelectedTemplate(data.templates[0]._id)
      }
    } catch {
      console.error('Failed to load templates')
    }
  }, [])

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/district/audit-log?submissionId=${submissionId}&limit=50`)
      const data = await res.json()
      if (data.success) setAuditLogs(data.logs)
    } catch {
      console.error('Failed to load audit logs')
    }
  }, [submissionId])

  useEffect(() => {
    fetchDetail()
    fetchTemplates()
  }, [fetchDetail, fetchTemplates])

  const handleStatusUpdate = async () => {
    try {
      const res = await fetch(`/api/district/submissions/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        setSubmission(data.submission)
        setEditingStatus(false)
        toast.success('Status updated')
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template')
      return
    }
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch(`/api/district/submissions/${submissionId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplate, studentIds: selectedStudents })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Generated emails for ${data.generatedCount} students`)
        fetchDetail()
      } else {
        toast.error(data.error || 'Generation failed')
      }
    } catch {
      toast.error('Failed to generate emails')
    } finally {
      setGenerating(false)
    }
  }

  const handlePreview = async () => {
    try {
      const res = await fetch(`/api/district/submissions/${submissionId}/preview-package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: selectedStudents.length > 0 ? selectedStudents : undefined
        })
      })
      const data = await res.json()
      if (data.success) {
        setPreviewData(data)
        setShowPreview(true)
      } else {
        toast.error(data.error || 'Preview failed')
      }
    } catch {
      toast.error('Failed to generate preview')
    }
  }

  const handleSendPackage = async () => {
    setSending(true)
    try {
      const res = await fetch(`/api/district/submissions/${submissionId}/send-package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate,
          studentIds: selectedStudents.length > 0 ? selectedStudents : undefined
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Package sent to ${data.sentTo} with ${data.studentCount} student emails`)
        setShowPreview(false)
        fetchDetail()
      } else {
        toast.error(data.error || 'Failed to send package')
      }
    } catch {
      toast.error('Failed to send package')
    } finally {
      setSending(false)
    }
  }

  const handleToggleAudit = () => {
    if (!showAudit) fetchAuditLogs()
    setShowAudit(!showAudit)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="text-center py-20 text-gray-400">
        <AlertCircle className="w-10 h-10 mx-auto mb-2" />
        Submission not found
        <br />
        <Button variant="outline" className="mt-4" onClick={onBack}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{submission.districtName}</h2>
            <p className="text-sm text-gray-500">{submission.schoolName} &middot; {submission.registrationCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editingStatus ? (
            <div className="flex items-center gap-2">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Button size="sm" onClick={handleStatusUpdate}><Save className="w-3 h-3 mr-1" /> Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingStatus(false)}><X className="w-3 h-3" /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setEditingStatus(true)}>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[submission.status]}`}>
                {submission.status}
              </span>
              <Edit2 className="w-3 h-3 text-gray-400" />
            </div>
          )}
          <Button variant="outline" size="sm" onClick={fetchDetail}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-500">Total Nominees</p>
          <p className="text-2xl font-bold">{stats.totalStudents || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Generated</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalGenerated || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Sent to Rep</p>
          <p className="text-2xl font-bold text-blue-600">{submission.totalSentToRep || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Registered</p>
          <p className="text-2xl font-bold text-green-600">{stats.totalRegistered || 0}</p>
        </Card>
      </div>

      {/* Representative Info */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Representative Information
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">Name:</span> <span className="font-medium">{submission.representativeName}</span></div>
          <div><span className="text-gray-500">Email:</span> <span className="font-medium">{submission.representativeEmail}</span></div>
          <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{submission.representativePhone || 'N/A'}</span></div>
          <div><span className="text-gray-500">Role:</span> <span className="font-medium">{submission.representativeRole || 'N/A'}</span></div>
          <div><span className="text-gray-500">Method:</span> <Badge variant="outline" className="capitalize">{submission.submissionMethod}</Badge></div>
          <div><span className="text-gray-500">Submitted:</span> <span className="font-medium">{new Date(submission.createdAt).toLocaleDateString()}</span></div>
          {submission.notes && <div className="col-span-2"><span className="text-gray-500">Notes:</span> <span className="font-medium">{submission.notes}</span></div>}
        </div>
      </Card>

      {/* Generation Actions */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
          <Mail className="w-4 h-4" /> Email Generation & Delivery
        </h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Email Template</label>
            <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white min-w-[200px]">
              <option value="">Select template...</option>
              {templates.map(t => (
                <option key={t._id} value={t._id}>{t.name} {t.isApproved ? '(Approved)' : ''}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleGenerate} disabled={generating || !selectedTemplate || selectedStudents.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700">
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
            Generate Emails ({selectedStudents.length})
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" /> Preview Package
          </Button>
          <Button onClick={handleSendPackage} disabled={sending}
            className="bg-green-600 hover:bg-green-700">
            {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send to Representative
          </Button>
        </div>
        {selectedStudents.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">{selectedStudents.length} student(s) selected for generation</p>
        )}
      </Card>

      {/* Student Table */}
      <DistrictStudentTable
        submissionId={submissionId}
        students={students}
        onRefresh={fetchDetail}
        selectedStudents={selectedStudents}
        onSelectionChange={setSelectedStudents}
      />

      {/* Package History */}
      {packages.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
            <Package className="w-4 h-4" /> Package History
          </h3>
          <div className="space-y-2">
            {packages.map(pkg => (
              <div key={pkg._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span className="font-medium">{pkg.studentCount} students</span>
                  <span className="text-gray-500 ml-2">to {pkg.recipientEmail}</span>
                  {pkg.templateUsed && <span className="text-gray-400 ml-2">({pkg.templateUsed.name})</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {pkg.sentAt ? new Date(pkg.sentAt).toLocaleString() : 'Not sent'}
                  </span>
                  <Badge variant={pkg.status === 'sent' ? 'default' : 'destructive'} className="text-xs">
                    {pkg.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Audit Log */}
      <div>
        <Button variant="outline" size="sm" onClick={handleToggleAudit}>
          <History className="w-4 h-4 mr-2" /> {showAudit ? 'Hide' : 'Show'} Audit Log
        </Button>
        {showAudit && (
          <Card className="mt-3 p-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No audit entries</p>
              ) : auditLogs.map(log => (
                <div key={log._id} className="flex items-start gap-3 text-sm p-2 border-b last:border-0">
                  <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <div>
                    <span className="font-medium text-gray-700">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-gray-400 ml-2">by {log.performedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <DistrictPackagePreview
          data={previewData}
          onClose={() => setShowPreview(false)}
          onSend={handleSendPackage}
          sending={sending}
        />
      )}
    </div>
  )
}
