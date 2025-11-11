import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';
import ClassTime from '@/models/ClassTime';
import DiagnosticTest from '@/models/DiagnosticTest';
import bcrypt from 'bcryptjs';
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
      adminCreated: false,
      classTimesCreated: 0,
      diagnosticTestsCreated: 0,
      errors: []
    };

    // Create default admin if none exists
    try {
      const adminCount = await Admin.countDocuments();
      if (adminCount === 0) {
        const defaultAdmin = new Admin({
          email: 'admin@1550plus.com',
          password: 'admin123', // Will be hashed by the model
          name: 'System Administrator',
          role: 'super-admin'
        });
        await defaultAdmin.save();
        results.adminCreated = true;
      }
    } catch (error) {
      results.errors.push(`Failed to create admin: ${error.message}`);
    }

    // Create default class times if none exist
    try {
      const classTimeCount = await ClassTime.countDocuments();
      if (classTimeCount === 0) {
        const defaultClassTimes = [
          {
            name: 'Mon & Wed - 4:00 PM Pacific',
            dayOfWeek: ['Monday', 'Wednesday'],
            startTime: '16:00',
            endTime: '17:00',
            timezone: 'Pacific',
            capacity: 50,
            minimumRequired: 40,
            description: 'Monday and Wednesday afternoon class',
            sortOrder: 1,
            isActive: true,
            createdBy: decoded.adminId
          },
          {
            name: 'Mon & Wed - 7:00 PM Pacific',
            dayOfWeek: ['Monday', 'Wednesday'],
            startTime: '19:00',
            endTime: '20:00',
            timezone: 'Pacific',
            capacity: 50,
            minimumRequired: 40,
            description: 'Monday and Wednesday evening class',
            sortOrder: 2,
            isActive: true,
            createdBy: decoded.adminId
          },
          {
            name: 'Tue & Thu - 4:00 PM Pacific',
            dayOfWeek: ['Tuesday', 'Thursday'],
            startTime: '16:00',
            endTime: '17:00',
            timezone: 'Pacific',
            capacity: 50,
            minimumRequired: 40,
            description: 'Tuesday and Thursday afternoon class',
            sortOrder: 3,
            isActive: true,
            createdBy: decoded.adminId
          },
          {
            name: 'Tue & Thu - 7:00 PM Pacific',
            dayOfWeek: ['Tuesday', 'Thursday'],
            startTime: '19:00',
            endTime: '20:00',
            timezone: 'Pacific',
            capacity: 50,
            minimumRequired: 40,
            description: 'Tuesday and Thursday evening class',
            sortOrder: 4,
            isActive: true,
            createdBy: decoded.adminId
          }
        ];

        for (const classTimeData of defaultClassTimes) {
          try {
            const classTime = new ClassTime(classTimeData);
            await classTime.save();
            results.classTimesCreated++;
          } catch (error) {
            results.errors.push(`Failed to create class time "${classTimeData.name}": ${error.message}`);
          }
        }
      }
    } catch (error) {
      results.errors.push(`Failed to create class times: ${error.message}`);
    }

    // Create default diagnostic tests if none exist
    try {
      const diagnosticTestCount = await DiagnosticTest.countDocuments();
      if (diagnosticTestCount === 0) {
        const today = new Date();
        const nextSaturday = new Date(today);
        nextSaturday.setDate(today.getDate() + (6 - today.getDay())); // Next Saturday
        
        const nextSunday = new Date(nextSaturday);
        nextSunday.setDate(nextSaturday.getDate() + 1); // Next Sunday

        const defaultDiagnosticTests = [
          {
            name: 'Saturday September 27th 8:30am - noon PST',
            date: nextSaturday,
            startTime: '08:30',
            endTime: '12:00',
            timezone: 'PST',
            capacity: 100,
            location: 'Online',
            description: 'Full SAT diagnostic test - Saturday session',
            instructions: 'Please join the test 15 minutes early. Have a calculator, pencils, and scratch paper ready.',
            sortOrder: 1,
            duration: 210,
            isActive: true,
            createdBy: decoded.adminId
          },
          {
            name: 'Sunday September 28th 8:30am - noon PST',
            date: nextSunday,
            startTime: '08:30',
            endTime: '12:00',
            timezone: 'PST',
            capacity: 100,
            location: 'Online',
            description: 'Full SAT diagnostic test - Sunday session',
            instructions: 'Please join the test 15 minutes early. Have a calculator, pencils, and scratch paper ready.',
            sortOrder: 2,
            duration: 210,
            isActive: true,
            createdBy: decoded.adminId
          }
        ];

        for (const testData of defaultDiagnosticTests) {
          try {
            const diagnosticTest = new DiagnosticTest(testData);
            await diagnosticTest.save();
            results.diagnosticTestsCreated++;
          } catch (error) {
            results.errors.push(`Failed to create diagnostic test "${testData.name}": ${error.message}`);
          }
        }
      }
    } catch (error) {
      results.errors.push(`Failed to create diagnostic tests: ${error.message}`);
    }

    return NextResponse.json({
      message: 'Default data creation completed',
      results
    });

  } catch (error) {
    console.error('Error creating default data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}