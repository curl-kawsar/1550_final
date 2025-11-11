"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Mail, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Phone,
  ExternalLink,
  RefreshCw,
  LogOut
} from 'lucide-react'
import { useStudentLogout } from '@/hooks/useStudentAuth'

const ParentalApprovalModal = ({ student, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const logoutMutation = useStudentLogout()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000) // Add slight delay for UX
    }
  }

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const getStatusInfo = () => {
    switch (student.parentalApprovalStatus) {
      case 'pending':
        return {
          icon: Clock,
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          title: 'Waiting for Parental Approval',
          subtitle: 'Your registration is pending parent/guardian consent',
          statusBadge: { variant: 'destructive', text: 'Pending Approval' }
        }
      case 'approved':
        return {
          icon: CheckCircle2,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Registration Approved!',
          subtitle: 'Your parent/guardian has approved your registration',
          statusBadge: { variant: 'default', text: 'Approved', className: 'bg-green-100 text-green-800' }
        }
      case 'declined':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Registration Declined',
          subtitle: 'Your parent/guardian has declined your registration',
          statusBadge: { variant: 'destructive', text: 'Declined' }
        }
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Unknown Status',
          subtitle: 'Please contact support for assistance',
          statusBadge: { variant: 'secondary', text: 'Unknown' }
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  if (student.parentalApprovalStatus === 'approved') {
    return null // Don't show modal if approved
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-lg mx-auto ${statusInfo.borderColor} ${statusInfo.bgColor} border-2`}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className={`p-3 rounded-full ${statusInfo.bgColor} border-2 ${statusInfo.borderColor}`}>
              <StatusIcon className={`w-8 h-8 ${statusInfo.iconColor}`} />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {statusInfo.title}
          </CardTitle>
          <p className="text-gray-600 mt-1 text-sm">{statusInfo.subtitle}</p>
          <div className="flex justify-center mt-2">
            <Badge 
              variant={statusInfo.statusBadge.variant} 
              className={`text-xs ${statusInfo.statusBadge.className || ''}`}
            >
              {statusInfo.statusBadge.text}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Student Information */}
          <div className="bg-white p-3 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
              <Shield className="w-3 h-3 text-blue-600" />
              Registration Details
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-600">Student:</span>
                <div className="font-medium">{student.firstName} {student.lastName}</div>
              </div>
              <div>
                <span className="text-gray-600">Parent/Guardian:</span>
                <div className="font-medium">{student.parentFirstName} {student.parentLastName}</div>
              </div>
              <div>
                <span className="text-gray-600">Parent Email:</span>
                <div className="font-medium">{student.parentEmail}</div>
              </div>
            </div>
          </div>

          {/* Status-specific content */}
          {student.parentalApprovalStatus === 'pending' && (
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                  <Mail className="w-3 h-3" />
                  Email Confirmation Sent
                </h3>
                <p className="text-blue-800 text-xs mb-2">
                  A confirmation email has been sent to your parent/guardian.
                </p>
                <div className="text-xs text-blue-700">
                  {student.parentalApprovalEmailSent ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Email sent successfully
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Email sending in progress...
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-3 h-3" />
                  What happens next?
                </h3>
                <ul className="text-yellow-800 text-xs space-y-1 list-disc list-inside">
                  <li>Your parent/guardian will receive an email with approval buttons</li>
                  <li>They need to click "APPROVE" to activate your account</li>
                  <li>Once approved, you'll have full access to the dashboard</li>
                </ul>
              </div>
            </div>
          )}

          {student.parentalApprovalStatus === 'declined' && (
            <div className="space-y-3">
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-900 mb-2 text-sm">Registration Declined</h3>
                <p className="text-red-800 text-xs mb-2">
                  Your parent/guardian has declined your registration for the 1550+ SAT Prep program.
                </p>
                <div className="text-xs text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>You cannot access course materials</li>
                    <li>Your registration has been cancelled</li>
                    <li>If this was a mistake, you can register again</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 text-sm">Need Help?</h3>
                <div className="text-xs text-blue-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    support@1550plus.com
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t">
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Checking...' : 'Check Status'}
            </Button>
            
            {student.parentalApprovalStatus === 'pending' && (
              <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                <a href="mailto:support@1550plus.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3" />
                  Contact Support
                </a>
              </Button>
            )}

            <Button 
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2"
            >
              <LogOut className={`w-3 h-3 ${logoutMutation.isPending ? 'animate-spin' : ''}`} />
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </Button>
          </div>

          {/* Footer note */}
          <div className="text-xs text-gray-500 text-center pt-2">
            This approval process ensures proper parental consent for all program participants.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ParentalApprovalModal