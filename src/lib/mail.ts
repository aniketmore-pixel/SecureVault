import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // Use 'true' if you use port 465, 'false' for 587
  auth: {
    user: "aniketmore.personal@gmail.com", // The email you signed up to Brevo with
    pass: "xsmtpsib-65b4c82ab028ef9f37731bba294e0f6314bc82ec434aafdbc81e8a9f58199ebd-kvQ7qp1EAjRgXWCM", // Your Brevo SMTP Key
  },
});

export const sendOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Your One-Time Password',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
        <h2>Your Verification Code</h2>
        <p>Use the following code to complete your login. This code is valid for 10 minutes.</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; background-color: #f0f0f0; padding: 10px 20px; display: inline-block; border-radius: 5px;">
          ${otp}
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};