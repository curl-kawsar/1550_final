import { NextResponse } from 'next/server';

const REQUIRED_HEADERS = [
  'Student First Name',
  'Student Last Name',
  'Grade Level or Graduation Year',
  'Parent First Name',
  'Parent Last Name',
  'Parent Email'
];

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.some(v => v)) {
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
      rows.push(row);
    }
  }

  return { headers, rows };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, errors: ['No file uploaded'] }, { status: 400 });
    }

    const fileName = file.name || '';
    if (!fileName.endsWith('.csv')) {
      return NextResponse.json({ success: false, errors: ['File must be a CSV file'] }, { status: 400 });
    }

    const text = await file.text();
    const { headers, rows } = parseCSV(text);

    // Validate column structure
    const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json({
        success: false,
        errors: [`Missing required columns: ${missingHeaders.join(', ')}`]
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
            firstName, lastName, grade,
            highSchoolName: row['High School Name']?.trim() || '',
            parentFirstName, parentLastName, parentEmail
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
