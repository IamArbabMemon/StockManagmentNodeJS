import { userModel } from "../models/users.model.js";
import { ErrorResponse } from "../utils/errorResponse.js";
import bcrypt from 'bcrypt';


const addUser = async (req, res, next) => {
    try {

        const { name, email, password, dob, role } = req.body;


        // Check if all required fields are provided
        if (!name || !email || !role || !dob || !password) {
            throw new ErrorResponse("Please provide all the required fields", 400);
        }

        const checkUserExist = await userModel.findOne({ email });

        if (checkUserExist)
            throw new ErrorResponse("User already registered", 409);

        const hashedPass = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name,
            email,
            role,
            dob,
            password: hashedPass
        });

        if (!user) {
            throw new ErrorResponse("Failed to add user to database", 500);
        }

        return res.status(201).json({ success: true, message: "User has been added succesfully ", user });

    } catch (error) {
        next(error)
    }
}


const getUserByID = async (req, res, next) => {
    try {

        const { id } = req.params;

        if (!id)
            throw new ErrorResponse("Please provide id in params", 400);

        const user = await userModel.findById(id);

        if (!user)
            throw new ErrorResponse("User not found", 400);

        return res.status(201).json({ success: true, message: "User has been fetched by id successfully ", user });


    } catch (error) {
        next(error)
    }
}



const updateUserByID = async (req, res, next) => {
    try {

        const { id } = req.params;
        const { name, email, password, dob, role } = req.body;

        if (!id)
            throw new ErrorResponse("Please provide id in params", 400);


        // Check if all required fields are provided
        if (!name || !email || !role || !dob) {
            throw new ErrorResponse("Please provide all the required fields", 400);
        }

        const user = await userModel.findById(id);

        if (!user)
            throw new ErrorResponse("User not found", 400);

        user.name = name;
        user.email = email;
        user.dob = dob;
        user.role = role;

        await user.save();

        return res.status(201).json({ success: true, message: "User has been updated succesfully ", user });

    } catch (error) {
        next(error)
    }
}


const deleteUserByID = async (req, res, next) => {
    try {

        const { id } = req.params;

        if (!id)
            throw new ErrorResponse("Please provide id in params", 400);

        const user = await userModel.findByIdAndDelete(id);

        if (!user)
            throw new ErrorResponse("User not found", 400);

        return res.status(201).json({ success: true, message: "User has been added deleted by id successfully ", user });

    } catch (error) {
        next(error)
    }
}


const getAllUsers = async (req, res, next) => {
    try {

        const user = await userModel.find({});

        if (user.length === 0) {
            return res.status(201).json({ success: true, message: "User table no data  " });
        }

        return res.status(201).json({ success: true, message: "All User has been fetched ", user });


    } catch (error) {
        next(error)
    }
}





export {
    addUser, getUserByID, deleteUserByID, updateUserByID, getAllUsers
}