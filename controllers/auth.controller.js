const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

module.exports = { signUpController, signInController, logout }