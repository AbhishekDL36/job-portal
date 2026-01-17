import nodemailer from 'nodemailer';

console.log(process.env.EMAIL_PASSWORD);

console.log('📧 Email Service Configuration:');
console.log(`   SERVICE: ${process.env.EMAIL_SERVICE || 'gmail'}`);
console.log(`   USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ MISSING'}`);
console.log(`   PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ MISSING'}`);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('\n⚠️  EMAIL CREDENTIALS MISSING!');
  console.error('   Update your .env file with:');
  console.error('   EMAIL_USER=your-email@gmail.com');
  console.error('   EMAIL_PASSWORD=your-16-char-app-password\n');
}

// Configure your email service here
// Using Gmail, Outlook, or any SMTP service
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Alternative: Using custom SMTP
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: true,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });

export async function sendOTPEmail(email, otp) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP - Job Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h2 style="color: #333;">Email Verification</h2>
            <p style="color: #666; font-size: 16px;">
              Your OTP for email verification is:
            </p>
            <div style="background-color: #fff; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; letter-spacing: 5px; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">
              This OTP is valid for 10 minutes. Do not share it with anyone.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              If you didn't request this OTP, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
}

export async function sendApplicationConfirmationEmail(email, jobTitle, companyName) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Application Confirmation - ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h2 style="color: #28a745;">Application Submitted Successfully!</h2>
            <p style="color: #666; font-size: 16px;">
              Thank you for applying for the position:
            </p>
            <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #333; margin: 0 0 10px 0;">${jobTitle}</h3>
              <p style="color: #666; margin: 0;"><strong>Company:</strong> ${companyName}</p>
            </div>
            <p style="color: #666; font-size: 14px;">
              We have received your application and it will be reviewed by the hiring team. You will be notified about the status of your application via email.
            </p>
            <p style="color: #666; font-size: 14px;">
              Thank you for your interest in our company!
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Best regards,<br/>
              Job Portal Team
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending application confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
}

export async function sendApplicationStatusUpdateEmail(email, jobTitle, status) {
  try {
    const statusMessages = {
      shortlisted: 'Congratulations! You have been shortlisted for the next round of interviews.',
      rejected: 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.',
      accepted: 'Excellent news! We are pleased to offer you the position.',
    };

    const statusColors = {
      shortlisted: '#ffc107',
      rejected: '#dc3545',
      accepted: '#28a745',
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Application Status Update - ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h2 style="color: #333;">Application Status Update</h2>
            <p style="color: #666; font-size: 16px;">
              For the position: <strong>${jobTitle}</strong>
            </p>
            <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${statusColors[status] || '#007bff'};">
              <h3 style="color: ${statusColors[status] || '#007bff'}; text-transform: uppercase; margin: 0 0 10px 0;">${status}</h3>
              <p style="color: #666; margin: 0;">
                ${statusMessages[status] || 'Your application status has been updated.'}
              </p>
            </div>
            <p style="color: #666; font-size: 14px;">
              Log in to your account to see more details about your application.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Best regards,<br/>
              Job Portal Team
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending status update email:', error);
    throw new Error('Failed to send status update email');
  }
}

export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email service is connected and ready');
    return true;
  } catch (error) {
    console.error('❌ Email service connection failed:', error);
    return false;
  }
}
