import { ErrorResponse } from "../utils/errorResponse.js";
import { closingAccounts } from "../models/closing.model.js";
import { getNextSequence } from "../utils/counterIncrement.js";
import mongoose from "mongoose";
import { faultyAccounts } from "../models/faultyStocks.model.js";
const addClosingAccounts = async (req, res, next) => {
    try {
        const closingDataArray = req.body;

        if (!Array.isArray(closingDataArray) || closingDataArray.length === 0) {
            throw new ErrorResponse("Stocks array is required and cannot be empty", 400);
        }


        for (let stock of closingDataArray) {
            // const { username, gameName, productName, cpInPKR, supplierName } = stock;

            // if (!username || !gameName || !productName || !cpInPKR || !supplierName) {
            //     throw new ErrorResponse("All stock entries must have username, gameName, productName, cpInPKR, and supplierName", 400);
            // }

            stock.sNo = await getNextSequence("stocks");
        }

        const data = await closingAccounts.insertMany(closingDataArray);
        //  stockModel.updateMany({}, [{ $set: { cpInUSD: { $toDouble: "$cpInUSD" } } }])
        const usernames = closingDataArray.map(
            (doc) => doc.userName || doc.username
        );

        //const removeFromFaulty = await faultyAccounts.deleteMany({});

        const result = await faultyAccounts.deleteMany({
            username: { $in: usernames },
        });

        if (!data || data.length === 0)
            throw new ErrorResponse("stocks are not inserted properly", 500);

        return res.status(201).json({ success: true, message: "closing accounts has been added succesfully " });

    } catch (error) {
        next(error)
    }
}


const getAllClosingAccounts = async (req, res, next) => {
    try {
        const closingData = await closingAccounts.find({});
        if (closingData.length === 0) {
            return res.status(200).json({ success: true, message: "Closing table has no data" });
        }

        return res.status(200).json({ success: true, message: "All closing accounts has been fetched succesfully according to gameName and productName with sum ", closingData });

    } catch (error) {
        console.log(error);
        next(error)

    }
}

export {
    addClosingAccounts,
    getAllClosingAccounts
}