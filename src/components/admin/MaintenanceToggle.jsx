"use client"
import React, { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Wrench, AlertTriangle, CheckCircle } from 'lucide-react'
import { useMaintenanceStatus, useToggleMaintenance } from '@/hooks/useMaintenance'

const MaintenanceToggle = ({ adminEmail }) => {
  const [customMessage, setCustomMessage] = useState('')
  const [showMessageInput, setShowMessageInput] = useState(false)
  
  const { data: maintenanceStatus, isLoading } = useMaintenanceStatus()
  const toggleMaintenance = useToggleMaintenance()

  const handleToggle = (enabled) => {
    if (enabled && showMessageInput && customMessage.trim()) {
      // Enable with custom message
      toggleMaintenance.mutate({
        isEnabled: enabled,
        message: customMessage.trim(),
        adminEmail
      })
      setShowMessageInput(false)
      setCustomMessage('')
    } else if (enabled && !showMessageInput) {
      // Show message input for enabling
      setShowMessageInput(true)
    } else {
      // Disable maintenance
      toggleMaintenance.mutate({
        isEnabled: enabled,
        adminEmail
      })
      setShowMessageInput(false)
    }
  }

  const handleQuickEnable = () => {
    toggleMaintenance.mutate({
      isEnabled: true,
      message: "We're currently performing scheduled maintenance to bring you an even better experience.",
      adminEmail
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Wrench className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            {maintenanceStatus?.isEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <Switch
            checked={maintenanceStatus?.isEnabled || false}
            onCheckedChange={handleToggle}
            disabled={toggleMaintenance.isPending}
          />
        </div>
      </div>

      {/* Status Indicator */}
      <div className={`flex items-center space-x-2 p-3 rounded-lg mb-4 ${
        maintenanceStatus?.isEnabled 
          ? 'bg-orange-50 border border-orange-200' 
          : 'bg-green-50 border border-green-200'
      }`}>
        {maintenanceStatus?.isEnabled ? (
          <>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-800 font-medium">
              Site is currently in maintenance mode
            </span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              Site is live and accessible to users
            </span>
          </>
        )}
      </div>

      {/* Current Message Display */}
      {maintenanceStatus?.message && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Maintenance Message:
          </label>
          <div className="p-3 bg-gray-50 rounded-lg border text-sm text-gray-700">
            {maintenanceStatus.message}
          </div>
        </div>
      )}

      {/* Custom Message Input */}
      {showMessageInput && (
        <div className="mb-4 space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Custom Maintenance Message:
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Enter a custom message for users during maintenance..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex space-x-2">
            <Button
              onClick={() => handleToggle(true)}
              disabled={!customMessage.trim() || toggleMaintenance.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {toggleMaintenance.isPending ? 'Enabling...' : 'Enable with Custom Message'}
            </Button>
            <Button
              onClick={() => setShowMessageInput(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!maintenanceStatus?.isEnabled && !showMessageInput && (
        <div className="space-y-2">
          <Button
            onClick={handleQuickEnable}
            disabled={toggleMaintenance.isPending}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {toggleMaintenance.isPending ? 'Enabling...' : 'Quick Enable (Default Message)'}
          </Button>
        </div>
      )}

      {/* Last Updated Info */}
      {maintenanceStatus?.updatedAt && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(maintenanceStatus.updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}

export default MaintenanceToggle
