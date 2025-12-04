'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, ClipboardCheck, Copy, LogOut, RefreshCw, Mail, Phone, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function AmbassadorDashboard({ ambassador, onLogout }) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/ambassador/auth/logout', {
        method: 'POST'
      })

      if (response.ok) {
        toast.success("Logged out successfully")
        onLogout()
      } else {
        toast.error("Logout failed")
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error("An error occurred during logout")
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/ambassador/auth/me')
      if (response.ok) {
        const data = await response.json()
        // You could update the ambassador data here if needed
        toast.success("Data refreshed successfully")
      }
    } catch (error) {
      console.error('Refresh error:', error)
      toast.error("Failed to refresh data")
    } finally {
      setIsRefreshing(false)
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

  const generateAmbassadorCard = async () => {
    setIsGenerating(true)
    try {
      const templateSrc = '/ambassador-template.png'
      const img = new Image()
      img.src = templateSrc
      img.crossOrigin = 'anonymous'

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      // Draw template
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Define the orange box area proportions (centered)
      const boxX = canvas.width * 0.15
      const boxWidth = canvas.width * 0.70
      const boxY = canvas.height * 0.40
      const boxHeight = canvas.height * 0.24

      // Text styling
      const fontSize = Math.floor(canvas.width * 0.1)
      ctx.font = `${fontSize}px "Norwester", "Arial Black", sans-serif`
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const codeText = ambassador?.ambassadorCode || 'YOURCODE'
      const verticalOffset = 80 // move text 100px lower than center
      ctx.fillText(codeText, boxX + boxWidth / 2, boxY + boxHeight / 2 + verticalOffset)

      // Download
      const link = document.createElement('a')
      link.download = `ambassador-${codeText}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      toast.success('Ambassador graphic generated')
    } catch (error) {
      console.error('Generate ambassador card error:', error)
      toast.error('Failed to generate ambassador graphic')
    } finally {
      setIsGenerating(false)
    }
  }

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const getApprovalStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="px-4 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Ambassador</h2>
          <p className="text-sm text-gray-600 mt-1">
            {ambassador.firstName} {ambassador.lastName}
          </p>
          <div className="mt-3">
            <p className="text-xs text-gray-500">Code</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="font-mono text-base px-3 py-1">
                {ambassador.ambassadorCode}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(ambassador.ambassadorCode)}
                className="p-1 h-7 w-7"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => copyToClipboard(`Use my ambassador code: ${ambassador.ambassadorCode}`)}
          >
            <Copy className="w-4 h-4 mr-2" />
            Share Code
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => window.open('/register', '_blank')}
          >
            <Users className="w-4 h-4 mr-2" />
            Registration Page
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={generateAmbassadorCard}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Shareable Graphic
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Ambassador Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {ambassador.firstName} {ambassador.lastName}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Ambassador Info & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Ambassador Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Profile</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Ambassador
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Ambassador Code</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-mono text-lg px-3 py-1">
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
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm">{ambassador.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-sm">{formatPhoneNumber(ambassador.phoneNumber)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Rate</p>
                <p className="text-sm">{ambassador.commission || 0}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Students */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-3xl font-bold">{ambassador.totalStudents || 0}</div>
                  <p className="text-xs text-gray-500">Students registered with your code</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => copyToClipboard(`Use my ambassador code: ${ambassador.ambassadorCode}`)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Share Your Code
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => window.open('/register', '_blank')}
              >
                <Users className="w-4 h-4 mr-2" />
                View Registration Page
              </Button>
              <Button
                variant="default"
                size="sm"
                className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                onClick={generateAmbassadorCard}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Generate Shareable Graphic
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Students</CardTitle>
            <CardDescription>
              Students who registered using your ambassador code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ambassador.students && ambassador.students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Student</th>
                      <th className="text-left p-4 font-medium">Contact</th>
                      <th className="text-left p-4 font-medium">Class Time</th>
                      <th className="text-left p-4 font-medium">Diagnostic Test</th>
                      <th className="text-left p-4 font-medium">Parental Approval</th>
                      <th className="text-left p-4 font-medium">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ambassador.students.map((student) => (
                      <tr key={student._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{student.firstName} {student.lastName}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-3 h-3 mr-1" />
                              {student.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-3 h-3 mr-1" />
                              {formatPhoneNumber(student.phoneNumber)}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm">{student.classTime || 'Not selected'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <ClipboardCheck className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm">{student.diagnosticTestDate || 'Not selected'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            {getApprovalStatusIcon(student.parentalApprovalStatus)}
                            <Badge 
                              variant="outline" 
                              className={`ml-2 text-xs ${getApprovalStatusColor(student.parentalApprovalStatus)}`}
                            >
                              {student.parentalApprovalStatus === 'approved' ? 'Approved' :
                               student.parentalApprovalStatus === 'declined' ? 'Declined' : 'Pending'}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-600">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">No students yet</p>
                <p className="text-sm">
                  Share your ambassador code <strong>{ambassador.ambassadorCode}</strong> to start getting registrations!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}