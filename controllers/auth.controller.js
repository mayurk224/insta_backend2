const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../services/email.service");
const { resetPasswordTemplate, welcomeTemplate } = require("../utils/emailTemplate");
const resetPasswordModel = require("../models/resetPasswor.model");

async function signUpController(req, res) {
    const { username, email, password } = req.body;

    isUserExist = await userModel.findOne({ $or: [{ email }, { username }] });

    if (isUserExist) {
        return res.status(409).json({
            sucess: false,
            message: (isUserExist.email === email ? "Email already exist" : "Username already exist")
        });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hashPassword
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
        sucess: true,
        message: "User created sucessfully",
        user: {
            _id: user._id,
            username: user.username,
            email: user.email
        },
        token
    })

    await sendEmail({
        to: user.email,
        subject: "Welcome to Instagram",
        html: welcomeTemplate(user.username),
    });
}

async function signInController(req, res) {
    const { identifier, password } = req.body;

    const userExist = await userModel.findOne({ $or: [{ email: identifier }, { username: identifier }] });

    if (!userExist) {
        return res.status(401).json({
            sucess: false,
            message: "Invalid Credentials"
        })
    }

    const checkPassword = bcrypt.compare(password, userExist.password);

    if (!checkPassword) {
        return res.status(401).json({
            sucess: false,
            message: "Invalid Credentials"
        })
    }

    const token = jwt.sign({ userId: userExist._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
        sucess: true,
        message: "Sign in sucessfully",
        user: {
            _id: userExist._id,
            username: userExist.username,
            email: userExist.email,
        }
    })
}

async function logout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    })

    return res.status(200).json({
        sucess: true,
        message: "Logged out Sucessfully"
    })
}

async function forgotPasswordController(req, res) {
    try {
        const { identifier } = req.body;

        const userExist = await userModel.findOne({ $or: [{ email: identifier }, { username: identifier }] });

        if (!userExist) {
            return res.status(401).json({
                sucess: false,
                message: "Invalid Credentials"
            })
        }

        await resetPasswordModel.deleteMany({ userId: userExist.id });

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashToken = crypto.createHash("sha256").update(resetToken).digest("hex")

        await resetPasswordModel.create({
            userId: userExist.id,
            token: hashToken,
            expiredAt: Date.now() + 15 * 60 * 1000
        })

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        await sendEmail({
            to: userExist.email,
            subject: "Reset your password",
            html: resetPasswordTemplate(resetUrl),
        });

        return res.status(200).json({
            sucess: true,
            message: "Reset link sent sucessfully"
        })
    } catch (error) {
        console.log("Internal Server Error");
        return res.status(500).json({
            sucess: false,
            message: "Internal Server Error"
        })
    }
}

async function resetPasswordController(req, res) {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                sucess: false,
                message: "Token and new password is required"
            });
        };

        const hashToken = crypto.createHash("sha256").update(token).digest("hex")

        const validToken = await resetPasswordModel.findOne({
            token: hashToken,
            expiredAt: { $gt: Date.now() }
        });

        if (!validToken) {
            return res.status(400).json({
                sucess: false,
                message: "Invalid or expired token"
            });
        };

        const user = await userModel.findById(validToken.userId);

        if (!user) {
            return res.status(400).json({
                sucess: false,
                message: "User not found"
            });
        };

        const hashPassowrd = await bcrypt.hash(newPassword, 10);

        user.password = hashPassowrd;

        await user.save();

        await resetPasswordModel.deleteOne({
            _id: validToken._id
        });

        return res.status(200).json({
            sucess: true,
            message: "Password reset sucessfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            sucess: false,
            message: "Internal Server error"
        });
    };
}

module.exports = { signUpController, signInController, logout, forgotPasswordController, resetPasswordController }