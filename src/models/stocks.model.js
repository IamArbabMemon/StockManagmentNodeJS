import mongoose from "mongoose";
import { getNextSequence } from "../utils/counterIncrement.js";

const stockSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },

    data2: String,
    data3: String,
    data4: String,
    data5: String,
    data6: String,
    data7: String,
    data8: String,

    gameName: {
        type: String,
        required: true
    },

    productName: {
        type: String,
        required: true
    },

    cpInUSD: Number,

    cpInPKR: {
        type: Number,
        required: true
    },

    supplierName: {
        type: String,
        required: true
    },

    sNo: Number

})

stockSchema.pre("save", async function (next) {

    this.sNo = await getNextSequence("stocks");
    next();
});


const stockModel = mongoose.model('Stock', stockSchema);

export {
    stockModel
}