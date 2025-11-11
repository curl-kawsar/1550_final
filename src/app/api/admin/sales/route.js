import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import Admin from '@/models/Admin';
import { verifyAdminToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export async function GET(request) {
  try {
    let adminPayload = await verifyAdminToken(request);
    if (!adminPayload) {
      // Fallback: Check Authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          await connectToDatabase();
          const admin = await Admin.findById(decoded.adminId || decoded.id);
          if (admin && admin.isActive) {
            adminPayload = {
              id: admin._id,
              email: admin.email,
              name: admin.name,
              role: admin.role
            };
          }
        } catch (error) {
          console.error('Bearer token verification error:', error);
        }
      }
    }
    
    if (!adminPayload) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get all students who have paid for the special offer
    const paidStudents = await Student.find({ 
      hasPaidSpecialOffer: true,
      paymentStatus: 'succeeded'
    })
    .select('firstName lastName email registrationCode paymentDate paymentAmount paymentStatus stripePaymentIntentId stripeCustomerId createdAt')
    .sort({ paymentDate: -1 }) // Most recent payments first
    .lean();

    // Calculate total sales
    const totalSales = paidStudents.reduce((sum, student) => {
      return sum + (student.paymentAmount || 0);
    }, 0);

    // Calculate sales by month for dashboard metrics
    const salesByMonth = {};
    const currentYear = new Date().getFullYear();
    
    paidStudents.forEach(student => {
      if (student.paymentDate) {
        const date = new Date(student.paymentDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!salesByMonth[monthKey]) {
          salesByMonth[monthKey] = {
            month: monthKey,
            count: 0,
            revenue: 0
          };
        }
        
        salesByMonth[monthKey].count += 1;
        salesByMonth[monthKey].revenue += (student.paymentAmount || 0);
      }
    });

    // Format the response
    const salesData = paidStudents.map(student => ({
      id: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      email: student.email,
      registrationCode: student.registrationCode,
      paymentDate: student.paymentDate,
      paymentAmount: student.paymentAmount || 0,
      paymentStatus: student.paymentStatus,
      stripePaymentIntentId: student.stripePaymentIntentId,
      stripeCustomerId: student.stripeCustomerId,
      registeredDate: student.createdAt
    }));

    return NextResponse.json({
      sales: salesData,
      summary: {
        totalStudents: paidStudents.length,
        totalRevenue: totalSales,
        averageOrderValue: paidStudents.length > 0 ? totalSales / paidStudents.length : 0,
        salesByMonth: Object.values(salesByMonth).sort((a, b) => b.month.localeCompare(a.month))
      }
    });

  } catch (error) {
    console.error('Error fetching sales data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
