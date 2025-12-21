import nodemailer from "nodemailer";

export async function sendPurchaseOrderEmail(po, pdfBuffer) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_PORT == 465 || false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Fixed Asset Registry" <${process.env.MAIL_USER}>`,
    to: po.vendor_email,
    subject: `Purchase Order ${po.po_number}`,
    text: `Dear ${po.vendor_name},\n\nPlease find attached the Purchase Order.\n\nThank you.`,
    attachments: [
      {
        filename: `${po.po_number}.pdf`,
        content: pdfBuffer, // Use buffer instead of path
      },
    ],
  });

  return true;
}
