import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config({
    path: './src/.env'
})

const DBConnection = async () => {
    try {
        console.log(process.env.MONGO_URI)
        const db = await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://throwable008:AIFjB3I2HR0b43en@cluster0.i1uah.mongodb.net/stock-management?retryWrites=true&w=majority&appName=Cluster0");
        console.log("Database has been connected")


    } catch (error) {
        console.log( error);
        console.log("ERROR IN MONGODB CONNECTION !! " + error.message);
        process.exit(1)
    }
};

export { DBConnection }
