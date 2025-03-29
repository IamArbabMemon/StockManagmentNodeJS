import { reserveAccounts } from "../models/reserve.model.js";
import { getNextSequence } from "../utils/counterIncrement.js";
import { ErrorResponse } from "../utils/errorResponse.js";
import mongoose from "mongoose";


const addStock = async (req, res, next) => {
    try {

        const reserveDataArray = req.body;

        if (!Array.isArray(reserveDataArray) || reserveDataArray.length === 0) {
            throw new ErrorResponse("Stocks array is required and cannot be empty", 400);
        }


        for (let stock of reserveDataArray) {

            stock.sNo = await getNextSequence("reserveAccounts");
        }


        const data = await reserveAccounts.insertMany(reserveDataArray);
        //  stockModel.updateMany({}, [{ $set: { cpInUSD: { $toDouble: "$cpInUSD" } } }])


        if (!data || data.length === 0)
            throw new ErrorResponse("stocks are not inserted properly", 500);

        return res.status(201).json({ success: true, message: "reserve account has been added succesfully " });

    } catch (error) {
        next(error)
    }
}


const getAllStocks = async (req, res, next) => {
    try {
        const { saleStatus, gameName, productName, website } = req.query;

        // Build dynamic filter object
        const filter = {};
        if (saleStatus) filter.saleStatus = saleStatus;
        if (gameName) filter.gameName = gameName;
        if (productName) filter.productName = productName;
        if (website) filter.website = website;

        const reserveStocks = await reserveAccounts.find(filter);


        const sumOfcpInPKR = await reserveAccounts.aggregate([
            { $match: filter }, // Apply filters
            {
                $group: {
                    _id: null,
                    totalCpInPKR: { $sum: "$cpInPKR" }
                }
            }
        ]);


        const sumOfcpInUSD = await reserveAccounts.aggregate([
            { $match: filter }, // Apply filters
            {
                $group: {
                    _id: null,
                    totalCpInUSD: { $sum: "$cpInDollar" }
                    //totalCpInUSD: { $sum: { $ifNull: ["$cpInUSD", 0] } }

                }
            }
        ]);

        //        console.log(sumfaultyData

        const data = {
            reserveStocks,
            sumOfcpInPKR: sumOfcpInPKR.length > 0 ? sumOfcpInPKR[0].totalCpInPKR : 0,
            sumOfcpInUSD: sumOfcpInUSD.length > 0 ? sumOfcpInUSD[0].totalCpInUSD : 0
        };


        console.log(sumOfcpInUSD);


        if (!reserveStocks)
            throw new ErrorResponse("reserve Stocks are not fetching properly", 500);

        return res.status(200).json({ success: true, message: "All reserve stocks has been fetched succesfully according to website with sum ", data });

    } catch (error) {
        next(error)
    }
}

const getStockByID = async (req, res, next) => {
    try {

        const id = req.params.id;

        const stock = await reserveAccounts.findById(id);

        if (!stock)
            throw new ErrorResponse("stocks not found", 404);

        return res.status(200).json({ success: true, message: "reserve stocks has been fetched succesfully by id ", stock });

    } catch (error) {
        next(error)
    }
}


const updateStockById = async (req, res, next) => {
    try {

        const id = req.params.id;
        const stock = req.body;


        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorResponse("Invalid stock ID", 400);
        }

        // Validate required fields
        // if (!stock.username?.trim() ||
        //     !stock.gameName?.trim() ||
        //     !stock.productName?.trim() ||
        //     !stock.supplierName?.trim() ||
        //     !stock.cpInPKR) {
        //     throw new ErrorResponse("Missing fields in stock object", 400);
        // }

        const updatedStock = await reserveAccounts.findByIdAndUpdate(id, stock, { new: true });

        if (!updatedStock)
            throw new ErrorResponse("stock not found", 404);

        return res.status(200).json({ success: true, message: "reserve stock has been updated succesfully ", updatedStock });

    } catch (error) {
        next(error)
    }
}


const deleteStockById = async (req, res, next) => {
    try {

        const id = req.params.id;

        const deletedStock = await reserveAccounts.findByIdAndDelete(id);

        if (!deletedStock)
            throw new ErrorResponse("stock not found", 404);

        return res.status(200).json({ success: true, message: "stocks has been deleted succesfully ", deletedStock });

    } catch (error) {
        next(error)
    }
}


export {
    addStock,
    updateStockById,
    deleteStockById,
    getAllStocks,
    getStockByID,
}