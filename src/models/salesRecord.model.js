import mongoose from "mongoose";
import { getNextSequence } from "../utils/counterIncrement.js";

const saleRecordSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },


    saleDate: {
        type: Date,
    },

    orderId: {
        type: String,
        required: true,
        trim: true
    },

    site: {
        type: String,
        required: true
    },

    sellPrice: {
        type: Number,
        required: true
    },


    recievedAmount: {
        type: Number,
        required: true
    },




}, { timestamps: true, strict: false })



const salesRecordModel = mongoose.model('sales-record-model', saleRecordSchema);

export {
    salesRecordModel
}