import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';
import ClassTime from '@/models/ClassTime';
import Student from '@/models/Student';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export async function POST(request) {
  try {
    await connectToDatabase();
    
    // Verify admin token
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    if (!['admin', 'super-admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const results = {
      classTimesCreated: 0,
      studentsUpdated: 0,
      enrollmentCountsUpdated: 0,
      errors: []
    };

    // Step 1: Create default class times if they don't exist
    const existingClassTimes = await ClassTime.find().lean();
    const legacyClassTimes = [
      'Mon & Wed - 4:00 PM Pacific',
      'Mon & Wed - 7:00 PM Pacific',
      'Tue & Thu - 4:00 PM Pacific',
      'Tue & Thu - 7:00 PM Pacific'
    ];

    const classTimeMap = {
      'Mon & Wed - 4:00 PM Pacific': {
        name: 'Mon & Wed - 4:00 PM Pacific',
        dayOfWeek: ['Monday', 'Wednesday'],
        startTime: '16:00',
        endTime: '17:00',
        timezone: 'Pacific',
        capacity: 50,
        minimumRequired: 40,
        description: 'Monday and Wednesday afternoon class',
        sortOrder: 1,
        isActive: true
      },
      'Mon & Wed - 7:00 PM Pacific': {
        name: 'Mon & Wed - 7:00 PM Pacific',
        dayOfWeek: ['Monday', 'Wednesday'],
        startTime: '19:00',
        endTime: '20:00',
        timezone: 'Pacific',
        capacity: 50,
        minimumRequired: 40,
        description: 'Monday and Wednesday evening class',
        sortOrder: 2,
        isActive: true
      },
      'Tue & Thu - 4:00 PM Pacific': {
        name: 'Tue & Thu - 4:00 PM Pacific',
        dayOfWeek: ['Tuesday', 'Thursday'],
        startTime: '16:00',
        endTime: '17:00',
        timezone: 'Pacific',
        capacity: 50,
        minimumRequired: 40,
        description: 'Tuesday and Thursday afternoon class',
        sortOrder: 3,
        isActive: true
      },
      'Tue & Thu - 7:00 PM Pacific': {
        name: 'Tue & Thu - 7:00 PM Pacific',
        dayOfWeek: ['Tuesday', 'Thursday'],
        startTime: '19:00',
        endTime: '20:00',
        timezone: 'Pacific',
        capacity: 50,
        minimumRequired: 40,
        description: 'Tuesday and Thursday evening class',
        sortOrder: 4,
        isActive: true
      }
    };

    // Create missing class times
    for (const legacyTime of legacyClassTimes) {
      const exists = existingClassTimes.find(ct => ct.name === legacyTime);
      if (!exists) {
        try {
          const classTimeData = {
            ...classTimeMap[legacyTime],
            createdBy: decoded.adminId
          };
          const classTime = new ClassTime(classTimeData);
          await classTime.save();
          results.classTimesCreated++;
        } catch (error) {
          results.errors.push(`Failed to create class time "${legacyTime}": ${error.message}`);
        }
      }
    }

    // Step 2: Update enrollment counts for all class times
    const allClassTimes = await ClassTime.find().lean();
    for (const classTime of allClassTimes) {
      try {
        const classTimeDoc = await ClassTime.findById(classTime._id);
        await classTimeDoc.updateEnrollmentCount();
        results.enrollmentCountsUpdated++;
      } catch (error) {
        results.errors.push(`Failed to update enrollment count for "${classTime.name}": ${error.message}`);
      }
    }

    // Step 3: Validate all students have valid class times
    const studentsWithInvalidClassTimes = await Student.find({
      classTime: { $nin: allClassTimes.map(ct => ct.name) }
    });

    for (const student of studentsWithInvalidClassTimes) {
      results.errors.push(`Student ${student.email} has invalid class time: "${student.classTime}"`);
    }

    return NextResponse.json({
      message: 'Migration completed',
      results,
      summary: {
        totalClassTimes: allClassTimes.length,
        totalStudents: await Student.countDocuments(),
        studentsWithInvalidClassTimes: studentsWithInvalidClassTimes.length
      }
    });

  } catch (error) {
    console.error('Error during migration:', error);
    return NextResponse.json(
      { error: 'Internal server error during migration' },
      { status: 500 }
    );
  }
}
