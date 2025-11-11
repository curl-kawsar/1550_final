import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'

export async function GET() {
  try {
    await connectDB()

    // Get diagnostic test date counts
    const diagnosticCounts = await Student.aggregate([
      {
        $group: {
          _id: '$diagnosticTestDate',
          count: { $sum: 1 }
        }
      }
    ])

    // Create a map with all possible diagnostic test dates initialized to 0
    const diagnosticTestCounts = {
      'Saturday September 27th 8:30am - noon PST': 0,
      'Sunday September 28th 8:30am - noon PST': 0,
      'I can\'t make either of these dates (reply below with if neither option works for you)': 0
    }

    // Update with actual counts
    diagnosticCounts.forEach(item => {
      if (item._id && diagnosticTestCounts.hasOwnProperty(item._id)) {
        diagnosticTestCounts[item._id] = item.count
      }
    })

    // Calculate statistics
    const totalRegistered = Object.values(diagnosticTestCounts).reduce((sum, count) => sum + count, 0)
    const saturdayCount = diagnosticTestCounts['Saturday September 27th 8:30am - noon PST']
    const sundayCount = diagnosticTestCounts['Sunday September 28th 8:30am - noon PST']
    const cannotAttendCount = diagnosticTestCounts['I can\'t make either of these dates (reply below with if neither option works for you)']

    return NextResponse.json({
      success: true,
      diagnosticTests: diagnosticTestCounts,
      statistics: {
        totalRegistered,
        saturdayCount,
        sundayCount,
        cannotAttendCount,
        attendanceRate: totalRegistered > 0 ? ((saturdayCount + sundayCount) / totalRegistered * 100).toFixed(1) : 0
      }
    })

  } catch (error) {
    console.error('Error fetching diagnostic test counts:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch diagnostic test counts'
    }, { status: 500 })
  }
}

// Optional: POST endpoint for specific diagnostic test date queries
export async function POST(request) {
  try {
    await connectDB()
    
    const { diagnosticTestDate } = await request.json()
    
    if (!diagnosticTestDate) {
      return NextResponse.json({
        success: false,
        error: 'Diagnostic test date is required'
      }, { status: 400 })
    }

    // Get count for specific diagnostic test date
    const count = await Student.countDocuments({ diagnosticTestDate })
    
    // Get students for this diagnostic test date
    const students = await Student.find({ diagnosticTestDate })
      .select('firstName lastName email classTime')
      .sort({ submittedAt: -1 })
      .lean()
    
    return NextResponse.json({
      success: true,
      diagnosticTestDate,
      count,
      students
    })

  } catch (error) {
    console.error('Error getting diagnostic test enrollment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get diagnostic test enrollment'
    }, { status: 500 })
  }
}
