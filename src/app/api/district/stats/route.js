import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import DistrictSubmission from '@/models/DistrictSubmission';
import DistrictStudent from '@/models/DistrictStudent';
import DistrictPackage from '@/models/DistrictPackage';

export async function GET(request) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const [
      totalSubmissions,
      totalNominees,
      totalGenerated,
      totalSentPackages,
      totalDeliveryIssues,
      totalRegistered,
      pendingProcessing,
      statusBreakdown
    ] = await Promise.all([
      DistrictSubmission.countDocuments(),
      DistrictStudent.countDocuments(),
      DistrictStudent.countDocuments({
        status: { $in: ['Generated', 'Included in Package', 'Sent to Representative', 'Registered'] }
      }),
      DistrictPackage.countDocuments({ status: 'sent' }),
      DistrictPackage.countDocuments({ status: 'delivery_failed' }),
      DistrictStudent.countDocuments({ status: 'Registered' }),
      DistrictSubmission.countDocuments({
        status: { $in: ['New', 'Under Review', 'Ready for Generation'] }
      }),
      DistrictSubmission.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const conversionRate = totalNominees > 0
      ? ((totalRegistered / totalNominees) * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalSubmissions,
        totalNominees,
        totalGenerated,
        totalSentPackages,
        totalDeliveryIssues,
        totalRegistered,
        conversionRate: parseFloat(conversionRate),
        pendingProcessing,
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching district stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
