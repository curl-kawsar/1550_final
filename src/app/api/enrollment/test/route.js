import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'

// Test endpoint for creating sample enrollment data
export async function POST(request) {
  try {
    await connectDB()
    
    const { action, count } = await request.json()
    
    if (action === 'create-test-data') {
      // Create test students for each class time
      const classTimeSlots = [
        'Mon & Wed - 4:00 PM Pacific',
        'Mon & Wed - 7:00 PM Pacific',
        'Tue & Thu - 4:00 PM Pacific',
        'Tue & Thu - 7:00 PM Pacific'
      ]
      
      const testData = []
      let emailCounter = 1
      
      for (const classTime of classTimeSlots) {
        const studentsToCreate = count || Math.floor(Math.random() * 50) + 20 // 20-70 students
        
        for (let i = 0; i < studentsToCreate; i++) {
          testData.push({
            firstName: `Test${emailCounter}`,
            lastName: `Student`,
            email: `test${emailCounter}@example.com`,
            graduationYear: new Date('2025-06-01'),
            highSchoolName: `Test High School ${i + 1}`,
            phoneNumber: `555000${String(emailCounter).padStart(4, '0')}`,
            gender: emailCounter % 2 === 0 ? 'Female' : 'Male',
            currentGPA: 3.0 + Math.random() * 1.0,
            topCollegeChoices: 'Harvard, MIT, Stanford',
            parentFirstName: `Parent${emailCounter}`,
            parentLastName: `Name`,
            parentEmail: `parent${emailCounter}@example.com`,
            parentPhoneNumber: `555111${String(emailCounter).padStart(4, '0')}`,
            state: 'California',
            classRigor: 'Mostly Honors and AP',
            universitiesWant: 'Ivy League/Top 20',
            satActScores: '1400-1500 SAT',
            typeOfStudent: 'I generally bring my stuff and finish on time, but I don\'t always get top results.',
            biggestStressor: 'College application deadlines',
            parentWorry: 'College costs',
            registrationCode: 'TEST123',
            classTime: classTime,
            diagnosticTestDate: 'Saturday September 27th 8:30am - noon PST'
          })
          emailCounter++
        }
      }
      
      await Student.insertMany(testData)
      
      return NextResponse.json({
        success: true,
        message: `Created ${testData.length} test students`,
        distribution: await getEnrollmentDistribution()
      })
    }
    
    if (action === 'clear-test-data') {
      await Student.deleteMany({ email: { $regex: /^test\d+@example\.com$/ } })
      
      return NextResponse.json({
        success: true,
        message: 'Cleared all test data',
        distribution: await getEnrollmentDistribution()
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })
    
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process test request'
    }, { status: 500 })
  }
}

async function getEnrollmentDistribution() {
  const enrollmentCounts = await Student.aggregate([
    {
      $group: {
        _id: '$classTime',
        count: { $sum: 1 }
      }
    }
  ])
  
  const distribution = {}
  enrollmentCounts.forEach(item => {
    distribution[item._id] = item.count
  })
  
  return distribution
}

// Get current enrollment status
export async function GET() {
  try {
    await connectDB()
    
    const distribution = await getEnrollmentDistribution()
    const totalStudents = await Student.countDocuments()
    
    return NextResponse.json({
      success: true,
      totalStudents,
      distribution,
      minimumRequired: 40
    })
    
  } catch (error) {
    console.error('Error getting enrollment status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get enrollment status'
    }, { status: 500 })
  }
}
