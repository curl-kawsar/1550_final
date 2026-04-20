"use client"

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search, Edit2, Trash2, Check, X, Save, Loader2
} from 'lucide-react'

const STUDENT_STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-700',
  'Imported': 'bg-blue-100 text-blue-700',
  'Ready for Generation': 'bg-indigo-100 text-indigo-700',
  'Generated': 'bg-purple-100 text-purple-700',
  'Included in Package': 'bg-violet-100 text-violet-700',
  'Sent to Representative': 'bg-green-100 text-green-700',
  'Registered': 'bg-emerald-100 text-emerald-800',
  'Skipped': 'bg-gray-100 text-gray-500',
  'Delivery Issue': 'bg-red-100 text-red-700'
}

const STUDENT_STATUSES = [
  'Draft', 'Imported', 'Ready for Generation', 'Generated',
  'Included in Package', 'Sent to Representative', 'Registered',
  'Skipped', 'Delivery Issue'
]

export default function DistrictStudentTable({ submissionId, students, onRefresh, selectedStudents, onSelectionChange }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingStudent, setEditingStudent] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  const filtered = students.filter(s => {
    const matchSearch = !search ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      s.parentEmail?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const allSelected = filtered.length > 0 && filtered.every(s => selectedStudents.includes(s._id))

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(filtered.map(s => s._id))
    }
  }

  const toggleStudent = (id) => {
    onSelectionChange(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const startEdit = (student) => {
    setEditingStudent(student._id)
    setEditForm({
      firstName: student.firstName,
      lastName: student.lastName,
      grade: student.grade,
      highSchoolName: student.highSchoolName,
      parentFirstName: student.parentFirstName,
      parentLastName: student.parentLastName,
      parentEmail: student.parentEmail,
      status: student.status,
      notes: student.notes || ''
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/district/submissions/${submissionId}/students/${editingStudent}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Student updated')
        setEditingStudent(null)
        onRefresh()
      } else {
        toast.error(data.error || 'Update failed')
      }
    } catch {
      toast.error('Failed to update student')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (studentId, studentName) => {
    if (!confirm(`Remove ${studentName} from this submission?`)) return
    try {
      const res = await fetch(`/api/district/submissions/${submissionId}/students/${studentId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Student removed')
        onRefresh()
      }
    } catch {
      toast.error('Failed to remove student')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
          Student Nominees ({students.length})
        </h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search students..." value={search}
              onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm w-48" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm bg-white h-9">
            <option value="">All Statuses</option>
            {STUDENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                    className="rounded border-gray-300" />
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">#</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">Student Name</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">Grade</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">Parent / Guardian</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">Parent Email</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">Status</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">Tag</th>
                <th className="px-3 py-2 text-center font-medium text-gray-500 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    No students found
                  </td>
                </tr>
              ) : filtered.map((student, i) => (
                <tr key={student._id} className={`hover:bg-gray-50 ${selectedStudents.includes(student._id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-3 py-2">
                    <input type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => toggleStudent(student._id)}
                      className="rounded border-gray-300" />
                  </td>
                  <td className="px-3 py-2 text-gray-400 text-xs">{i + 1}</td>

                  {editingStudent === student._id ? (
                    <>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Input value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))}
                            className="h-7 text-xs w-20" />
                          <Input value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))}
                            className="h-7 text-xs w-20" />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Input value={editForm.grade} onChange={e => setEditForm(p => ({ ...p, grade: e.target.value }))}
                          className="h-7 text-xs w-16" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Input value={editForm.parentFirstName} onChange={e => setEditForm(p => ({ ...p, parentFirstName: e.target.value }))}
                            className="h-7 text-xs w-20" />
                          <Input value={editForm.parentLastName} onChange={e => setEditForm(p => ({ ...p, parentLastName: e.target.value }))}
                            className="h-7 text-xs w-20" />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Input value={editForm.parentEmail} onChange={e => setEditForm(p => ({ ...p, parentEmail: e.target.value }))}
                          className="h-7 text-xs w-36" />
                      </td>
                      <td className="px-3 py-2">
                        <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                          className="border rounded px-1 py-0.5 text-xs h-7">
                          {STUDENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="text-[10px]">District</Badge>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={handleSave} disabled={saving}
                            className="h-7 w-7 p-0 text-green-600">
                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingStudent(null)}
                            className="h-7 w-7 p-0 text-gray-400">
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 font-medium">{student.firstName} {student.lastName}</td>
                      <td className="px-3 py-2">{student.grade}</td>
                      <td className="px-3 py-2">{student.parentFirstName} {student.parentLastName}</td>
                      <td className="px-3 py-2 text-gray-500">{student.parentEmail}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STUDENT_STATUS_COLORS[student.status] || 'bg-gray-100'}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {student.districtOriginTag && <Badge variant="outline" className="text-[10px]">District</Badge>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(student)}
                            className="h-7 w-7 p-0">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm"
                            onClick={() => handleDelete(student._id, `${student.firstName} ${student.lastName}`)}
                            className="h-7 w-7 p-0 text-red-400 hover:text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
