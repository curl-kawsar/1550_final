import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import Ambassador from '@/models/Ambassador';
import Admin from '@/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export async function GET(request) {
  try {
    // Check authentication - Cookie first, then Authorization header
    const cookieStore = await cookies();
    let token = cookieStore.get('admin-token')?.value;
    
    // Fallback: Check Authorization header if no cookie
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log('Using Authorization header token');
      }
    }
    
    console.log('Dashboard stats request - Token exists:', !!token);
    console.log('JWT_SECRET configured:', !!JWT_SECRET);
    console.log('All cookies:', Object.fromEntries(cookieStore.getAll().map(c => [c.name, c.value ? 'exists' : 'empty'])));
    
    if (!token) {
      console.log('No admin token found in cookies');
      console.log('Available cookie names:', cookieStore.getAll().map(c => c.name));
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token verified successfully for admin:', decoded.email);
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      console.log('Token being verified:', token.substring(0, 50) + '...');
      return NextResponse.json(
        { error: 'Invalid admin token' },
        { status: 401 }
      );
    }

    if (!decoded.role || (decoded.role !== 'admin' && decoded.role !== 'super-admin')) {
      console.log('Invalid role for dashboard access:', decoded.role);
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    
    // Get total students count
    const totalStudents = await Student.countDocuments();
    
    // Get students by status
    const statusCounts = await Student.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRegistrations = await Student.countDocuments({
      submittedAt: { $gte: sevenDaysAgo }
    });
    
    // Get registrations by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const registrationsByDay = await Student.aggregate([
      {
        $match: {
          submittedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$submittedAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Get university preferences distribution
    const universityPreferences = await Student.aggregate([
      {
        $group: {
          _id: '$universitiesWant',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get class rigor distribution
    const classRigorDistribution = await Student.aggregate([
      {
        $group: {
          _id: '$classRigor',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get average GPA
    const gpaStats = await Student.aggregate([
      {
        $group: {
          _id: null,
          averageGPA: { $avg: '$currentGPA' },
          minGPA: { $min: '$currentGPA' },
          maxGPA: { $max: '$currentGPA' }
        }
      }
    ]);
    
    // Get ambassador statistics
    const totalAmbassadors = await Ambassador.countDocuments();
    const activeAmbassadors = await Ambassador.countDocuments({ isActive: true });
    
    // Get students by ambassador
    const studentsByAmbassador = await Student.aggregate([
      {
        $match: { ambassador: { $ne: null } }
      },
      {
        $lookup: {
          from: 'ambassadors',
          localField: 'ambassador',
          foreignField: '_id',
          as: 'ambassadorInfo'
        }
      },
      {
        $unwind: '$ambassadorInfo'
      },
      {
        $group: {
          _id: '$ambassador',
          ambassadorName: { $first: { $concat: ['$ambassadorInfo.firstName', ' ', '$ambassadorInfo.lastName'] } },
          ambassadorCode: { $first: '$ambassadorInfo.ambassadorCode' },
          studentCount: { $sum: 1 }
        }
      },
      {
        $sort: { studentCount: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    const studentsWithAmbassadors = await Student.countDocuments({ ambassador: { $ne: null } });
    const studentsWithoutAmbassadors = totalStudents - studentsWithAmbassadors;
    
    // Format status counts
    const statusData = {
      pending: 0,
      reviewed: 0,
      contacted: 0
    };
    
    statusCounts.forEach(item => {
      statusData[item._id] = item.count;
    });
    
    return NextResponse.json({
      totalStudents,
      recentRegistrations,
      statusCounts: statusData,
      registrationsByDay,
      universityPreferences,
      classRigorDistribution,
      gpaStats: gpaStats[0] || { averageGPA: 0, minGPA: 0, maxGPA: 0 },
      ambassadorStats: {
        totalAmbassadors,
        activeAmbassadors,
        studentsWithAmbassadors,
        studentsWithoutAmbassadors,
        topAmbassadors: studentsByAmbassador
      }
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}