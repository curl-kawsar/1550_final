/**
 * Replaces template placeholders with actual student/district data.
 */
export function populatePlaceholders(templateBody, templateSubject, studentData, districtData) {
  const replacements = {
    '{{StudentName}}': `${studentData.firstName} ${studentData.lastName}`,
    '{{ParentName}}': `${studentData.parentFirstName} ${studentData.parentLastName}`,
    '{{DistrictName}}': districtData.districtName || '',
    '{{RegistrationLink}}': studentData.registrationLink || '',
    '{{RegistrationCode}}': districtData.registrationCode || '',
    '{{SenderName}}': 'The 1550+ Team',
    '{{SchoolName}}': districtData.schoolName || '',
    '{{RepresentativeName}}': districtData.representativeName || '',
    '{{StudentGrade}}': studentData.grade || '',
    '{{DashboardSupportEmail}}': 'support@1550plus.com'
  };

  let body = templateBody;
  let subject = templateSubject;

  for (const [placeholder, value] of Object.entries(replacements)) {
    body = body.replaceAll(placeholder, value);
    subject = subject.replaceAll(placeholder, value);
  }

  return { body, subject };
}

/**
 * Generates personalized emails for a list of students using a template.
 * Returns an array of { studentId, firstName, lastName, html, subject }.
 */
export function generateStudentEmails(students, template, districtData) {
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://1550plus.com';

  return students.map(student => {
    const code = districtData.registrationCode || student.registrationCode;
    const encodedCode = code ? encodeURIComponent(code) : '';
    let registrationLink;
    if (student.claimToken && code) {
      registrationLink = `${websiteUrl}/register?code=${encodedCode}&claimToken=${encodeURIComponent(student.claimToken)}`;
    } else {
      registrationLink = student.registrationLink || (code ? `${websiteUrl}/register?code=${encodedCode}` : '');
    }

    const studentData = {
      ...student,
      registrationLink
    };

    const { body, subject } = populatePlaceholders(
      template.body,
      template.subject,
      studentData,
      districtData
    );

    return {
      studentId: student._id || student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      parentEmail: student.parentEmail,
      html: body,
      subject
    };
  });
}

/**
 * Wraps generated email body in a full HTML document for download.
 */
export function wrapEmailAsHtml(subject, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body>
${body}
</body>
</html>`;
}

/**
 * Builds the summary email HTML sent to the school representative.
 */
export function buildSummaryEmailHtml(districtData, studentCount, packageDate) {
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://1550plus.com';
  const logoUrl = `${websiteUrl}/logo.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>District Scholarship - Student Registration Emails</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e5e5e5; }
    .header { background-color: #113076; padding: 30px 40px; text-align: center; }
    .logo { max-width: 150px; height: auto; }
    .content { padding: 40px; }
    .info-box { background: #f8f9fa; border-left: 4px solid #113076; padding: 20px; margin: 20px 0; }
    .footer { background: #f8f9fa; border-top: 1px solid #e5e5e5; padding: 25px 40px; text-align: center; font-size: 13px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="1550+" class="logo" />
    </div>
    <div class="content">
      <h2 style="color: #113076;">District Scholarship Registration Emails</h2>
      <p>Dear ${districtData.representativeName},</p>
      <p>Attached to this email, you will find the personalized registration invitation emails for the <strong>${studentCount}</strong> students nominated from <strong>${districtData.schoolName}</strong> in the <strong>${districtData.districtName}</strong> district.</p>
      <div class="info-box">
        <h3 style="margin-top:0; color: #113076;">Package Details</h3>
        <p><strong>District:</strong> ${districtData.districtName}</p>
        <p><strong>School:</strong> ${districtData.schoolName}</p>
        <p><strong>Students Included:</strong> ${studentCount}</p>
        <p><strong>Registration Code:</strong> ${districtData.registrationCode}</p>
        <p><strong>Date Generated:</strong> ${packageDate}</p>
      </div>
      <p>Please distribute the individual student emails to their respective parents/guardians. Each email contains a unique registration link and the district registration code.</p>
      <p>If you have any questions, please contact us at <a href="mailto:support@1550plus.com">support@1550plus.com</a>.</p>
      <p>Best regards,<br/><strong>The 1550+ Team</strong></p>
    </div>
    <div class="footer">
      <p><strong>1550+ College Preparation Services</strong></p>
      <p>This email was generated by the 1550+ District Scholarship system.</p>
    </div>
  </div>
</body>
</html>`;
}
