import { salesRecordModel } from "../models/salesRecord.model.js";
import mongoose from 'mongoose';
import { ErrorResponse } from "../utils/errorResponse.js";
import { stockModel } from "../models/stocks.model.js";

const addSalesRecord = async (req, res, next) => {
    try {

        const salesRecordArray = req.body;

        if (!Array.isArray(salesRecordArray) || salesRecordArray.length === 0) {
            throw new ErrorResponse("Stocks array is required and cannot be empty", 400);
        }


        for (let saleRecord of salesRecordArray) {
            const { saleDate, username, sellPrice, recievedAmount, orderId, site } = saleRecord;

            if (!username || !saleDate || !sellPrice || !recievedAmount || !orderId || !site) {
                throw new ErrorResponse("All sales entries must have username, saleDate, salePrice, recievedAmount, orderId and site", 400);
            }

            saleRecord.member = req.user.name

        }

        const data = await salesRecordModel.insertMany(salesRecordArray);

        if (!data || data.length === 0)
            throw new ErrorResponse("stocks are not inserted properly", 500);

        const usernamesToBeUpdated = salesRecordArray.map(saleRecord => saleRecord.username);

        await stockModel.updateMany({ username: { $in: usernamesToBeUpdated } }, { saleStatus: "sold" });

        return res.status(201).json({ success: true, message: "sales has been added succesfully " });

    } catch (error) {
        next(error)
    }
}



const getAllSalesRecord = async (req, res, next) => {
    try {

        const { status } = req.query;

        console.log(status)

        const salesRecords = await salesRecordModel.find({ status });

        // if (!salesRecords || salesRecords.length === 0)
        //     throw new ErrorResponse("sales are not fetching properly", 500);

        return res.status(200).json({ success: true, message: "All sales has been fetched succesfully ", salesRecords });

    } catch (error) {
        next(error)
    }
}



const getSalesRecordByID = async (req, res, next) => {
    try {

        const id = req.params.id;

        const salesRecord = await salesRecordModel.findById(id);

        if (!salesRecord)
            throw new ErrorResponse("sales record not found", 404);

        return res.status(200).json({ success: true, message: "sales record has been fetched succesfully by id ", salesRecord });

    } catch (error) {
        next(error)
    }
}


const updateSalesRecordByID = async (req, res, next) => {
    try {

        const id = req.params.id;
        const salesRecord = req.body;


        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorResponse("Invalid salesRecord ID", 400);
        }

        // Validate required fields
        if (!salesRecord.username?.trim() ||
            !salesRecord.orderId?.trim() ||
            !salesRecord.sellPrice ||
            !salesRecord.recievedAmount ||
            !salesRecord.site?.trim() ||
            !salesRecord.saleDate) {
            throw new ErrorResponse("Missing fields in salesRecord object", 400);
        }

        const updatedSalesRecord = await salesRecordModel.findByIdAndUpdate(id, salesRecord, { new: true });

        if (!updatedSalesRecord)
            throw new ErrorResponse("salesRecord not found", 404);

        return res.status(200).json({ success: true, message: "salesRecord has been updated succesfully ", updatedSalesRecord });

    } catch (error) {
        next(error)
    }
}



const deleteSalesRecordByID = async (req, res, next) => {
    try {

        const id = req.params.id;

        const deletedSalesRecord = await salesRecordModel.findByIdAndDelete(id);

        if (!deletedSalesRecord)
            throw new ErrorResponse("salesRecord not found", 404);

        return res.status(200).json({ success: true, message: "salesRecord has been deleted succesfully ", deletedSalesRecord });

    } catch (error) {
        next(error)
    }
}

const replaceAccounts = async (req, res, next) => {
    try {

        const {username,rowId} = req.body;

        const previousAccount = await salesRecordModel.findById(rowId);
        if (!previousAccount)
            throw new ErrorResponse("salesRecord not found", 404);

        const newAccountFromAvailableStocks = await stockModel.findOne({ username: username, saleStatus: "unsold" }); 
        
        if (!newAccountFromAvailableStocks)
            throw new ErrorResponse("No available stocks found for this username", 404);

        await salesRecordModel.updateOne({ _id: rowId }, { $set: newAccountFromAvailableStocks });

        await stockModel.updateOne({ _id: newAccountFromAvailableStocks._id }, { $set: { saleStatus: "sold" } });

        await salesRecordModel.updateOne({_id:rowId}, {$set:{replaced:newAccountFromAvailableStocks._id}});
        
        return res.status(200).json({ success: true, message: "salesRecord has been replaced succesfully ", newAccountFromAvailableStocks });

    } catch (error) {
        next(error)
    }
}


export {
    getAllSalesRecord,
    addSalesRecord,
    updateSalesRecordByID,
    getSalesRecordByID,
    deleteSalesRecordByID,
    replaceAccounts
}
