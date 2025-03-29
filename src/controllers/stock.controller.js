import { boxesModel } from "../models/boxes.model.js";
import { stockModel } from "../models/stocks.model.js";
import { getNextSequence } from "../utils/counterIncrement.js";
import { ErrorResponse } from "../utils/errorResponse.js";
import mongoose from "mongoose";


const addStock = async (req, res, next) => {
    try {

        const stockDataArray = req.body;

        if (!Array.isArray(stockDataArray) || stockDataArray.length === 0) {
            throw new ErrorResponse("Stocks array is required and cannot be empty", 400);
        }


        for (let stock of stockDataArray) {
            const { username, gameName, productName, cpInPKR, supplierName } = stock;

            if (!username || !gameName || !productName || !cpInPKR || !supplierName) {
                throw new ErrorResponse("All stock entries must have username, gameName, productName, cpInPKR, and supplierName", 400);
            }

            stock.sNo = await getNextSequence("stocks");
        }

        const data = await stockModel.insertMany(stockDataArray);
        //  stockModel.updateMany({}, [{ $set: { cpInUSD: { $toDouble: "$cpInUSD" } } }])


        if (!data || data.length === 0)
            throw new ErrorResponse("stocks are not inserted properly", 500);

        return res.status(201).json({ success: true, message: "Stocks has been added succesfully " });

    } catch (error) {
        next(error)
    }
}


const getAllStocks = async (req, res, next) => {
    try {
        const { saleStatus, gameName, productName } = req.query;

        // Build dynamic filter object
        const filter = {};
        if (saleStatus) filter.saleStatus = saleStatus;
        if (gameName) filter.gameName = gameName;
        if (productName) filter.productName = productName;

        const stocks = await stockModel.find(filter);


        const sumOfcpInPKR = await stockModel.aggregate([
            { $match: filter }, // Apply filters
            {
                $group: {
                    _id: null,
                    totalCpInPKR: { $sum: "$cpInPKR" }
                }
            }
        ]);


        const sumOfcpInUSD = await stockModel.aggregate([
            { $match: filter }, // Apply filters
            {
                $group: {
                    _id: null,
                    totalCpInUSD: { $sum: "$cpInDollar" }
                    //totalCpInUSD: { $sum: { $ifNull: ["$cpInUSD", 0] } }

                }
            }
        ]);

        //        console.log(sum)

        const data = {
            stocks,
            sumOfcpInPKR: sumOfcpInPKR.length > 0 ? sumOfcpInPKR[0].totalCpInPKR : 0,
            sumOfcpInUSD: sumOfcpInUSD.length > 0 ? sumOfcpInUSD[0].totalCpInUSD : 0
        };


        console.log(sumOfcpInUSD);


        if (!stocks)
            throw new ErrorResponse("stocks are not fetching properly", 500);

        return res.status(200).json({ success: true, message: "All stocks has been fetched succesfully according to gameName and productName with sum ", data });

    } catch (error) {
        next(error)
    }
}

const getStockByID = async (req, res, next) => {
    try {

        const id = req.params.id;

        const stock = await stockModel.findById(id);

        if (!stock)
            throw new ErrorResponse("stocks not found", 404);

        return res.status(200).json({ success: true, message: "stocks has been fetched succesfully by id ", stock });

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
        if (!stock.username?.trim() ||
            !stock.gameName?.trim() ||
            !stock.productName?.trim() ||
            !stock.supplierName?.trim() ||
            !stock.cpInPKR) {
            throw new ErrorResponse("Missing fields in stock object", 400);
        }

        const updatedStock = await stockModel.findByIdAndUpdate(id, stock, { new: true });

        if (!updatedStock)
            throw new ErrorResponse("stock not found", 404);

        return res.status(200).json({ success: true, message: "stocks has been updated succesfully ", updatedStock });

    } catch (error) {
        next(error)
    }
}


const deleteStockById = async (req, res, next) => {
    try {

        const id = req.params.id;

        const deletedStock = await stockModel.findByIdAndDelete(id);

        if (!deletedStock)
            throw new ErrorResponse("stock not found", 404);

        return res.status(200).json({ success: true, message: "stocks has been deleted succesfully ", deletedStock });

    } catch (error) {
        next(error)
    }
}


const addBoxes = async (req, res, next) => {

    try {

        const box = req.body;

        if (!box)
            throw new ErrorResponse("box data is epmty in request body", 400);

        const boxAdded = await boxesModel.create(box);

        return res.status(200).json({ success: true, message: "box has been added", boxAdded });


    } catch (error) {
        next(error)
    }
}


const getBoxes = async (req, res, next) => {
    try {

        const boxes = await boxesModel.find({});

        res.status(200).json({ success: true, message: "boxes has been fetched", boxes });

    } catch (error) {
        next(error);
    }
}


export {
    addStock,
    updateStockById,
    deleteStockById,
    getAllStocks,
    getStockByID,
    addBoxes,
    getBoxes
}