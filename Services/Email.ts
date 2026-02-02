import nodemailer from "nodemailer";
import { generateOTP } from "./otpGenerator";

export const sendOtpEmail = async (email: string) => {
  const otp = generateOTP();

  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"VC App" <no-reply@vcapp.com>',
    to: email,
    subject: "Password Reset OTP",
    html: `
      <h2>Forgot Password</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
    `,
  });

  console.log("Email link", nodemailer.getTestMessageUrl(info));

  return otp; 
};
