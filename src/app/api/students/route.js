import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';
import Ambassador from '@/models/Ambassador';
import bcrypt from 'bcryptjs';
import { sendParentalConfirmationEmail } from '@/lib/emailService';
import { createTraffTCustomer } from '@/services/trafftService';

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'password', 'graduationYear', 'highSchoolName',
      'phoneNumber', 'gender', 'currentGPA', 'parentFirstName', 'parentLastName',
      'parentEmail', 'parentPhoneNumber', 'state', 'classRigor', 'universitiesWant',
      'typeOfStudent', 'registrationCode', 'classTime', 'diagnosticTestDate'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    const existingStudent = await Student.findOne({ email: body.email });
    if (existingStudent) {
      return NextResponse.json(
        { error: 'A student with this email already exists' },
        { status: 409 }
      );
    }

    // Check if registration code belongs to an ambassador
    let assignedAmbassador = null;
    if (body.registrationCode) {
      const ambassador = await Ambassador.findOne({
        ambassadorCode: body.registrationCode.toUpperCase(),
        isActive: true
      });

      if (ambassador) {
        assignedAmbassador = ambassador._id;
        console.log('Student will be assigned to ambassador:', ambassador.firstName, ambassador.lastName);
      } else {
        console.log('Registration code does not match any active ambassador:', body.registrationCode);
      }
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);

    // Parse graduationYear - handle ISO date string or plain year number
    let graduationYear = body.graduationYear;
    if (typeof graduationYear === 'string' && graduationYear.includes('-')) {
      // Extract year from ISO date string like "2025-01-01T00:00:00.000Z"
      graduationYear = new Date(graduationYear).getFullYear();
    } else if (typeof graduationYear === 'string') {
      graduationYear = parseInt(graduationYear, 10);
    }

    // Create new student with hashed password and ambassador assignment
    const studentData = {
      ...body,
      password: hashedPassword,
      ambassador: assignedAmbassador,
      graduationYear: graduationYear
    };

    console.log('Creating student with data:', {
      email: studentData.email,
      hasPassword: !!studentData.password,
      passwordLength: studentData.password ? studentData.password.length : 0
    });

    const student = new Student(studentData);
    await student.save();

    console.log('Student saved successfully:', {
      id: student._id,
      email: student.email,
      hasPassword: !!student.password,
      passwordLength: student.password ? student.password.length : 0
    });

    // Update ambassador student count if assigned
    if (assignedAmbassador) {
      try {
        const ambassador = await Ambassador.findById(assignedAmbassador);
        if (ambassador) {
          await ambassador.updateStudentCount();
          console.log('Updated ambassador student count for:', ambassador.firstName, ambassador.lastName);
        }
      } catch (ambassadorError) {
        console.error('Error updating ambassador student count:', ambassadorError);
        // Note: We don't fail the registration if this fails
      }
    }

    // Create customer in Trafft platform
    try {
      console.log('Creating Trafft customer for:', student.email);

      const trafftResult = await createTraffTCustomer({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phoneNumber
      });

      // Update student record with Trafft information
      const trafftUpdate = {
        trafftCustomerCreated: trafftResult.success,
        ...(trafftResult.success && { trafftCustomerId: trafftResult.trafftCustomerId }),
        ...(trafftResult.error && { trafftError: trafftResult.error })
      };

      await Student.findByIdAndUpdate(student._id, trafftUpdate);

      if (trafftResult.success) {
        console.log('Successfully created Trafft customer:', trafftResult.trafftCustomerId);
      } else {
        console.error('Failed to create Trafft customer:', trafftResult.error);
        // Note: We don't fail the registration if Trafft fails
      }
    } catch (trafftError) {
      console.error('Error in Trafft integration:', trafftError);

      // Update student with error info
      await Student.findByIdAndUpdate(student._id, {
        trafftCustomerCreated: false,
        trafftError: trafftError.message
      });

      // Note: We don't fail the registration if Trafft fails
    }

    // Send parental confirmation email
    try {
      const emailResult = await sendParentalConfirmationEmail(student);

      if (emailResult.success) {
        // Update student with approval token
        await Student.findByIdAndUpdate(student._id, {
          parentalApprovalToken: emailResult.approvalToken,
          parentalApprovalEmailSent: true
        });

        console.log('Parental confirmation email sent successfully:', emailResult.messageId);
      } else {
        console.error('Failed to send parental confirmation email:', emailResult.error);
        // Note: We don't fail the registration if email fails
      }
    } catch (emailError) {
      console.error('Error sending parental confirmation email:', emailError);
      // Note: We don't fail the registration if email fails
    }

    return NextResponse.json(
      {
        message: 'Student registration submitted successfully. A parental confirmation email has been sent.',
        studentId: student._id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating student:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A student with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const diagnosticTest = searchParams.get('diagnosticTest');
    const classTime = searchParams.get('classTime');

    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { highSchoolName: { $regex: search, $options: 'i' } }
      ];
    }
    if (diagnosticTest) {
      if (diagnosticTest === 'saturday') {
        query.diagnosticTestDate = { $regex: 'Saturday', $options: 'i' };
      } else if (diagnosticTest === 'sunday') {
        query.diagnosticTestDate = { $regex: 'Sunday', $options: 'i' };
      } else if (diagnosticTest === 'cannot') {
        query.diagnosticTestDate = { $regex: 'can\'t make either', $options: 'i' };
      }
    }
    if (classTime) {
      query.classTime = classTime;
    }

    // Get students with pagination
    const students = await Student.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Student.countDocuments(query);

    return NextResponse.json({
      students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalStudents: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}