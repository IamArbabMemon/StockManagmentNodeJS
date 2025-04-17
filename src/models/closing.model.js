import mongoose from "mongoose";
import { getNextSequence } from "../utils/counterIncrement.js";

const closingModelSchema = new mongoose.Schema({

    username:{
        unique: true,
        type: String,
    }

}, { timestamps: true, strict: false })

closingModelSchema.pre("save", async function (next) {

    this.sNo = await getNextSequence("closingAccounts");
    next();
});


const closingAccounts = mongoose.model('closingAccounts', closingModelSchema);

export {
closingAccounts
}