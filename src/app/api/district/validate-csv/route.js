import { NextResponse } from 'next/server';
import { parseDistrictNomineeCsv } from '@/lib/districtCsvParse';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, errors: ['No file uploaded'] }, { status: 400 });
    }

    const fileName = file.name || '';
    if (!fileName.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ success: false, errors: ['File must be a CSV file'] }, { status: 400 });
    }

    const text = await file.text();
    const { rows, missingRequired, rawHeaderCells } = parseDistrictNomineeCsv(text);

    if (missingRequired.length > 0) {
      const found =
        rawHeaderCells.length > 0
          ? rawHeaderCells.map((h) => `"${h}"`).join(', ')
          : '(empty header row)';
      return NextResponse.json({
        success: false,
        errors: [
          `Missing required columns: ${missingRequired.join(', ')}. ` +
            `Found in file: ${found}. ` +
            `Download the template from this site or use the exact column names (comma, semicolon, or tab-separated).`
        ]
      }, { status: 400 });
    }

    const validRows = [];
    const invalidRows = [];
    const seen = new Set();

    rows.forEach((row, index) => {
      const errors = [];
      const firstName = row['Student First Name']?.trim();
      const lastName = row['Student Last Name']?.trim();
      const grade = row['Grade Level or Graduation Year']?.trim();
      const parentFirstName = row['Parent First Name']?.trim();
      const parentLastName = row['Parent Last Name']?.trim();
      const parentEmail = row['Parent Email']?.trim();

      if (!firstName) errors.push('Student First Name is required');
      if (!lastName) errors.push('Student Last Name is required');
      if (!grade) errors.push('Grade Level is required');
      if (!parentFirstName) errors.push('Parent First Name is required');
      if (!parentLastName) errors.push('Parent Last Name is required');
      if (!parentEmail) {
        errors.push('Parent Email is required');
      } else if (!validateEmail(parentEmail)) {
        errors.push('Parent Email is invalid');
      }

      const dupeKey = `${firstName?.toLowerCase()}-${lastName?.toLowerCase()}-${parentEmail?.toLowerCase()}`;
      if (seen.has(dupeKey)) {
        errors.push('Duplicate student row');
      }
      seen.add(dupeKey);

      if (errors.length > 0) {
        invalidRows.push({
          rowNumber: index + 2,
          errors,
          data: {
            firstName,
            lastName,
            grade,
            highSchoolName: row['High School Name']?.trim() || '',
            parentFirstName,
            parentLastName,
            parentEmail
          }
        });
      } else {
        validRows.push({
          firstName,
          lastName,
          grade,
          highSchoolName: row['High School Name']?.trim() || '',
          parentFirstName,
          parentLastName,
          parentEmail: parentEmail.toLowerCase()
        });
      }
    });

    return NextResponse.json({
      success: true,
      totalRows: rows.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      validRows,
      invalidRows
    });
  } catch (error) {
    console.error('CSV validation error:', error);
    return NextResponse.json({ success: false, errors: ['Failed to process CSV file'] }, { status: 500 });
  }
}
