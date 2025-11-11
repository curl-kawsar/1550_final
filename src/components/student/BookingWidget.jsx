"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function BookingWidget() {
  const [refreshing, setRefreshing] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    // Check if script is already loaded
    if (!document.querySelector('script[src="https://collegemastermind.trafft.com/embed.js"]')) {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = 'https://collegemastermind.trafft.com/embed.js'
      script.async = true
      document.head.appendChild(script)
    }
  }, [key]) // Re-run when key changes

  const handleRefresh = () => {
    setRefreshing(true)
    // Force re-render of the widget by changing the key
    setKey(prev => prev + 1)
    setTimeout(() => setRefreshing(false), 2000) // Longer timeout for widget loading
  }

  return (
    <div className="space-y-4">
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Book Your Consultation</h3>
          <p className="text-sm text-gray-600">Schedule a personalized session with our experts</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Booking Widget */}
      <div 
        key={key}
        className="embedded-booking" 
        data-url="https://collegemastermind.trafft.com" 
        data-query="&t=s&uuid=dac35b76-c97a-438f-a112-e5bf52318eb4" 
        data-lang="en" 
        data-autoresize="0" 
        data-showsidebar="1" 
        style={{ minWidth: '320px', height: '768px' }}
      />
    </div>
  )
}