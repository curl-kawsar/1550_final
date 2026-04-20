import { NextResponse } from 'next/server';

const CSV_HEADERS = [
  'Student First Name',
  'Student Last Name',
  'Grade Level or Graduation Year',
  'High School Name',
  'Parent First Name',
  'Parent Last Name',
  'Parent Email'
];

export async function GET() {
  const csvContent = CSV_HEADERS.join(',') + '\n';

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="district_student_template.csv"'
    }
  });
}
