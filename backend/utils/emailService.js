import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your SMTP service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Your Verification OTP',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Verify Your Email</h2>
          <p>Your OTP code is:</p>
          <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code expires in 15 minutes.</p>
        </div>
      `,
    });
    console.log(`OTP sent to ${email}`); // Remove in production
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};