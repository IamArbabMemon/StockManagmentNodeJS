import { boxesModel } from "../models/boxes.model.js";
import { faultyAccounts } from "../models/faultyStocks.model.js";
import { stockModel } from "../models/stocks.model.js";
import { getNextSequence } from "../utils/counterIncrement.js";
import { ErrorResponse } from "../utils/errorResponse.js";
import mongoose from "mongoose";
import { reserveAccounts } from "../models/reserve.model.js";
import { salesRecordModel } from "../models/salesRecord.model.js";

const addStock = async (req, res, next) => {
  try {
    const modelName = req.query.modelName;
    const faultyDataArray = req.body;

    console.log("faultyDataArray ", faultyDataArray);
    if (!Array.isArray(faultyDataArray) || faultyDataArray.length === 0) {
      throw new ErrorResponse(
        "Stocks array is required and cannot be empty",
        400
      );
    }

    for (let stock of faultyDataArray) {
      stock.sNo = await getNextSequence("stocks");
    }

    const data = await faultyAccounts.insertMany(faultyDataArray);

    //const insertedData = await faultyAccounts.insertMany(faultyDataArray);

    // Extract the usernames from the inserted documents
    const usernames = faultyDataArray.map((doc) => doc.username || doc.userName);

    console.log("usernames ", data);
    // Delete documents from another collection using these usernames
    let result;
    switch (modelName) {
      case "reserve":
        result = await reserveAccounts.deleteMany({
          username: { $in: usernames },
        });

        break;

      case "stocks":
        result = await stockModel.deleteMany({
          username: { $in: usernames },
        });

        break;

      case "sales":
        result = await salesRecordModel.deleteMany({
          username: { $in: usernames },
        });

        break;

      default:
        throw new ErrorResponse("Unknown model selected")
    }



    console.log(
      `${result.deletedCount} documents deleted from another collection.`
    );

    if (!data || data.length === 0)
      throw new ErrorResponse("stocks are not inserted properly", 500);

    return res
      .status(201)
      .json({
        success: true,
        message: "faulty account has been added succesfully ",
      });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

const getAllStocks = async (req, res, next) => {
  try {
    const { saleStatus, gameName, productName } = req.query;

    // Build dynamic filter object
    const filter = {};
    if (saleStatus) filter.saleStatus = saleStatus;
    if (gameName) filter.gameName = gameName;
    if (productName) filter.productName = productName;

    const faultyData = await faultyAccounts.find(filter);

    const sumOfcpInPKR = await faultyAccounts.aggregate([
      { $match: filter }, // Apply filters
      {
        $group: {
          _id: null,
          totalCpInPKR: { $sum: "$cpInPKR" },
        },
      },
    ]);

    const sumOfcpInUSD = await faultyAccounts.aggregate([
      { $match: filter }, // Apply filters
      {
        $group: {
          _id: null,
          totalCpInUSD: { $sum: "$cpInDollar" },
          //totalCpInUSD: { $sum: { $ifNull: ["$cpInUSD", 0] } }
        },
      },
    ]);

    //        console.log(sumfaultyData

    const data = {
      faultyData,
      sumOfcpInPKR: sumOfcpInPKR.length > 0 ? sumOfcpInPKR[0].totalCpInPKR : 0,
      sumOfcpInUSD: sumOfcpInUSD.length > 0 ? sumOfcpInUSD[0].totalCpInUSD : 0,
    };

    console.log(sumOfcpInUSD);

    if (!faultyData)
      throw new ErrorResponse("stocks are not fetching properly", 500);

    return res
      .status(200)
      .json({
        success: true,
        message:
          "All stocks has been fetched succesfully according to gameName and productName with sum ",
        data,
      });
  } catch (error) {
    next(error);
  }
};

const getStockByID = async (req, res, next) => {
  try {
    const id = req.params.id;

    const stock = await faultyAccounts.findById(id);

    if (!stock) throw new ErrorResponse("stocks not found", 404);

    return res
      .status(200)
      .json({
        success: true,
        message: "stocks has been fetched succesfully by id ",
        stock,
      });
  } catch (error) {
    next(error);
  }
};

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

    const updatedStock = await faultyAccounts.findByIdAndUpdate(id, stock, {
      new: true,
    });

    if (!updatedStock) throw new ErrorResponse("stock not found", 404);

    return res
      .status(200)
      .json({
        success: true,
        message: "stocks has been updated succesfully ",
        updatedStock,
      });
  } catch (error) {
    next(error);
  }
};

const deleteStockById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const deletedStock = await faultyAccounts.findByIdAndDelete(id);

    if (!deletedStock) throw new ErrorResponse("stock not found", 404);

    return res
      .status(200)
      .json({
        success: true,
        message: "stocks has been deleted succesfully ",
        deletedStock,
      });
  } catch (error) {
    next(error);
  }
};

export {
  addStock,
  updateStockById,
  deleteStockById,
  getAllStocks,
  getStockByID,
};
