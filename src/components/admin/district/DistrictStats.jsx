"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import {
  Building2, Users, Mail, Send, AlertCircle,
  UserCheck, TrendingUp, Clock, Loader2
} from 'lucide-react'

export default function DistrictStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/district/stats')
        const data = await res.json()
        if (data.success) setStats(data.stats)
      } catch (err) {
        console.error('Failed to load district stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!stats) return null

  const cards = [
    { label: 'Total Submissions', value: stats.totalSubmissions, icon: Building2, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Nominees', value: stats.totalNominees, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Emails Generated', value: stats.totalGenerated, icon: Mail, color: 'text-purple-600 bg-purple-50' },
    { label: 'Packages Sent', value: stats.totalSentPackages, icon: Send, color: 'text-green-600 bg-green-50' },
    { label: 'Delivery Issues', value: stats.totalDeliveryIssues, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Registered', value: stats.totalRegistered, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'text-orange-600 bg-orange-50' },
    { label: 'Pending', value: stats.pendingProcessing, icon: Clock, color: 'text-yellow-600 bg-yellow-50' }
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon
        return (
          <Card key={card.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
