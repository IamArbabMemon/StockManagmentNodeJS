import bcrypt from "bcrypt";
import { ErrorResponse } from "../utils/errorResponse.js";
import { userModel } from "../models/users.model.js";
import jwt from 'jsonwebtoken';


const login = async (req, res, next) => {
    try {

        const { email, password } = req.body;

        console.log(req.body)

        if (!email || !password)
            throw new ErrorResponse("missing credentials", 400);

        const user = await userModel.findOne({ email });

        if (!user)
            throw new ErrorResponse("User not found", 404);

        const passwordMatched = await bcrypt.compare(password, user.password);
        console.log(passwordMatched)

        if (!passwordMatched)
            throw new ErrorResponse("incorrect password", 401);

        const payload = {
            _id: user._id,
            name: user.name,
            email: user.email,
            dob: user.dob,
            role: user.role
        }

        const token = await jwt.sign(payload, process.env.JWT_SECRET);

        res.cookie("token", token, {
            httpOnly: true, // makes the cookie inaccessible to client-side scripts
            secure: process.env.NODE_ENV === "production", // send the cookie over HTTPS only in production
            maxAge: 24 * 60 * 60 * 1000 // set the cookie to expire in 1 day
        });

        return res.status(200).json({ success: true, message: "Logged in successfully", user: payload, token });

    } catch (error) {
        next(error);
    }
}

export {
    login
}