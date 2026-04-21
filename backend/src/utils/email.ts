import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  // Yahan 'service: "gmail"' BILKUL nahi hona chahiye
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (options: { to: string; subject: string; html: string }) => {
  const mailOptions = {
    from: '"Bitstores" <noreply@bitstores.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};