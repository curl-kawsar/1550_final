import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';

export async function PATCH(request) {
  try {
    await dbConnect();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const studentEmail = decoded.email;
    if (!studentEmail) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      phoneNumber,
      state,
      parentFirstName,
      parentLastName,
      parentPhoneNumber
    } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json({ 
        error: 'First name and last name are required' 
      }, { status: 400 });
    }

    // Find the student
    const student = await Student.findOne({ email: studentEmail });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Prepare update object with only allowed fields
    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ...(phoneNumber && { phoneNumber: phoneNumber.trim() }),
      ...(state && { state: state.trim() }),
      ...(parentFirstName && { parentFirstName: parentFirstName.trim() }),
      ...(parentLastName && { parentLastName: parentLastName.trim() }),
      ...(parentPhoneNumber && { parentPhoneNumber: parentPhoneNumber.trim() }),
      updatedAt: new Date()
    };

    // Update the student
    const updatedStudent = await Student.findOneAndUpdate(
      { email: studentEmail },
      updateData,
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedStudent) {
      return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      student: {
        _id: updatedStudent._id,
        firstName: updatedStudent.firstName,
        lastName: updatedStudent.lastName,
        email: updatedStudent.email,
        phoneNumber: updatedStudent.phoneNumber,
        state: updatedStudent.state,
        parentFirstName: updatedStudent.parentFirstName,
        parentLastName: updatedStudent.parentLastName,
        parentEmail: updatedStudent.parentEmail,
        parentPhoneNumber: updatedStudent.parentPhoneNumber,
        updatedAt: updatedStudent.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating student profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const studentEmail = decoded.email;
    if (!studentEmail) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    // Find the student
    const student = await Student.findOne({ email: studentEmail }).select('-password');
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phoneNumber: student.phoneNumber,
        state: student.state,
        parentFirstName: student.parentFirstName,
        parentLastName: student.parentLastName,
        parentEmail: student.parentEmail,
        parentPhoneNumber: student.parentPhoneNumber,
        classTime: student.classTime,
        diagnosticTestDate: student.diagnosticTestDate,
        status: student.status,
        submittedAt: student.submittedAt,
        currentGPA: student.currentGPA,
        graduationYear: student.graduationYear,
        highSchoolName: student.highSchoolName,
        classRigor: student.classRigor,
        universityGoal: student.universityGoal,
        updatedAt: student.updatedAt,
        createdAt: student.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
