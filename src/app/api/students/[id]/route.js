import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Student from '@/models/Student'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

// GET - Fetch individual student
export async function GET(request, { params }) {
  try {
    await connectToDatabase()
    
    const { id } = await params
    
    const student = await Student.findById(id)
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update student status (used by admin for status changes)
export async function PATCH(request, { params }) {
  try {
    // Check admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (!decoded.role || (decoded.role !== 'admin' && decoded.role !== 'super-admin')) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
    }

    await connectToDatabase()
    
    const { id } = await params
    const body = await request.json()
    
    // Find the student
    const student = await Student.findById(id)
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Update only the provided fields
    const updateData = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.classTime !== undefined) updateData.classTime = body.classTime
    if (body.diagnosticTestDate !== undefined) updateData.diagnosticTestDate = body.diagnosticTestDate

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    console.log('Student updated via PATCH:', {
      studentId: id,
      updatedFields: Object.keys(updateData),
      adminId: decoded.adminId
    })

    return NextResponse.json({ 
      message: 'Student updated successfully',
      student: updatedStudent 
    })
  } catch (error) {
    console.error('Error updating student (PATCH):', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update student data (used by admin for class time and diagnostic test changes)
export async function PUT(request, { params }) {
  try {
    // Check admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (!decoded.role || (decoded.role !== 'admin' && decoded.role !== 'super-admin')) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
    }

    await connectToDatabase()
    
    const { id } = await params
    const body = await request.json()
    
    // Find the student
    const student = await Student.findById(id)
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData = {}
    
    // Handle class time changes with change count tracking
    if (body.classTime !== undefined && body.classTime !== student.classTime) {
      if (student.classTimeChangeCount >= 2) {
        return NextResponse.json({ 
          error: 'Maximum class time changes exceeded (2 changes allowed)' 
        }, { status: 400 })
      }
      
      updateData.classTime = body.classTime
      updateData.classTimeChangeCount = (student.classTimeChangeCount || 0) + 1
      updateData.$push = {
        classTimeChangeHistory: {
          previousValue: student.classTime,
          newValue: body.classTime,
          changedAt: new Date(),
          changedBy: decoded.adminId
        }
      }
    }
    
    // Handle diagnostic test changes with change count tracking
    if (body.diagnosticTestDate !== undefined && body.diagnosticTestDate !== student.diagnosticTestDate) {
      if (student.diagnosticTestChangeCount >= 2) {
        return NextResponse.json({ 
          error: 'Maximum diagnostic test changes exceeded (2 changes allowed)' 
        }, { status: 400 })
      }
      
      updateData.diagnosticTestDate = body.diagnosticTestDate
      updateData.diagnosticTestChangeCount = (student.diagnosticTestChangeCount || 0) + 1
      
      if (!updateData.$push) updateData.$push = {}
      updateData.$push.diagnosticTestChangeHistory = {
        previousValue: student.diagnosticTestDate,
        newValue: body.diagnosticTestDate,
        changedAt: new Date(),
        changedBy: decoded.adminId
      }
    }

    // If no changes were made
    if (Object.keys(updateData).length === 0 || (Object.keys(updateData).length === 1 && updateData.$push)) {
      return NextResponse.json({ 
        message: 'No changes detected',
        student: student 
      })
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    console.log('Student updated via PUT:', {
      studentId: id,
      updatedFields: Object.keys(updateData).filter(key => key !== '$push'),
      adminId: decoded.adminId
    })

    return NextResponse.json({ 
      message: 'Student updated successfully',
      student: updatedStudent 
    })
  } catch (error) {
    console.error('Error updating student (PUT):', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete student (admin only)
export async function DELETE(request, { params }) {
  try {
    // Check admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (!decoded.role || (decoded.role !== 'admin' && decoded.role !== 'super-admin')) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
    }

    await connectToDatabase()
    
    const { id } = await params
    
    const deletedStudent = await Student.findByIdAndDelete(id)
    if (!deletedStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    console.log('Student deleted:', {
      studentId: id,
      studentEmail: deletedStudent.email,
      adminId: decoded.adminId
    })

    return NextResponse.json({ 
      message: 'Student deleted successfully',
      student: deletedStudent 
    })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}