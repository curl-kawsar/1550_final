import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import DiagnosticTest from '@/models/DiagnosticTest';

// Get active diagnostic tests (Public access for registration form)
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const includeEnrollment = searchParams.get('includeEnrollment') === 'true';
    
    // Get active diagnostic tests (only future tests)
    const diagnosticTests = await DiagnosticTest.getActiveDiagnosticTests();
    
    // Update enrollment counts if requested
    if (includeEnrollment) {
      const enrollmentStats = await DiagnosticTest.getEnrollmentStats();
      
      // Add enrollment data to each diagnostic test
      const testsWithEnrollment = diagnosticTests.map(test => ({
        ...test,
        currentEnrollment: enrollmentStats.enrollments[test.name] || 0,
        isFull: (enrollmentStats.enrollments[test.name] || 0) >= test.capacity,
        canRegister: test.isActive && 
                    new Date(test.date) > new Date() && 
                    (enrollmentStats.enrollments[test.name] || 0) < test.capacity
      }));
      
      return NextResponse.json({
        diagnosticTests: testsWithEnrollment,
        enrollments: enrollmentStats.enrollments
      });
    }
    
    return NextResponse.json({
      diagnosticTests
    });
    
  } catch (error) {
    console.error('Error fetching active diagnostic tests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
