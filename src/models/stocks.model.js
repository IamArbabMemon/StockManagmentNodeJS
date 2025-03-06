import mongoose from "mongoose";
import { getNextSequence } from "../utils/counterIncrement.js";

const stockSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },

    data2: { type: String, trim: true },
    data3: { type: String, trim: true },
    data4: { type: String, trim: true },
    data5: { type: String, trim: true },
    data6: { type: String, trim: true },
    data7: { type: String, trim: true },
    data8: { type: String, trim: true },

    gameName: {
        type: String,
        required: true,
        trim: true
    },

    productName: {
        type: String,
        required: true,
        trim: true
    },

    cpInUSD: Number,

    cpInPKR: {
        type: Number,
        required: true
    },

    supplierName: {
        type: String,
        required: true,
        trim: true
    },

    sNo: Number

}, { timestamps: true, strict: false })

stockSchema.pre("save", async function (next) {

    this.sNo = await getNextSequence("stocks");
    next();
});


const stockModel = mongoose.model('Stock', stockSchema);

export {
    stockModel
}