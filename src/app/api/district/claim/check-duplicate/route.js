import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { email, parentEmail, firstName, lastName } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const existingByEmail = await Student.findOne({ email: email.toLowerCase() }).lean();
    if (existingByEmail) {
      return NextResponse.json({
        hasDuplicate: true,
        duplicateType: 'student_email',
        message: 'A student with this email already exists in the system.'
      });
    }

    if (parentEmail) {
      const existingByParentEmail = await Student.findOne({
        parentEmail: parentEmail.toLowerCase()
      }).lean();

      if (existingByParentEmail) {
        const nameMatch = firstName && lastName &&
          existingByParentEmail.firstName?.toLowerCase() === firstName.toLowerCase() &&
          existingByParentEmail.lastName?.toLowerCase() === lastName.toLowerCase();

        if (nameMatch) {
          return NextResponse.json({
            hasDuplicate: true,
            duplicateType: 'parent_and_name_match',
            message: 'A student with matching parent email and name already exists.'
          });
        }

        return NextResponse.json({
          hasDuplicate: true,
          duplicateType: 'parent_email',
          message: 'A student with this parent email already exists. This may be a sibling or duplicate.'
        });
      }
    }

    return NextResponse.json({
      hasDuplicate: false,
      duplicateType: null,
      message: null
    });
  } catch (error) {
    console.error('Error checking duplicates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
