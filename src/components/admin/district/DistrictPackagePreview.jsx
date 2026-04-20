"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Send, Loader2, Package, Users, Mail } from 'lucide-react'

export default function DistrictPackagePreview({ data, onClose, onSend, sending }) {
  if (!data) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Package Preview</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Recipient</p>
              <p className="font-medium text-sm">{data.submission?.representativeName}</p>
              <p className="text-xs text-gray-400">{data.submission?.representativeEmail}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Package Contents</p>
              <p className="font-medium text-sm">{data.totalInPackage} student emails</p>
              <p className="text-xs text-gray-400">Code: {data.submission?.registrationCode}</p>
            </div>
          </div>

          {/* Student emails */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Student Emails in Package
            </h3>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {data.previewStudents?.map(student => (
                <div key={student.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="font-medium text-sm">{student.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{student.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-400">To: {student.parentEmail}</p>
                  <div className="mt-2 bg-gray-50 rounded p-2 text-xs text-gray-500 max-h-24 overflow-hidden">
                    <div dangerouslySetInnerHTML={{ __html: student.emailPreview }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500">
            This will send 1 summary email + ZIP attachment to the representative.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onSend} disabled={sending} className="bg-green-600 hover:bg-green-700">
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Package
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
