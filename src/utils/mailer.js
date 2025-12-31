import nodemailer from "nodemailer";

export async function sendEmail(to, sub, msg) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAILHOST,
      port: process.env.MAILPORT,
      secure: true, // upgrade later with STARTTLS
      auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD,
        // pass: "zqhepjbshisjhpts",
      },
    });

    const mailOptions = {
      from: `"Learn Lab" <aimlearnlab@gmail.com>`, // sender address
      to: to, // list of receivers
      subject: sub, // Subject line
      //text: msg, // plain text body
      html: msg, // html body
    };

    const mailResponse = await transporter.sendMail(mailOptions);
    return mailResponse;
  } catch (error) {
    throw new Error(error.message);
  }
}
