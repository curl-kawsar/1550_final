import connectToDatabase from '@/lib/mongodb'
import Ambassador from '@/models/Ambassador'
import Student from '@/models/Student'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// GET - Fetch single ambassador (Admin only)
export async function GET(request, { params }) {
  try {
    const { id } = params
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
    
    const ambassador = await Ambassador.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .select('-password')
    
    if (!ambassador) {
      return Response.json({ error: 'Ambassador not found' }, { status: 404 })
    }
    
    // Get ambassador's students
    const students = await Student.find({ ambassador: id })
      .select('firstName lastName email phoneNumber createdAt classTime diagnosticTestDate')
      .sort({ createdAt: -1 })
    
    return Response.json({ 
      ambassador: {
        ...ambassador.toObject(),
        students
      }
    })
  } catch (error) {
    console.error('Error fetching ambassador:', error)
    return Response.json({ error: 'Failed to fetch ambassador' }, { status: 500 })
  }
}

// PUT - Update ambassador (Admin only)
export async function PUT(request, { params }) {
  try {
    const { id } = params
    await connectToDatabase()
    
    // Check admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value
    
    if (!token) {
      return Response.json({ error: 'Admin authentication required' }, { status: 401 })
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
      if (!decoded.role || (decoded.role !== 'admin' && decoded.role !== 'super-admin')) {
        console.error('Invalid role:', decoded.role)
        return Response.json({ error: 'Admin access required' }, { status: 403 })
      }
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError)
      return Response.json({ error: 'Invalid admin token' }, { status: 401 })
    }
    
    const body = await request.json()
    const allowedFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'commission', 'notes', 'isActive']
    const updateData = {}
    
    // Filter allowed fields
    for (const field of allowedFields) {
      if (body.hasOwnProperty(field)) {
        updateData[field] = body[field]
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 })
    }
    
    // Trim string fields
    if (updateData.firstName) updateData.firstName = updateData.firstName.trim()
    if (updateData.lastName) updateData.lastName = updateData.lastName.trim()
    if (updateData.email) updateData.email = updateData.email.toLowerCase().trim()
    if (updateData.phoneNumber) updateData.phoneNumber = updateData.phoneNumber.trim()
    if (updateData.notes) updateData.notes = updateData.notes.trim()
    
    const updatedAmbassador = await Ambassador.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email').select('-password')
    
    if (!updatedAmbassador) {
      return Response.json({ error: 'Ambassador not found' }, { status: 404 })
    }
    
    return Response.json({
      message: 'Ambassador updated successfully',
      ambassador: updatedAmbassador
    })
  } catch (error) {
    console.error('Error updating ambassador:', error)
    if (error.code === 11000) {
      return Response.json({ error: 'Ambassador with this email already exists' }, { status: 400 })
    }
    return Response.json({ error: 'Failed to update ambassador' }, { status: 500 })
  }
}

// DELETE - Delete ambassador (Admin only)
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await connectToDatabase()
    
    // Check admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value
    
    if (!token) {
      return Response.json({ error: 'Admin authentication required' }, { status: 401 })
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
      if (!decoded.role || (decoded.role !== 'admin' && decoded.role !== 'super-admin')) {
        console.error('Invalid role:', decoded.role)
        return Response.json({ error: 'Admin access required' }, { status: 403 })
      }
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError)
      return Response.json({ error: 'Invalid admin token' }, { status: 401 })
    }
    
    // Check if ambassador has students
    const studentCount = await Student.countDocuments({ ambassador: id })
    if (studentCount > 0) {
      return Response.json({ 
        error: `Cannot delete ambassador with ${studentCount} assigned students. Please reassign students first.` 
      }, { status: 400 })
    }
    
    const deletedAmbassador = await Ambassador.findByIdAndDelete(id)
    
    if (!deletedAmbassador) {
      return Response.json({ error: 'Ambassador not found' }, { status: 404 })
    }
    
    return Response.json({ message: 'Ambassador deleted successfully' })
  } catch (error) {
    console.error('Error deleting ambassador:', error)
    return Response.json({ error: 'Failed to delete ambassador' }, { status: 500 })
  }
}