const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../schemas/users.schema");
const path = require("path");
const Jimp = require("jimp");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const {
  loginValidation,
  signupValidation,
} = require("../validators/user.validation");

const avatarDir = path.resolve("public", "avatars");

const login = async (email, password) => {
  const { error } = loginValidation({ email, password });
  if (error) {
    throw new Error(error.details[0].message);
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Email or password is wrong");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Email or password is wrong");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    user.token = token;
    await user.save();

    return {
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const signup = async (email, password) => {
  try {
    const { error } = signupValidation({ email, password });
    if (error) {
      throw new Error(error.details[0].message);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email in use");
    }

    const newUser = new User({ email, password });

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);

    newUser.subscription = "starter";

    await newUser.save();

    return {
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const current = async (user) => {
  return {
    email: user.email,
    subscription: user.subscription,
  };
};

const logout = async (user) => {
  try {
    if (!user) {
      throw new Error("Not authorized");
    }

    user.token = null;
    await user.save();

    return;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateAvatarUser = async (file, userId) => {
  try {
    if (!file) {
      throw new Error("No file uploaded");
    }

    const { buffer, originalname } = file;
    const imagePath = path.join(avatarDir, `${Date.now()}_${originalname}`);

    const image = await Jimp.read(buffer);
    await image.resize(250, 250).writeAsync(imagePath);

    const user = await User.findByIdAndUpdate(
      userId,
      { avatarURL: imagePath },
      { new: true }
    );

    return { avatarURL: user.avatarURL };
  } catch (error) {
    console.error("updateAvatarError:", error.message);
    throw error;
  }
};

const verifyUser = async (verificationToken) => {
  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      throw new Error("User not found");
    }

    user.verificationToken = null;
    user.verify = true;
    await user.save();

    return { message: "Verification successful" };
  } catch (error) {
    console.error("Verify User Error:", error.message);
    throw error;
  }
};

const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verification Email",
      text: `Click the following link to verify your email: http://your_api_base_url/users/verify/${verificationToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email Sending Error:", error.message);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.error("Send Verification Email Error:", error.message);
    throw error;
  }
};

const resendVerificationEmail = async (email) => {
  try {
    const { error } = signupValidation({ email });
    if (error) {
      throw new Error("Missing required field email");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.verify) {
      throw new Error("Verification has already been passed");
    }

    const newVerificationToken = uuidv4();

    user.verificationToken = newVerificationToken;
    await user.save();

    sendVerificationEmail(email, newVerificationToken);

    return { message: "Verification email sent" };
  } catch (error) {
    console.error("Resend Verification Email Error:", error.message);
    throw error;
  }
};

module.exports = {
  login,
  current,
  signup,
  logout,
  updateAvatarUser,
  verifyUser,
  resendVerificationEmail,
};
