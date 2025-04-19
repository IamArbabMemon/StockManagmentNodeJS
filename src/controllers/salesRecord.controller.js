import { salesRecordModel } from "../models/salesRecord.model.js";
import mongoose from 'mongoose';
import { ErrorResponse } from "../utils/errorResponse.js";
import { stockModel } from "../models/stocks.model.js";
import { reserveAccounts } from "../models/reserve.model.js";

const addSalesRecord = async (req, res, next) => {
    try {
        const modelName = req.query.modelName;
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

        const usernames = salesRecordArray.map((doc) => doc.username || doc.userName);

        let result;

        switch (modelName) {
            case "reserve":
                result = await reserveAccounts.deleteMany({
                    username: { $in: usernames },
                });

                break;

            default:
                console.log("no model selected natural flow will be executed as all the accounts are marked as sold inside stock model");
                break;
        }


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

        let filter = {};

        if (status)
            filter = { status: status };

        const salesRecords = await salesRecordModel.find(filter);

        if (salesRecords.length === 0) {
            return res.status(200).json({ success: true, message: "Sales record table has no data" });
        }

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

// const replaceAccounts = async (req, res, next) => {
//     try {

//         const {username,rowId} = req.body;
//         console.log(req.body);


//         const previousAccount = await salesRecordModel.findById(rowId);
//         if (!previousAccount)
//             throw new ErrorResponse("salesRecord not found", 404);

//         const newAccountFromAvailableStocks = await stockModel.findOne({ username: username, saleStatus: "unsold" }); 

//         if (!newAccountFromAvailableStocks)
//             throw new ErrorResponse("No available stocks found for this username", 404);

//         await salesRecordModel.updateOne({ _id: rowId }, { $set: newAccountFromAvailableStocks });

//         await stockModel.updateOne({ _id: newAccountFromAvailableStocks._id }, { $set: { saleStatus: "sold" } });

//         await salesRecordModel.updateOne({_id:rowId}, {$set:{replaced:newAccountFromAvailableStocks._id}});

//         return res.status(200).json({ success: true, message: "salesRecord has been replaced succesfully ", newAccountFromAvailableStocks });

//     } catch (error) {
//         next(error)
//     }
// }

const replaceAccounts = async (req, res, next) => {
    try {
        const { username, rowId } = req.body;

        const previousAccount = await salesRecordModel.findById(rowId);
        if (!previousAccount)
            throw new ErrorResponse("salesRecord not found", 404);

        const newAccountFromAvailableStocks = await stockModel.findOne({
            username: username,
            saleStatus: "unsold"
        });

        if (!newAccountFromAvailableStocks)
            throw new ErrorResponse("No available stocks found for this username", 404);

        // Create a new object without the _id field
        const newAccountData = { ...newAccountFromAvailableStocks.toObject() };
        delete newAccountData._id;
        delete newAccountData.saleStatus; // Remove saleStatus since it's specific to stockModel

        // Update the sales record with the new account data (excluding _id)
        await salesRecordModel.updateOne(
            { _id: rowId },
            { $set: newAccountData }
        );

        // Mark the stock as sold
        await stockModel.updateOne(
            { _id: newAccountFromAvailableStocks._id },
            { $set: { saleStatus: "sold" } }
        );

        // Record the replacement
        await salesRecordModel.updateOne(
            { _id: rowId },
            { $set: { replaced: newAccountFromAvailableStocks._id } }
        );

        return res.status(200).json({
            success: true,
            message: "salesRecord has been replaced successfully",
            newAccountFromAvailableStocks,
            previousAccount
        });

    } catch (error) {
        next(error);
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
