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

        if (!data || data.length === 0)
            throw new ErrorResponse("stocks are not inserted properly", 500);

        return res.status(201).json({ success: true, message: "Stocks has been added succesfully " });

    } catch (error) {
        next(error)
    }
}


const getAllStocks = async (req, res, next) => {
    try {
        const saleStatus = req.query;
        const stocks = await stockModel.find({ saleStatus });

        if (!stocks)
            throw new ErrorResponse("stocks are not fetching properly", 500);

        return res.status(200).json({ success: true, message: "All stocks has been fetched succesfully ", stocks });

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

export {
    addStock,
    updateStockById,
    deleteStockById,
    getAllStocks,
    getStockByID
}