import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Link - 1550+</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
              background-color: #f9f9f9;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .error {
              color: #dc3545;
              font-size: 18px;
              margin-bottom: 20px;
            }
            .logo {
              max-width: 150px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="/logo.png" alt="1550+ Logo" class="logo">
            <h1>Invalid Link</h1>
            <div class="error">
              The approval link is missing required information. Please use the link provided in your email.
            </div>
            <p>If you continue to have problems, please contact us at support@1550plus.com</p>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 400
      });
    }

    await connectToDatabase();

    const student = await Student.findOne({ 
      parentalApprovalToken: token,
      parentalApprovalStatus: 'pending'
    });

    if (!student) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid or Expired Link - 1550+</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
              background-color: #f9f9f9;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .error {
              color: #dc3545;
              font-size: 18px;
              margin-bottom: 20px;
            }
            .logo {
              max-width: 150px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="/logo.png" alt="1550+ Logo" class="logo">
            <h1>Invalid or Expired Link</h1>
            <div class="error">
              This approval link is invalid, expired, or has already been used.
            </div>
            <p>If you believe this is an error, please contact us at support@1550plus.com</p>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 404
      });
    }

    // Update student's approval status to declined
    await Student.findByIdAndUpdate(student._id, {
      $set: {
        parentalApprovalStatus: 'declined',
        parentalApprovedAt: new Date()
      },
      $unset: {
        parentalApprovalToken: 1 // Remove the token field after use
      }
    });

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Registration Declined - 1550+</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
            background-color: #f9f9f9;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .declined {
            color: #dc3545;
            font-size: 24px;
            margin-bottom: 20px;
            font-weight: bold;
          }
          .icon {
            color: #dc3545;
            font-size: 48px;
            margin-bottom: 20px;
          }
          .student-name {
            color: #113076;
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 20px;
          }
          .info-box {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
          }
          .contact-info {
            background-color: #e8f4fd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .special-offer-btn {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 20px 10px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
          }
          .special-offer-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(238, 90, 36, 0.4);
          }
          .offer-notice {
            background-color: #fff3cd;
            border: 2px solid #ffc107;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="/logo.png" alt="1550+ Logo" class="logo">
          <div class="icon">✗</div>
          <div class="declined">Registration Declined</div>
          
          <p>You have declined the registration for:</p>
          <div class="student-name">${student.firstName} ${student.lastName}</div>
          
          <div class="info-box">
            <h3 style="color: #113076; margin-top: 0;">What this means:</h3>
            <ul style="text-align: left;">
              <li>${student.firstName} will not be able to access the student dashboard</li>
              <li>The registration has been cancelled</li>
              <li>No further emails will be sent regarding this registration</li>
              <li>If you change your mind, ${student.firstName} can register again</li>
            </ul>
          </div>

          <div class="contact-info">
            <h4 style="margin-top: 0;">Changed your mind or have questions?</h4>
            <p style="margin-bottom: 0;">
              We understand that circumstances can change. If you'd like to reconsider or have any questions, please don't hesitate to contact us:<br><br>
              Email: support@1550plus.com<br>
              Phone: (555) 123-4567<br>
              Website: 1550plus.com
            </p>
          </div>

          <div class="offer-notice">
            <h3 style="color: #856404; margin: 0 0 10px 0;">💡 Still Interested in SAT Success?</h3>
            <p style="margin: 10px 0; color: #856404;">Even though you've declined the registration, we have some amazing special offers that might interest you for future consideration!</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="/special-offer" class="special-offer-btn">
              🎁 View Special Offers
            </a>
          </div>

          <p>Thank you for considering 1550+ for ${student.firstName}'s education.</p>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Error processing decline:', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - 1550+</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
            background-color: #f9f9f9;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .error {
            color: #dc3545;
            font-size: 18px;
            margin-bottom: 20px;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="/logo.png" alt="1550+ Logo" class="logo">
          <h1>Something went wrong</h1>
          <div class="error">
            We encountered an error while processing your response. Please try again or contact support.
          </div>
          <p>Contact us at support@1550plus.com for assistance.</p>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 500
    });
  }
}