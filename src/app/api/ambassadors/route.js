import connectToDatabase from '@/lib/mongodb'
import Ambassador from '@/models/Ambassador'
import Admin from '@/models/Admin'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// GET - Fetch all ambassadors (Admin only)
export async function GET() {
  try {
    await connectToDatabase()
    
    // Check admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value
    
    if (!token) {
      return Response.json({ error: 'Admin authentication required' }, { status: 401 })
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (!decoded.role || (decoded.role !== 'admin' && decoded.role !== 'super-admin')) {
        console.error('Invalid role:', decoded.role)
        return Response.json({ error: 'Admin access required' }, { status: 403 })
      }
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError)
      return Response.json({ error: 'Invalid admin token' }, { status: 401 })
    }
    
    const ambassadors = await Ambassador.find()
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
    
    return Response.json({ ambassadors })
  } catch (error) {
    console.error('Error fetching ambassadors:', error)
    return Response.json({ error: 'Failed to fetch ambassadors' }, { status: 500 })
  }
}

// POST - Create new ambassador (Admin only)
export async function POST(request) {
  try {
    await connectToDatabase()
    
    // Check admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value
    
    if (!token) {
      return Response.json({ error: 'Admin authentication required' }, { status: 401 })
    }
    
    let adminId
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
      if (!decoded.role || (decoded.role !== 'admin' && decoded.role !== 'super-admin')) {
        console.error('Invalid role:', decoded.role)
        return Response.json({ error: 'Admin access required' }, { status: 403 })
      }
      adminId = decoded.adminId
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError)
      return Response.json({ error: 'Invalid admin token' }, { status: 401 })
    }
    
    const body = await request.json()
    const { firstName, lastName, email, password, phoneNumber, commission, notes } = body
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      return Response.json({ 
        error: 'All fields are required: firstName, lastName, email, password, phoneNumber' 
      }, { status: 400 })
    }
    
    // Check if ambassador email already exists
    const existingAmbassador = await Ambassador.findOne({ email: email.toLowerCase() })
    if (existingAmbassador) {
      return Response.json({ error: 'Ambassador with this email already exists' }, { status: 400 })
    }
    
    // Generate unique ambassador code
    const ambassadorCode = await Ambassador.generateAmbassadorCode()
    
    // Create new ambassador
    const newAmbassador = new Ambassador({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phoneNumber: phoneNumber.trim(),
      ambassadorCode,
      createdBy: adminId,
      commission: commission || 0,
      notes: notes?.trim() || ''
    })
    
    await newAmbassador.save()
    
    // Return ambassador without password
    const ambassadorResponse = await Ambassador.findById(newAmbassador._id)
      .populate('createdBy', 'firstName lastName email')
      .select('-password')
    
    return Response.json({ 
      message: 'Ambassador created successfully',
      ambassador: ambassadorResponse
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating ambassador:', error)
    if (error.code === 11000) {
      return Response.json({ error: 'Ambassador with this email already exists' }, { status: 400 })
    }
    return Response.json({ error: 'Failed to create ambassador' }, { status: 500 })
  }
}
