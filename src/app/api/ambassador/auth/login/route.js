import connectToDatabase from '@/lib/mongodb'
import Ambassador from '@/models/Ambassador'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { email, password } = body
    
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }
    
    // Find ambassador by email
    const ambassador = await Ambassador.findOne({ email: email.toLowerCase() })
    if (!ambassador) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    
    // Check if ambassador is active
    if (!ambassador.isActive) {
      return Response.json({ error: 'Ambassador account is deactivated. Please contact administrator.' }, { status: 401 })
    }
    
    // Check password
    const isPasswordValid = await ambassador.comparePassword(password)
    if (!isPasswordValid) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: ambassador._id, 
        email: ambassador.email,
        role: 'ambassador',
        ambassadorCode: ambassador.ambassadorCode
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    // Set httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set('ambassador-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })
    
    // Return ambassador data without password
    const ambassadorData = {
      id: ambassador._id,
      firstName: ambassador.firstName,
      lastName: ambassador.lastName,
      email: ambassador.email,
      phoneNumber: ambassador.phoneNumber,
      ambassadorCode: ambassador.ambassadorCode,
      totalStudents: ambassador.totalStudents,
      commission: ambassador.commission
    }
    
    return Response.json({
      message: 'Login successful',
      ambassador: ambassadorData,
      token // Also return in response for client-side storage if needed
    })
    
  } catch (error) {
    console.error('Ambassador login error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}