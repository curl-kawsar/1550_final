import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import ClassTime from '@/models/ClassTime';
import DiagnosticTest from '@/models/DiagnosticTest';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// GET current student's schedule and change count
export async function GET(request) {
  try {
    // Try to get token from both cookie names and authorization header
    const token = request.cookies.get('student-token')?.value || 
                 request.cookies.get('token')?.value ||
                 request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const student = await Student.findById(decoded.studentId).select(
      'classTime diagnosticTestDate classTimeChangeCount diagnosticTestChangeCount classTimeChangeHistory diagnosticTestChangeHistory'
    );

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      currentSchedule: {
        classTime: student.classTime,
        diagnosticTestDate: student.diagnosticTestDate
      },
      changeCounts: {
        classTime: student.classTimeChangeCount || 0,
        diagnosticTest: student.diagnosticTestChangeCount || 0
      },
      changeHistory: {
        classTime: student.classTimeChangeHistory || [],
        diagnosticTest: student.diagnosticTestChangeHistory || []
      },
      canChange: {
        classTime: (student.classTimeChangeCount || 0) < 2,
        diagnosticTest: (student.diagnosticTestChangeCount || 0) < 2
      }
    });

  } catch (error) {
    console.error('Error fetching student schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

// PUT - Update student's schedule
export async function PUT(request) {
  try {
    // Try to get token from both cookie names and authorization header
    const token = request.cookies.get('student-token')?.value || 
                 request.cookies.get('token')?.value ||
                 request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { changeType, newValue } = await request.json();

    if (!changeType || !newValue) {
      return NextResponse.json(
        { error: 'changeType and newValue are required' },
        { status: 400 }
      );
    }

    if (!['classTime', 'diagnosticTest'].includes(changeType)) {
      return NextResponse.json(
        { error: 'Invalid changeType. Must be "classTime" or "diagnosticTest"' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const student = await Student.findById(decoded.studentId);

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Validate the new value based on the change type
    const fieldMapping = {
      classTime: 'classTime',
      diagnosticTest: 'diagnosticTestDate'
    };

    const actualField = fieldMapping[changeType];
    
    // Dynamic validation against actual models
    let isValidOption = false;
    
    try {
      if (changeType === 'classTime') {
        // Check if the class time exists and is active
        const classTime = await ClassTime.findOne({ 
          name: newValue, 
          isActive: true 
        });
        isValidOption = !!classTime;
        
        // If not found in dynamic data, check legacy values as fallback
        if (!isValidOption) {
          const legacyClassTimes = [
            'Mon & Wed - 4:00 PM Pacific',
            'Mon & Wed - 7:00 PM Pacific',
            'Tue & Thu - 4:00 PM Pacific',
            'Tue & Thu - 7:00 PM Pacific'
          ];
          isValidOption = legacyClassTimes.includes(newValue);
        }
      } else if (changeType === 'diagnosticTest') {
        // Check if the diagnostic test exists and is active
        const diagnosticTest = await DiagnosticTest.findOne({ 
          name: newValue, 
          isActive: true 
        });
        isValidOption = !!diagnosticTest;
        
        // If not found in dynamic data, check legacy values as fallback
        if (!isValidOption) {
          const legacyDiagnosticTests = [
            'Saturday September 27th 8:30am - noon PST',
            'Sunday September 28th 8:30am - noon PST',
            'I can\'t make either of these dates (reply below with if neither option works for you)',
            'I can\'t make any of these dates'
          ];
          isValidOption = legacyDiagnosticTests.includes(newValue);
        }
      }
    } catch (validationError) {
      console.error('Error during schedule validation:', validationError);
      // If validation fails due to database issues, allow the change
      // This prevents blocking students during system issues
      isValidOption = true;
    }
    
    if (!isValidOption) {
      return NextResponse.json(
        { error: `Invalid ${changeType} option. Please select from the available options.` },
        { status: 400 }
      );
    }

    // Check if the student has already reached the change limit
    const changeCountField = `${changeType}ChangeCount`;
    const currentChangeCount = student[changeCountField] || 0;

    if (currentChangeCount >= 2) {
      return NextResponse.json(
        { error: `You have already reached the maximum limit of 2 changes for ${changeType}` },
        { status: 400 }
      );
    }

    // Check if the new value is different from current value
    const currentValue = student[actualField];
    if (currentValue === newValue) {
      return NextResponse.json(
        { error: `You are already enrolled in this ${changeType}` },
        { status: 400 }
      );
    }

    // Update the schedule and track the change
    const updateData = {
      [actualField]: newValue,
      [changeCountField]: currentChangeCount + 1,
      [`${changeType}ChangeHistory`]: [
        ...(student[`${changeType}ChangeHistory`] || []),
        {
          from: currentValue,
          to: newValue,
          changedAt: new Date()
        }
      ]
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      decoded.studentId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('classTime diagnosticTestDate classTimeChangeCount diagnosticTestChangeCount');

    return NextResponse.json({
      message: `${changeType} updated successfully`,
      newSchedule: {
        classTime: updatedStudent.classTime,
        diagnosticTestDate: updatedStudent.diagnosticTestDate
      },
      changeCounts: {
        classTime: updatedStudent.classTimeChangeCount || 0,
        diagnosticTest: updatedStudent.diagnosticTestChangeCount || 0
      },
      canChange: {
        classTime: (updatedStudent.classTimeChangeCount || 0) < 2,
        diagnosticTest: (updatedStudent.diagnosticTestChangeCount || 0) < 2
      }
    });

  } catch (error) {
    console.error('Error updating student schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}