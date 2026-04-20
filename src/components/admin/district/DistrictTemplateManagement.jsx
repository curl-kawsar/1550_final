"use client"

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Plus, Edit2, Trash2, Save, X, Eye, Check,
  FileText, Loader2, AlertCircle, Copy
} from 'lucide-react'

const PLACEHOLDERS = [
  '{{StudentName}}', '{{ParentName}}', '{{DistrictName}}',
  '{{RegistrationLink}}', '{{RegistrationCode}}', '{{SenderName}}',
  '{{SchoolName}}', '{{RepresentativeName}}', '{{StudentGrade}}',
  '{{DashboardSupportEmail}}'
]

export default function DistrictTemplateManagement() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [form, setForm] = useState({ name: '', subject: '', body: '', isApproved: false })

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/district/templates')
      const data = await res.json()
      if (data.success) setTemplates(data.templates)
    } catch {
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  const resetForm = () => {
    setForm({ name: '', subject: '', body: '', isApproved: false })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (template) => {
    setForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      isApproved: template.isApproved
    })
    setEditingId(template._id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) {
      toast.error('Name, subject, and body are required')
      return
    }

    setSaving(true)
    try {
      const url = editingId ? `/api/district/templates/${editingId}` : '/api/district/templates'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingId ? 'Template updated' : 'Template created')
        resetForm()
        fetchTemplates()
      } else {
        toast.error(data.error || 'Save failed')
      }
    } catch {
      toast.error('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete template "${name}"?`)) return
    try {
      const res = await fetch(`/api/district/templates/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Template deleted')
        fetchTemplates()
      }
    } catch {
      toast.error('Failed to delete template')
    }
  }

  const handleApprove = async (id, current) => {
    try {
      const res = await fetch(`/api/district/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !current })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(current ? 'Template unapproved' : 'Template approved')
        fetchTemplates()
      }
    } catch {
      toast.error('Failed to update template')
    }
  }

  const insertPlaceholder = (placeholder) => {
    setForm(prev => ({ ...prev, body: prev.body + placeholder }))
  }

  const getPreviewHtml = (template) => {
    let html = template.body
    const sampleData = {
      '{{StudentName}}': 'John Doe',
      '{{ParentName}}': 'Jane Doe',
      '{{DistrictName}}': 'Sample District',
      '{{RegistrationLink}}': 'https://1550plus.com/register?code=DIST-SAMPLE1',
      '{{RegistrationCode}}': 'DIST-SAMPLE1',
      '{{SenderName}}': 'The 1550+ Team',
      '{{SchoolName}}': 'Sample High School',
      '{{RepresentativeName}}': 'Dr. Smith',
      '{{StudentGrade}}': '11th',
      '{{DashboardSupportEmail}}': 'support@1550plus.com'
    }
    for (const [key, value] of Object.entries(sampleData)) {
      html = html.replaceAll(key, `<mark style="background:#fef08a;padding:0 2px">${value}</mark>`)
    }
    return html
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{templates.length} template(s)</p>
        <Button onClick={() => { resetForm(); setShowForm(true) }} className="bg-[#113076] hover:bg-[#1a4ba8]">
          <Plus className="w-4 h-4 mr-2" /> New Template
        </Button>
      </div>

      {/* Template Form */}
      {showForm && (
        <Card className="p-6 border-2 border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Template' : 'Create New Template'}
          </h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Template Name *</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., District Invitation v1" />
              </div>
              <div>
                <Label>Email Subject *</Label>
                <Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g., You're Invited! {{StudentName}} - 1550+ SAT Scholarship" />
              </div>
            </div>

            <div>
              <Label>Placeholders (click to insert)</Label>
              <div className="flex flex-wrap gap-1 mt-1 mb-2">
                {PLACEHOLDERS.map(p => (
                  <button key={p} onClick={() => insertPlaceholder(p)}
                    className="px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 hover:bg-yellow-100 transition">
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Email Body (HTML) *</Label>
              <textarea value={form.body}
                onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[300px]"
                placeholder="<h2>Dear {{ParentName}},</h2>&#10;<p>Your student {{StudentName}} has been nominated...</p>" />
            </div>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isApproved}
                onChange={e => setForm(p => ({ ...p, isApproved: e.target.checked }))}
                className="rounded border-gray-300" />
              <span className="text-sm">Mark as approved for use</span>
            </label>

            <div className="flex items-center gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {editingId ? 'Update' : 'Create'} Template
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Template List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : templates.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-2">No templates yet</p>
          <p className="text-sm text-gray-400">Create your first district email template to get started.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map(template => (
            <Card key={template._id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                    {template.isApproved && <Badge className="bg-green-100 text-green-700 text-[10px]">Approved</Badge>}
                    {!template.isActive && <Badge variant="destructive" className="text-[10px]">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Subject: {template.subject}</p>
                  <p className="text-xs text-gray-400">
                    Created {new Date(template.createdAt).toLocaleDateString()}
                    {template.createdBy && ` by ${template.createdBy.name || template.createdBy.email}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(
                    previewTemplate === template._id ? null : template._id
                  )}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleApprove(template._id, template.isApproved)}>
                    <Check className={`w-4 h-4 ${template.isApproved ? 'text-green-600' : 'text-gray-400'}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600"
                    onClick={() => handleDelete(template._id, template.name)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {previewTemplate === template._id && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Preview (with sample data)</span>
                    <button onClick={() => setPreviewTemplate(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 max-h-80 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: getPreviewHtml(template) }} />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
