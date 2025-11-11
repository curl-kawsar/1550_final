import { NextResponse } from 'next/server'
import { getTraffTAppointments } from '@/services/trafftService'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    // Check admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (!decoded.role || (decoded.role !== 'admin' && decoded.role !== 'super-admin')) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const filters = {
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 50,
      customerId: searchParams.get('customerId'),
      employeeId: searchParams.get('employeeId'),
      serviceId: searchParams.get('serviceId'),
      locationId: searchParams.get('locationId'),
      status: searchParams.get('status')
    }

    // Fetch appointments from Trafft
    const result = await getTraffTAppointments(filters)

    if (result.success) {
      return NextResponse.json({
        success: true,
        appointments: result.appointments,
        pagination: result.pagination
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        appointments: [],
        pagination: null
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in trafft appointments API:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      appointments: [],
      pagination: null
    }, { status: 500 })
  }
}