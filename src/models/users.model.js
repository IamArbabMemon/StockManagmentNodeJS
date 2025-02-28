import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },

    email: {
        type: String,
        require: true,
        unique: true
    },

    password: {
        type: String,
        require: true,
        trim: true
    },

    dob: {
        type: String,
        require: true
    },

    role: {
        type: String,
        require: true
    }
})

const userModel = mongoose.model('User', userSchema);

export {
    userModel
}