import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ClassTime from '@/models/ClassTime';

// Get active class times (Public access for registration form)
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const includeEnrollment = searchParams.get('includeEnrollment') === 'true';
    
    // Get active class times
    const classTimes = await ClassTime.getActiveClassTimes();
    
    // Update enrollment counts if requested
    if (includeEnrollment) {
      const enrollmentStats = await ClassTime.getEnrollmentStats();
      
      // Add enrollment data to each class time
      const classTimesWithEnrollment = classTimes.map(classTime => ({
        ...classTime,
        currentEnrollment: enrollmentStats.enrollments[classTime.name] || 0,
        hasMinimumEnrollment: (enrollmentStats.enrollments[classTime.name] || 0) >= classTime.minimumRequired
      }));
      
      return NextResponse.json({
        classTimes: classTimesWithEnrollment,
        enrollments: enrollmentStats.enrollments,
        minimumRequired: enrollmentStats.minimumRequired
      });
    }
    
    return NextResponse.json({
      classTimes
    });
    
  } catch (error) {
    console.error('Error fetching active class times:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
