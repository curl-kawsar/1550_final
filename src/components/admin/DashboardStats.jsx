"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts'
import { useDashboardStats } from '@/hooks/useAdmin'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"

const DashboardStats = () => {
  const { data: stats, isLoading, error, refetch, isRefetching } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard statistics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load statistics</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  const statusData = [
    { name: 'Pending', value: stats.statusCounts.pending, color: '#F59E0B' },
    { name: 'Reviewed', value: stats.statusCounts.reviewed, color: '#3B82F6' },
    { name: 'Contacted', value: stats.statusCounts.contacted, color: '#10B981' }
  ]

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Statistics</h2>
          <p className="text-gray-600">Real-time overview of student registrations and system metrics</p>
        </div>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">👥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">All time registrations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ambassadors</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">🤝</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ambassadorStats?.totalAmbassadors || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ambassadorStats?.activeAmbassadors || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent (7 days)</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📈</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentRegistrations}</div>
            <p className="text-xs text-muted-foreground">New registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">🎓</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.gpaStats.averageGPA ? stats.gpaStats.averageGPA.toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Range: {stats.gpaStats.minGPA?.toFixed(1) || '0.0'} - {stats.gpaStats.maxGPA?.toFixed(1) || '0.0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">⏳</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.statusCounts.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Status</CardTitle>
            <CardDescription>Distribution of student statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* University Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>University Preferences</CardTitle>
            <CardDescription>What type of universities students want</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.universityPreferences}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="_id" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Class Rigor Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Class Rigor Distribution</CardTitle>
            <CardDescription>Academic rigor of student course loads</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.classRigorDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="_id"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Registration Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Timeline</CardTitle>
            <CardDescription>Daily registrations over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.registrationsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="_id"
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value) => [value, 'Registrations']}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ambassador Performance */}
        {stats.ambassadorStats && stats.ambassadorStats.topAmbassadors && stats.ambassadorStats.topAmbassadors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Ambassadors</CardTitle>
              <CardDescription>Ambassadors by student count</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.ambassadorStats.topAmbassadors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="ambassadorCode"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(label) => `Ambassador: ${label}`}
                    formatter={(value, name, props) => [
                      value, 
                      'Students',
                      props.payload?.ambassadorName ? `Name: ${props.payload.ambassadorName}` : ''
                    ]}
                  />
                  <Bar dataKey="studentCount" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Ambassador Assignment Summary */}
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Students with Ambassadors:</span>
                    <span className="ml-2 font-semibold">{stats.ambassadorStats.studentsWithAmbassadors}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Students without Ambassadors:</span>
                    <span className="ml-2 font-semibold">{stats.ambassadorStats.studentsWithoutAmbassadors}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default DashboardStats