const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (email, verificationToken) => {
  const msg = {
    from: process.env.SENDGRID_EMAIL_USER,
    to: email,
    subject: "Verification Email",
    text: "Click the following link to verify your email",
    html: `<strong>Click the following link to verify your email:</strong><br><a href="http://localhost:3000/users/verify/${verificationToken}">Verification Link</a>`,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = sendVerificationEmail;
