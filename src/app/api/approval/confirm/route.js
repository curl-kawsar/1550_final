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

    // Update student's approval status
    await Student.findByIdAndUpdate(student._id, {
      $set: {
        parentalApprovalStatus: 'approved',
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
        <title>Registration Approved - 1550+</title>
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
          .success {
            color: #28a745;
            font-size: 24px;
            margin-bottom: 20px;
            font-weight: bold;
          }
          .checkmark {
            color: #28a745;
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
          .next-steps {
            background-color: #e8f4fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
          }
          .contact-info {
            background-color: #f8f9fa;
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
          .redirect-notice {
            background-color: #e8f5e8;
            border: 2px solid #4caf50;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
          .countdown {
            font-size: 24px;
            font-weight: bold;
            color: #4caf50;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="/logo.png" alt="1550+ Logo" class="logo">
          <div class="checkmark">✓</div>
          <div class="success">Registration Approved!</div>
          
          <p>You have successfully approved the registration for:</p>
          <div class="student-name">${student.firstName} ${student.lastName}</div>
          
          <div class="next-steps">
            <h3 style="color: #113076; margin-top: 0;">What happens next?</h3>
            <ul style="text-align: left;">
              <li>${student.firstName} can now access their student dashboard</li>
              <li>They will receive their class schedule and diagnostic test information</li>
              <li>Course materials and resources will be available immediately</li>
              <li>You will receive updates on their progress throughout the program</li>
            </ul>
          </div>

          <div class="contact-info">
            <h4 style="margin-top: 0;">Need Help?</h4>
            <p style="margin-bottom: 0;">
              Email: support@1550plus.com<br>
              Phone: (555) 123-4567<br>
              Website: 1550plus.com
            </p>
          </div>

          <div class="redirect-notice">
            <h3 style="color: #4caf50; margin: 0 0 10px 0;">🎉 Special Offer Available!</h3>
            <p style="margin: 10px 0;">You'll be automatically redirected to our exclusive offers in <span class="countdown" id="countdown">3</span> seconds...</p>
            <p style="margin: 0; font-size: 14px; color: #666;">Or click the button below to view offers now!</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="/special-offer" class="special-offer-btn">
              🎁 See Special Offers
            </a>
          </div>

          <p><strong>Thank you for choosing 1550+ for ${student.firstName}'s SAT preparation!</strong></p>
        </div>

        <script>
          let countdown = 3;
          const countdownElement = document.getElementById('countdown');
          
          function updateCountdown() {
            countdownElement.textContent = countdown;
            if (countdown <= 0) {
              window.location.href = '/special-offer';
            } else {
              countdown--;
              setTimeout(updateCountdown, 1000);
            }
          }
          
          // Start countdown
          setTimeout(updateCountdown, 1000);
        </script>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Error processing approval:', error);
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
            We encountered an error while processing your approval. Please try again or contact support.
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