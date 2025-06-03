import mongoose from "mongoose";
import { getNextSequence } from "../utils/counterIncrement.js";

const faultyAccountsSchema = new mongoose.Schema({

    cpInDollar: Number,

    cpInPKR: {
        type: Number,
        required: false
    },

    saleStatus: {
        type: String,
        default: "unsold",
        enum: ["sold", "unsold"]
    },

    faultyStatus: {
        type: Boolean,
        default: true,
    },

    sNo: Number

}, { timestamps: true, strict: false })

faultyAccountsSchema.pre("save", async function (next) {

    this.sNo = await getNextSequence("faultyAccounts");
    next();
});

const faultyAccounts = mongoose.model('faultyAccounts', faultyAccountsSchema);

export {
    faultyAccounts
}