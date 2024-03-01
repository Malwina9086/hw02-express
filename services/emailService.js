const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = () => {
  const recipientEmail = process.env.SENDGRID_EMAIL_USER;
  const verificationToken = process.env.SENDGRID_API_KEY;

  if (!recipientEmail || !verificationToken) {
    console.error(
      "Recipient email or verification token not provided in environment variables."
    );
    return;
  }

  const msg = {
    from: process.env.SENDGRID_EMAIL_USER,
    to: recipientEmail,
    subject: "Verification Email",
    text: `Click the following link to verify your email: http://localhost:3000/users/verify/${verificationToken}`,
  };

  return sgMail.send(msg);
};

sendVerificationEmail()
  .then(() => {
    console.log("Email sent");
  })
  .catch((error) => {
    console.error(error);
  });

module.exports = sendVerificationEmail;
