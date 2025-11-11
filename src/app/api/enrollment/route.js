import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import ClassTime from '@/models/ClassTime'

export async function GET() {
  try {
    await connectDB()

    // Get all active class times
    const activeClassTimes = await ClassTime.find({ isActive: true }).lean()
    
    // Get enrollment counts for each class time
    const enrollmentCounts = await Student.aggregate([
      {
        $group: {
          _id: '$classTime',
          count: { $sum: 1 }
        }
      }
    ])

    // Create a map with all active class times initialized to 0
    const classTimeCounts = {}
    activeClassTimes.forEach(classTime => {
      classTimeCounts[classTime.name] = 0
    })

    // Update with actual counts
    enrollmentCounts.forEach(item => {
      if (item._id && classTimeCounts.hasOwnProperty(item._id)) {
        classTimeCounts[item._id] = item.count
      }
    })

    // Get the default minimum required (use first class time's minimum or fallback to 40)
    const minimumRequired = activeClassTimes[0]?.minimumRequired || 40

    return NextResponse.json({
      success: true,
      enrollments: classTimeCounts,
      minimumRequired,
      classTimes: activeClassTimes
    })

  } catch (error) {
    console.error('Error fetching enrollment counts:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch enrollment counts'
    }, { status: 500 })
  }
}

// Optional: POST endpoint for real-time updates (webhook style)
export async function POST(request) {
  try {
    await connectDB()
    
    const { classTime } = await request.json()
    
    if (!classTime) {
      return NextResponse.json({
        success: false,
        error: 'Class time is required'
      }, { status: 400 })
    }

    // Get count for specific class time
    const count = await Student.countDocuments({ classTime })
    
    return NextResponse.json({
      success: true,
      classTime,
      count,
      hasMinimumEnrollment: count >= 40
    })

  } catch (error) {
    console.error('Error getting class enrollment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get class enrollment'
    }, { status: 500 })
  }
}
