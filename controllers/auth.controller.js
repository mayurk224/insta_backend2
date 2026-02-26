const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../services/email.service");
const {
  resetPasswordTemplate,
  welcomeTemplate,
  resetPasswordSucessTemplate,
  resendVerifyEmailTemplate,
} = require("../utils/emailTemplate");
const resetPasswordModel = require("../models/resetPassword.model");
const verifyEmailModel = require("../models/verifyEmail.model");

async function signUpController(req, res) {
  const { username, email, password } = req.body;

  if (
    !username ||
    typeof username !== "string" ||
    !email ||
    typeof email !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    return res.status(400).json({
      sucess: false,
      message: "username, email and password are required",
    });
  }

  const isUserExist = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (isUserExist) {
    return res.status(409).json({
      sucess: false,
      message:
        isUserExist.email === email
          ? "Email already exist"
          : "Username already exist",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hashPassword,
  });

  const verifyEmailToken = crypto.randomBytes(32).toString("hex");

  const hashVerifyEmailToken = crypto
    .createHash("sha256")
    .update(verifyEmailToken)
    .digest("hex");

  await verifyEmailModel.create({
    userId: user._id,
    token: hashVerifyEmailToken,
    expiredAt: Date.now() + 24 * 60 * 60 * 1000,
  });

  const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyEmailToken}`;

  res.status(201).json({
    sucess: true,
    message: "Account created. Please verify your email.",
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
    },
  });

  await sendEmail({
    to: user.email,
    subject: "Welcome to Instagram",
    html: welcomeTemplate(user.username, verifyEmailUrl),
  });
}

async function resendVerifyEmailController(req, res) {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        sucess: false,
        message: "Email or username is required",
      });
    }

    const userExist = await userModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!userExist) {
      return res.status(400).json({
        sucess: false,
        message: "User not found",
      });
    }

    if (userExist.userVerified) {
      return res.status(400).json({
        sucess: false,
        message: "User is already verified",
      });
    }

    await verifyEmailModel.deleteMany({
      userId: userExist._id,
    });

    const verifyEmailToken = crypto.randomBytes(32).toString("hex");

    const hashVerifyEmailToken = crypto
      .createHash("sha256")
      .update(verifyEmailToken)
      .digest("hex");

    await verifyEmailModel.create({
      userId: userExist._id,
      token: hashVerifyEmailToken,
      expiredAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyEmailToken}`;

    res.status(200).json({
      sucess: true,
      message: "Email sent. Please check your inbox",
    });

    await sendEmail({
      to: userExist.email,
      subject: "New Verification Email",
      html: resendVerifyEmailTemplate(userExist.username, verifyEmailUrl),
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      sucess: false,
      message: "Internal server error",
    });
  }
}

async function verifyEmailController(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        sucess: false,
        message: "Token not found",
      });
    }

    const hashToken = crypto.createHash("sha256").update(token).digest("hex");

    const verifyToken = await verifyEmailModel.findOne({
      token: hashToken,
      expiredAt: { $gt: Date.now() },
    });

    if (!verifyToken) {
      return res.status(400).json({
        sucess: false,
        message: "Invalid or expired token",
      });
    }

    const user = await userModel.findById(verifyToken.userId);

    if (!user) {
      return res.status(400).json({
        sucess: false,
        message: "user not found",
      });
    }

    user.userVerified = true;

    await user.save();

    await verifyEmailModel.deleteOne({
      _id: verifyToken._id,
    });

    return res.status(200).json({
      sucess: true,
      message: "Email verify sucessfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      sucess: false,
      message: "Internal Server Error",
    });
  }
}

async function signInController(req, res) {
  const { identifier, password } = req.body;

  if (
    !identifier ||
    typeof identifier !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    return res.status(400).json({
      sucess: false,
      message: "identifier and password are required",
    });
  }

  const userExist = await userModel.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!userExist) {
    return res.status(401).json({
      sucess: false,
      message: "Invalid Credentials",
    });
  }

  if (!userExist.userVerified) {
    return res.status(403).json({
      sucess: false,
      message: "Please verify your email",
    });
  }

  const checkPassword = await bcrypt.compare(password, userExist.password);

  if (!checkPassword) {
    return res.status(401).json({
      sucess: false,
      message: "Invalid Credentials",
    });
  }

  const token = jwt.sign({ userId: userExist._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    sucess: true,
    message: "Sign in sucessfully",
    user: {
      _id: userExist._id,
      username: userExist.username,
      email: userExist.email,
    },
  });
}

async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({
    sucess: true,
    message: "Logged out Sucessfully",
  });
}

async function forgotPasswordController(req, res) {
  try {
    const { identifier } = req.body;

    const userExist = await userModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!userExist) {
      return res.status(401).json({
        sucess: false,
        message: "Invalid Credentials",
      });
    }

    await resetPasswordModel.deleteMany({ userId: userExist.id });

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await resetPasswordModel.create({
      userId: userExist.id,
      token: hashToken,
      expiredAt: Date.now() + 15 * 60 * 1000,
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: userExist.email,
      subject: "Reset your password",
      html: resetPasswordTemplate(resetUrl),
    });

    return res.status(200).json({
      sucess: true,
      message: "Reset link sent sucessfully",
    });
  } catch (error) {
    console.log("Internal Server Error");
    return res.status(500).json({
      sucess: false,
      message: "Internal Server Error",
    });
  }
}

async function verifyResetTokenController(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token not found",
      });
    }

    const hashToken = crypto.createHash("sha256").update(token).digest("hex");

    const validToken = await resetPasswordModel.findOne({
      token: hashToken,
      expiredAt: { $gt: Date.now() },
    });

    if (!validToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Valid token",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
}

async function resetPasswordController(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        sucess: false,
        message: "Token and new password is required",
      });
    }

    const hashToken = crypto.createHash("sha256").update(token).digest("hex");

    const validToken = await resetPasswordModel.findOne({
      token: hashToken,
      expiredAt: { $gt: Date.now() },
    });

    if (!validToken) {
      return res.status(400).json({
        sucess: false,
        message: "Invalid or expired token",
      });
    }

    const user = await userModel.findById(validToken.userId);

    if (!user) {
      return res.status(400).json({
        sucess: false,
        message: "User not found",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        sucess: false,
        message: "New password cannot be same as old password",
      });
    }

    const hashPassowrd = await bcrypt.hash(newPassword, 10);

    user.password = hashPassowrd;

    await user.save();

    await resetPasswordModel.deleteOne({
      _id: validToken._id,
    });

    await sendEmail({
      to: user.email,
      subject: "Password Reset Successful",
      html: resetPasswordSucessTemplate(),
    });

    return res.status(200).json({
      sucess: true,
      message: "Password reset sucessfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      sucess: false,
      message: "Internal Server error",
    });
  }
}

async function getMeController(req, res) {
  try {
    const user = await userModel.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        bio: user.profile.bio,
        avatarUrl: user.profile.avatarUrl,
        fullname: user.profile.fullname,
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = {
  signUpController,
  resendVerifyEmailController,
  verifyEmailController,
  signInController,
  logout,
  forgotPasswordController,
  verifyResetTokenController,
  resetPasswordController,
  getMeController,
};
