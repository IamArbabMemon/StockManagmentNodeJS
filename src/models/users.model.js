import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
        trim: true
    },

    dob: {
        type: String,
        required: true
    },

    role: {
        type: String,
        required: true
    }
})

const userModel = mongoose.model('User', userSchema);

export {
    userModel
}