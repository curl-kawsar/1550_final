"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Eye, Search, ChevronLeft, ChevronRight, Trash2, MailOpen, Mail, RefreshCw } from 'lucide-react'
import { useContactMessages, useUpdateContactStatus, useDeleteContactMessage } from '@/hooks/useContact'

const ContactMessages = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  
  const { data, isLoading, error, refetch, isRefetching } = useContactMessages(currentPage, 10, statusFilter)
  const updateStatusMutation = useUpdateContactStatus()
  const deleteMessageMutation = useDeleteContactMessage()

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      new: 'bg-green-100 text-green-800',
      read: 'bg-blue-100 text-blue-800', 
      replied: 'bg-purple-100 text-purple-800'
    }

    const icons = {
      new: <Mail className="w-3 h-3 mr-1" />,
      read: <MailOpen className="w-3 h-3 mr-1" />,
      replied: <MailOpen className="w-3 h-3 mr-1" />
    }

    return (
      <Badge className={`${colors[status]} flex items-center`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleStatusUpdate = (messageId, newStatus) => {
    updateStatusMutation.mutate({ id: messageId, status: newStatus })
  }

  const handleDelete = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessageMutation.mutate(messageId)
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(null)
      }
    }
  }

  const MessageDetailModal = ({ message, onClose }) => {
    if (!message) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{message.firstName} {message.lastName}</h2>
                <p className="text-gray-600">{message.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(message.submittedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(message.status)}
                <Button variant="outline" size="sm" onClick={onClose}>
                  ✕
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Message</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="whitespace-pre-wrap">{message.message}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Update Status</h3>
              <div className="flex space-x-2">
                {['new', 'read', 'replied'].map((status) => (
                  <Button
                    key={status}
                    variant={message.status === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusUpdate(message._id, status)}
                    disabled={updateStatusMutation.isPending}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(message._id)}
                disabled={deleteMessageMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Message
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load messages</p>
          <Button 
            onClick={() => refetch()}
            variant="outline"
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Retrying...' : 'Retry'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Contact Messages</CardTitle>
            <Button 
              onClick={handleRefresh} 
              size="sm" 
              variant="outline"
              disabled={refreshing || isRefetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${(refreshing || isRefetching) ? 'animate-spin' : ''}`} />
              {(refreshing || isRefetching) ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex space-x-4 mb-6">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>

          {/* Messages Table */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Sender</th>
                    <th className="text-left p-4">Message Preview</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.messages?.map((message) => (
                    <tr key={message._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{message.firstName} {message.lastName}</div>
                          <div className="text-sm text-gray-500">{message.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs">
                          <p className="text-sm truncate">{message.message}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(message.status)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {new Date(message.submittedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedMessage(message)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(message._id)}
                            disabled={deleteMessageMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data?.messages?.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No messages found</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Showing {((data.pagination.currentPage - 1) * 10) + 1} to {Math.min(data.pagination.currentPage * 10, data.pagination.totalMessages)} of {data.pagination.totalMessages} messages
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={!data.pagination.hasPrev}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!data.pagination.hasNext}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  )
}

export default ContactMessages