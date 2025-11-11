import { NextResponse } from 'next/server'
import { getTraffTCustomers } from '@/services/trafftService'
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
      email: searchParams.get('email'),
      firstName: searchParams.get('firstName'),
      lastName: searchParams.get('lastName'),
      phoneNumber: searchParams.get('phoneNumber')
    }

    // Fetch customers from Trafft
    const result = await getTraffTCustomers(filters)

    if (result.success) {
      return NextResponse.json({
        success: true,
        customers: result.customers,
        pagination: result.pagination
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        customers: [],
        pagination: null
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in trafft customers API:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      customers: [],
      pagination: null
    }, { status: 500 })
  }
}