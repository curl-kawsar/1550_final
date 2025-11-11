"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
// Remove direct import of Trafft service - we'll use API routes instead
import { 
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

export default function AppointmentManagement() {
  const [customers, setCustomers] = useState([])
  const [appointments, setAppointments] = useState([])
  const [platformStudents, setPlatformStudents] = useState([])
  const [matchedCustomers, setMatchedCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Fetch platform students
  const fetchPlatformStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setPlatformStudents(data.students || [])
      }
    } catch (error) {
      console.error('Error fetching platform students:', error)
    }
  }

  // Fetch Trafft data via API routes
  const fetchTraffTData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Fetching Trafft data via API routes...')
      
      // Fetch customers and appointments in parallel via API routes
      const [customersResponse, appointmentsResponse] = await Promise.all([
        fetch('/api/trafft/customers?limit=100'),
        fetch('/api/trafft/appointments?limit=100')
      ])
      
      console.log('Trafft API responses:', {
        customersStatus: customersResponse.status,
        appointmentsStatus: appointmentsResponse.status
      })

      // Handle customers response
      if (customersResponse.ok) {
        const customersData = await customersResponse.json()
        if (customersData.success) {
          setCustomers(customersData.customers)
        } else {
          throw new Error(customersData.error || 'Failed to fetch customers')
        }
      } else {
        let errorMessage = `Failed to fetch customers: ${customersResponse.status}`
        try {
          const errorData = await customersResponse.json()
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
        }
        throw new Error(errorMessage)
      }

      // Handle appointments response
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        if (appointmentsData.success) {
          setAppointments(appointmentsData.appointments)
        } else {
          console.warn('Failed to fetch appointments:', appointmentsData.error)
          setAppointments([])
        }
      } else {
        console.warn('Failed to fetch appointments:', appointmentsResponse.status)
        setAppointments([])
      }

    } catch (err) {
      setError(err.message)
      console.error('Error fetching Trafft data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Match customers with platform students
  useEffect(() => {
    if (customers.length > 0 && platformStudents.length > 0) {
      const studentEmails = new Set(platformStudents.map(s => s.email.toLowerCase()))
      
      const matched = customers.filter(customer => 
        customer.email && studentEmails.has(customer.email.toLowerCase())
      ).map(customer => {
        // Find matching student
        const student = platformStudents.find(s => 
          s.email.toLowerCase() === customer.email.toLowerCase()
        )
        
        // Find customer's appointments
        const customerAppointments = appointments.filter(apt => 
          apt.customer_id === customer.id
        )

        return {
          ...customer,
          platformStudent: student,
          appointments: customerAppointments,
          appointmentCount: customerAppointments.length
        }
      })

      setMatchedCustomers(matched)
    }
  }, [customers, platformStudents, appointments])

  // Filter matched customers
  const filteredCustomers = matchedCustomers.filter(customer => {
    const matchesSearch = !searchTerm || 
      customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || 
      customer.appointments.some(apt => apt.status === statusFilter)

    return matchesSearch && matchesStatus
  })

  // Unified refresh handler
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        fetchPlatformStudents(),
        fetchTraffTData()
      ])
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchPlatformStudents()
    fetchTraffTData()
  }, [])

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'canceled': return 'bg-red-100 text-red-800 border-red-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircle className="w-3 h-3" />
      case 'pending': return <Clock className="w-3 h-3" />
      case 'canceled':
      case 'rejected': return <XCircle className="w-3 h-3" />
      case 'no_show': return <AlertCircle className="w-3 h-3" />
      default: return <Calendar className="w-3 h-3" />
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#457BF5]" />
        <span className="ml-2 text-gray-600">Loading appointment data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing || loading}
              className="bg-[#457BF5] hover:bg-[#3a6ae0]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${(refreshing || loading) ? 'animate-spin' : ''}`} />
              {(refreshing || loading) ? 'Retrying...' : 'Try Again'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="w-8 h-8 text-[#457BF5] mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Students</p>
                <p className="text-2xl font-bold text-gray-900">{platformStudents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Trafft Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Matched Customers</p>
                <p className="text-2xl font-bold text-gray-900">{matchedCustomers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {matchedCustomers.reduce((sum, c) => sum + c.appointmentCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>1550Plus Students with Appointments</CardTitle>
            <Button 
              onClick={handleRefresh} 
              size="sm"
              disabled={refreshing || loading}
              className="bg-[#457BF5] hover:bg-[#3a6ae0]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${(refreshing || loading) ? 'animate-spin' : ''}`} />
              {(refreshing || loading) ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#457BF5]"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-[#457BF5] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#457BF5] focus:border-[#457BF5]"
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="canceled">Canceled</option>
              <option value="rejected">Rejected</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          {/* Customer List */}
          <div className="space-y-4">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {matchedCustomers.length === 0 ? 'No Matched Customers' : 'No Results Found'}
                </h3>
                <p className="text-gray-600">
                  {matchedCustomers.length === 0 
                    ? 'No platform students have booked appointments yet.'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <Card key={customer.id} className="border-l-4 border-l-[#457BF5]">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center text-gray-600 mt-1">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {customer.appointmentCount} {customer.appointmentCount === 1 ? 'Appointment' : 'Appointments'}
                      </Badge>
                    </div>

                    {/* Platform Student Info */}
                    {customer.platformStudent && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Platform Student Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">High School:</span>
                            <span className="ml-2 font-medium">{customer.platformStudent.highSchoolName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Class Time:</span>
                            <span className="ml-2 font-medium">{customer.platformStudent.classTime || 'Not set'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <Badge className="ml-2" variant="outline">
                              {customer.platformStudent.status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Appointments */}
                    {customer.appointments.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Appointments</h4>
                        <div className="space-y-2">
                          {customer.appointments.map((appointment) => (
                            <div key={appointment.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {formatDate(appointment.start_date)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Service: {appointment.service?.name || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1`}>
                                {getStatusIcon(appointment.status)}
                                {appointment.status || 'Unknown'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}