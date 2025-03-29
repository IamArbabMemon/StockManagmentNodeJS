import mongoose from "mongoose";
import { getNextSequence } from "../utils/counterIncrement.js";

const reserveAccountsSchema = new mongoose.Schema({

    cpInDollar: Number,

    cpInPKR: {
        type: Number,
    },

    saleStatus: {
        type: String,
        default: "unsold",
        enum: ["sold", "unsold"]
    },

    website: String,

    sNo: Number

}, { timestamps: true, strict: false })

reserveAccountsSchema.pre("save", async function (next) {

    this.sNo = await getNextSequence("reserveAccounts");
    next();
});


const reserveAccounts = mongoose.model('reserveAccounts', reserveAccountsSchema);

export {
    reserveAccounts
}