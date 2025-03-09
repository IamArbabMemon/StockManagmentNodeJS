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
        unique: true,
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

    status: {
        type: String,
        enum: ['approved', 'pending', 'failed'],
        default: "pending"
    }




}, { timestamps: true, strict: false })



const salesRecordModel = mongoose.model('sales-records', saleRecordSchema);

export {
    salesRecordModel
}