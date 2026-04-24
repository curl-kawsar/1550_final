import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import DistrictSubmission from '@/models/DistrictSubmission';
import DistrictStudent from '@/models/DistrictStudent';
import DistrictAuditLog from '@/models/DistrictAuditLog';

/** Consistent display + unique index: trim and collapse internal whitespace. */
function normalizeLabel(value) {
  if (value == null || String(value).trim() === '') return '';
  return String(value).trim().replace(/\s+/g, ' ');
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateStudentRow(row, index) {
  const errors = [];
  if (!row.firstName?.trim()) errors.push(`Row ${index + 1}: Student First Name is required`);
  if (!row.lastName?.trim()) errors.push(`Row ${index + 1}: Student Last Name is required`);
  if (!row.grade?.trim()) errors.push(`Row ${index + 1}: Grade Level is required`);
  if (!row.parentFirstName?.trim()) errors.push(`Row ${index + 1}: Parent First Name is required`);
  if (!row.parentLastName?.trim()) errors.push(`Row ${index + 1}: Parent Last Name is required`);
  if (!row.parentEmail?.trim()) {
    errors.push(`Row ${index + 1}: Parent Email is required`);
  } else if (!validateEmail(row.parentEmail.trim())) {
    errors.push(`Row ${index + 1}: Parent Email is invalid`);
  }
  return errors;
}

function findDuplicates(students) {
  const seen = new Set();
  const duplicates = [];
  students.forEach((s, i) => {
    const key = `${s.firstName?.trim().toLowerCase()}-${s.lastName?.trim().toLowerCase()}-${s.parentEmail?.trim().toLowerCase()}`;
    if (seen.has(key)) {
      duplicates.push(i);
    }
    seen.add(key);
  });
  return duplicates;
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      districtName, schoolName, districtSource,
      representativeName, representativeRole,
      representativeEmail, representativePhone,
      studentCount, submissionMethod, notes,
      confirmationChecked, students
    } = body;

    // Validate district-level fields
    const fieldErrors = [];
    if (!districtName?.trim()) fieldErrors.push('District Name is required');
    if (!schoolName?.trim()) fieldErrors.push('School Name is required');
    if (!representativeName?.trim()) fieldErrors.push('Representative Name is required');
    if (!representativeEmail?.trim()) fieldErrors.push('Representative Email is required');
    else if (!validateEmail(representativeEmail)) fieldErrors.push('Representative Email is invalid');
    if (!studentCount || studentCount < 10) fieldErrors.push('Minimum 10 students required');
    if (!confirmationChecked) fieldErrors.push('Confirmation checkbox is required');

    if (fieldErrors.length > 0) {
      return NextResponse.json({ success: false, errors: fieldErrors }, { status: 400 });
    }

    const districtLabel = normalizeLabel(districtName);
    const schoolLabel = normalizeLabel(schoolName);

    // Check for existing submission (same as compound unique index on district + school)
    const existing = await DistrictSubmission.findOne({
      districtName: districtLabel,
      schoolName: schoolLabel
    });
    if (existing) {
      return NextResponse.json({
        success: false,
        errors: ['A submission already exists for this school under this district. Only one submission per school per district is allowed. If you recently submitted and saw an error, an incomplete record may still exist: delete that submission in Admin → District Submissions, then try again.']
      }, { status: 409 });
    }

    // Validate students
    if (!students || !Array.isArray(students) || students.length < 10) {
      return NextResponse.json({
        success: false,
        errors: ['At least 10 student records are required']
      }, { status: 400 });
    }

    const allStudentErrors = [];
    const validStudents = [];
    const invalidRows = [];

    students.forEach((student, index) => {
      const errors = validateStudentRow(student, index);
      if (errors.length > 0) {
        invalidRows.push({ index, errors, data: student });
      } else {
        validStudents.push(student);
      }
    });

    // Check duplicates among valid students
    const duplicateIndices = findDuplicates(validStudents);
    duplicateIndices.forEach(idx => {
      const student = validStudents[idx];
      invalidRows.push({
        index: idx,
        errors: [`Duplicate student: ${student.firstName} ${student.lastName}`],
        data: student
      });
    });

    const finalValid = validStudents.filter((_, i) => !duplicateIndices.includes(i));

    if (finalValid.length < 10) {
      return NextResponse.json({
        success: false,
        errors: [`Only ${finalValid.length} valid student rows. Minimum 10 required after validation.`],
        invalidRows
      }, { status: 400 });
    }

    // Create the submission
    const submission = await DistrictSubmission.create({
      districtName: districtLabel,
      schoolName: schoolLabel,
      districtSource: normalizeLabel(districtSource) || districtLabel,
      representativeName: representativeName.trim(),
      representativeRole: representativeRole?.trim() || '',
      representativeEmail: representativeEmail.trim().toLowerCase(),
      representativePhone: representativePhone?.trim() || '',
      studentCount: finalValid.length,
      submissionMethod: submissionMethod || 'manual',
      notes: notes?.trim() || '',
      confirmationChecked: true
    });

    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://1550plus.com';

    // Create student records
    const studentDocs = finalValid.map(s => ({
      submission: submission._id,
      firstName: s.firstName.trim(),
      lastName: s.lastName.trim(),
      grade: s.grade.trim(),
      highSchoolName: s.highSchoolName?.trim() || schoolLabel,
      parentFirstName: s.parentFirstName.trim(),
      parentLastName: s.parentLastName.trim(),
      parentEmail: s.parentEmail.trim().toLowerCase(),
      registrationCode: submission.registrationCode,
      registrationLink: `${websiteUrl}/register?code=${submission.registrationCode}`,
      status: submissionMethod === 'csv' ? 'Imported' : 'Draft'
    }));

    try {
      await DistrictStudent.insertMany(studentDocs, { ordered: true });
    } catch (insertErr) {
      await DistrictStudent.deleteMany({ submission: submission._id });
      await DistrictSubmission.findByIdAndDelete(submission._id);
      console.error('District student insert failed, rolled back submission:', insertErr);
      const msg =
        insertErr?.code === 11000
          ? 'Could not save student list (duplicate or conflict). Remove the duplicate in your file or contact support. Your district submission was not left half-created.'
          : (insertErr?.message && String(insertErr.message)) || 'Failed to save student list';
      return NextResponse.json(
        { success: false, errors: [msg] },
        { status: 500 }
      );
    }

    // Audit log
    await DistrictAuditLog.create({
      action: 'district_registration_submitted',
      submission: submission._id,
      performedBy: representativeName.trim(),
      details: {
        districtName: submission.districtName,
        schoolName: submission.schoolName,
        totalStudents: finalValid.length,
        invalidRows: invalidRows.length,
        submissionMethod
      }
    });

    return NextResponse.json({
      success: true,
      submission: {
        id: submission._id,
        districtName: submission.districtName,
        schoolName: submission.schoolName,
        registrationCode: submission.registrationCode,
        studentCount: finalValid.length,
        status: submission.status
      },
      validCount: finalValid.length,
      invalidRows: invalidRows.length > 0 ? invalidRows : []
    }, { status: 201 });

  } catch (error) {
    console.error('District registration error:', error);
    if (error.code === 11000) {
      const pattern = error.keyPattern || {};
      if (pattern.registrationCode) {
        return NextResponse.json(
          {
            success: false,
            errors: ['Registration code collision—please try submitting again. If it repeats, contact support.']
          },
          { status: 409 }
        );
      }
      if (pattern.districtName && pattern.schoolName) {
        return NextResponse.json(
          {
            success: false,
            errors: [
              'A submission already exists for this school under this district. Delete the existing one in Admin → District Submissions if you need to re-register, then try again.'
            ]
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, errors: ['A record conflicted with existing data. Check Admin for an existing district submission, or try again.'] },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, errors: ['Internal server error'] }, { status: 500 });
  }
}
