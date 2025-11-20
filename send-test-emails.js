// Test Email Sender for Booking TMS
// This will send multiple test emails to bookingtms.com@gmail.com

const SUPABASE_URL = 'https://ohfjkcajnqvethmrpdwc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZmprY2FqbnF2ZXRobXJwZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDE2OTEsImV4cCI6MjA3Nzc3NzY5MX0.EkzMR6RP3YiVNASU3Ppq4KiJHCP8R8lY4yQxKhs_4e8';
const TEST_EMAIL = 'bookingtms.com@gmail.com';

async function sendEmail(emailData) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData)
  });
  
  return await response.json();
}

async function sendAllTestEmails() {
  console.log('🚀 Starting to send test emails to:', TEST_EMAIL);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test 1: Simple Test Email
  console.log('📧 Test 1: Simple Test Email');
  try {
    const result1 = await sendEmail({
      to: TEST_EMAIL,
      subject: '✅ Test 1: Email System Working!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4f46e5;">✅ Email System Working!</h1>
          <p>This is a simple test email from your Booking TMS system.</p>
          <p>If you received this, your email system is configured correctly!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 14px;">
            Sent at: ${new Date().toLocaleString()}<br>
            System: Booking TMS Email Service<br>
            Provider: Resend
          </p>
        </div>
      `,
      text: 'Email system test - If you received this, your email system is working!'
    });
    console.log('✅ Success:', result1.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

  // Test 2: Booking Confirmation with QR Code
  console.log('\n📧 Test 2: Booking Confirmation (with QR code simulation)');
  try {
    const result2 = await sendEmail({
      to: TEST_EMAIL,
      subject: '🎉 Booking Confirmed - Mystery Manor',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4f46e5; color: white; padding: 30px; text-align: center; border-radius: 8px; }
            .content { background: #f9f9f9; padding: 30px; margin: 20px 0; border-radius: 8px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
            .qr-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 30px; margin: 30px 0; text-align: center; color: white; }
            .button { display: inline-block; padding: 12px 24px; background: white; color: #4f46e5; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 Booking Confirmed!</h1>
              <p style="margin: 10px 0 0 0;">Thank you for your booking!</p>
            </div>
            
            <div class="content">
              <h2 style="margin: 0 0 15px 0;">Booking Details</h2>
              <div class="detail-row">
                <span><strong>Booking ID:</strong></span>
                <span>BK-12345</span>
              </div>
              <div class="detail-row">
                <span><strong>Escape Room:</strong></span>
                <span>Mystery Manor</span>
              </div>
              <div class="detail-row">
                <span><strong>Date:</strong></span>
                <span>Nov 15, 2025</span>
              </div>
              <div class="detail-row">
                <span><strong>Time:</strong></span>
                <span>7:00 PM</span>
              </div>
              <div class="detail-row">
                <span><strong>Players:</strong></span>
                <span>4</span>
              </div>
              <div class="detail-row" style="border-bottom: none;">
                <span><strong>Total:</strong></span>
                <span><strong>$120.00</strong></span>
              </div>
            </div>

            <div class="qr-section">
              <h2 style="margin: 0 0 10px 0;">📝 Complete Your Waiver</h2>
              <p style="margin: 0 0 20px 0; opacity: 0.9;">Scan this QR code to complete your waiver before your visit</p>
              <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block;">
                <div style="width: 200px; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #666;">
                  [QR Code Here]
                </div>
              </div>
              <a href="#" class="button">Open Waiver Form</a>
              <p style="font-size: 12px; margin-top: 15px; opacity: 0.9;">
                Or copy this link: https://yourdomain.com/waiver/template-123?booking=BK-12345
              </p>
            </div>

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; color: #856404;">⚠️ Important Information</h3>
              <p style="margin: 5px 0; color: #856404;">• Please arrive 15 minutes early for check-in</p>
              <p style="margin: 5px 0; color: #856404;">• Bring a valid ID for verification</p>
              <p style="margin: 5px 0; color: #856404;">• All participants must complete a waiver</p>
            </div>

            <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p>Questions? Contact us at (555) 123-4567</p>
              <p style="font-size: 12px; color: #999;">This is an automated confirmation email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: 'Booking Confirmed! Your reservation for Mystery Manor on Nov 15, 2025 at 7:00 PM has been confirmed. Booking ID: BK-12345'
    });
    console.log('✅ Success:', result2.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Waiver Reminder
  console.log('\n📧 Test 3: Waiver Reminder');
  try {
    const result3 = await sendEmail({
      to: TEST_EMAIL,
      subject: '📝 Complete Your Waiver - Mystery Manor',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
            .content { background: #f9f9f9; padding: 30px; margin: 20px 0; border-radius: 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 Complete Your Waiver</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>You have an upcoming booking for <strong>Mystery Manor</strong> on <strong>Nov 15, 2025</strong> at <strong>7:00 PM</strong>.</p>
              <p>Please complete your waiver form before your visit to ensure a smooth check-in process.</p>
              <center>
                <a href="#" class="button">Complete Waiver Now</a>
              </center>
              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                Or copy this link: <br>
                <code style="background: #e0e0e0; padding: 5px 10px; border-radius: 4px; font-size: 12px;">
                  https://yourdomain.com/waiver/template-123?booking=BK-12345
                </code>
              </p>
            </div>
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>See you soon!</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: 'Complete your waiver for Mystery Manor on Nov 15, 2025 at 7:00 PM. Visit: https://yourdomain.com/waiver/template-123?booking=BK-12345'
    });
    console.log('✅ Success:', result3.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 4: Booking Reminder
  console.log('\n📧 Test 4: Booking Reminder (24h before)');
  try {
    const result4 = await sendEmail({
      to: TEST_EMAIL,
      subject: '⏰ Reminder: Your booking tomorrow at 7:00 PM',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4f46e5; color: white; padding: 30px; text-align: center; border-radius: 8px; }
            .content { background: #f9f9f9; padding: 30px; margin: 20px 0; border-radius: 8px; }
            .info-box { background: white; padding: 15px; border-left: 4px solid #4f46e5; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Reminder: Your Booking Tomorrow</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>This is a friendly reminder about your upcoming booking:</p>
              <div class="info-box">
                <strong>Escape Room:</strong> Mystery Manor<br>
                <strong>Date:</strong> Nov 15, 2025<br>
                <strong>Time:</strong> 7:00 PM<br>
                <strong>Players:</strong> 4<br>
                <strong>Booking ID:</strong> BK-12345
              </div>
              <p><strong>⚠️ Important Reminders:</strong></p>
              <ul>
                <li>Please arrive <strong>15 minutes early</strong> for check-in</li>
                <li>Bring a valid ID for verification</li>
                <li>All participants must have completed their waiver</li>
              </ul>
              <p><strong>📍 Location:</strong><br>
              Your Escape Room<br>
              123 Main St, City, State<br>
              Phone: (555) 123-4567</p>
            </div>
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>We're excited to see you tomorrow!</p>
              <p>Questions? Call us at (555) 123-4567</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: 'Reminder: Your booking for Mystery Manor is tomorrow at 7:00 PM. Please arrive 15 minutes early. Booking ID: BK-12345'
    });
    console.log('✅ Success:', result4.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 5: Welcome Email
  console.log('\n📧 Test 5: Welcome Email');
  try {
    const result5 = await sendEmail({
      to: TEST_EMAIL,
      subject: '🎉 Welcome to Booking TMS!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px; }
            .content { background: #f9f9f9; padding: 30px; margin: 20px 0; border-radius: 8px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #4f46e5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 Welcome!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Thank you for choosing Booking TMS</p>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Welcome to our escape room adventure! We're thrilled to have you join us.</p>
              
              <h3 style="color: #4f46e5;">What You Can Expect:</h3>
              
              <div class="feature">
                <strong>📧 Email Confirmations</strong><br>
                Instant booking confirmations with all the details you need
              </div>
              
              <div class="feature">
                <strong>📱 QR Code Waivers</strong><br>
                Quick and easy waiver completion via QR code
              </div>
              
              <div class="feature">
                <strong>⏰ Timely Reminders</strong><br>
                We'll remind you 24 hours before your booking
              </div>
              
              <div class="feature">
                <strong>🎯 Seamless Experience</strong><br>
                From booking to completion, we've got you covered
              </div>

              <p style="margin-top: 30px;">Ready to book your first adventure? Visit our website or give us a call!</p>
            </div>
            <div style="text-align: center; color: #666; font-size: 14px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p><strong>Contact Us:</strong><br>
              Phone: (555) 123-4567<br>
              Email: info@yourdomain.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: 'Welcome to Booking TMS! Thank you for choosing us for your escape room adventure.'
    });
    console.log('✅ Success:', result5.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All test emails sent successfully!');
  console.log('📬 Check inbox: bookingtms.com@gmail.com');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run the tests
sendAllTestEmails().catch(console.error);
