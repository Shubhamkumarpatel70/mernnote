import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // 👈 server email
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `Note App <${process.env.EMAIL_USER}>`, // 👈 sender
      to, // 👈 user email
      subject,
      text,
    });

    console.log("📧 Email sent to:", to);
  } catch (error) {
    console.error("Email error:", error.message);
  }
};

export default sendEmail;
