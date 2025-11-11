import connectToDatabase from '@/lib/mongodb'
import Ambassador from '@/models/Ambassador'
import Student from '@/models/Student'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    await connectToDatabase()
    
    // Get token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('ambassador-token')?.value
    
    if (!token) {
      return Response.json({ error: 'No authentication token' }, { status: 401 })
    }
    
    // Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (jwtError) {
      return Response.json({ error: 'Invalid or expired token' }, { status: 401 })
    }
    
    if (decoded.role !== 'ambassador') {
      return Response.json({ error: 'Not authorized as ambassador' }, { status: 403 })
    }
    
    // Get ambassador details
    const ambassador = await Ambassador.findById(decoded.id).select('-password')
    if (!ambassador) {
      return Response.json({ error: 'Ambassador not found' }, { status: 404 })
    }
    
    if (!ambassador.isActive) {
      return Response.json({ error: 'Ambassador account is deactivated' }, { status: 401 })
    }
    
    // Get ambassador's students
    const students = await Student.find({ ambassador: ambassador._id })
      .select('firstName lastName email phoneNumber createdAt classTime diagnosticTestDate parentalApprovalStatus')
      .sort({ createdAt: -1 })
    
    // Update ambassador's student count
    await ambassador.updateStudentCount()
    
    return Response.json({
      ambassador: {
        ...ambassador.toObject(),
        students
      }
    })
    
  } catch (error) {
    console.error('Ambassador auth check error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}