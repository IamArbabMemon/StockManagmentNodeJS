import { salesRecordModel } from "../models/salesRecord.model.js";
import mongoose from 'mongoose';
import { ErrorResponse } from "../utils/errorResponse.js";
import { stockModel } from "../models/stocks.model.js";
import { reserveAccounts } from "../models/reserve.model.js";
import { faultyAccounts } from "../models/faultyStocks.model.js";

const addSalesRecord = async (req, res, next) => {
    try {
        const modelName = req.query.modelName;
        const salesRecordArray = req.body;

        if (!Array.isArray(salesRecordArray) || salesRecordArray.length === 0) {
            throw new ErrorResponse("Stocks array is required and cannot be empty", 400);
        }

        // logic to check if the orderId already exists in the salesRecordModel

        // const orderIds = salesRecordArray.map((saleRecord) => saleRecord.orderId);

        // const isAnyOrderIdExist = await salesRecordModel.findOne({
        //     orderId: { $in: orderIds }
        //   });

        //   if (isAnyOrderIdExist) {
        //     throw new ErrorResponse(`${isAnyOrderIdExist?.orderId} this order id already exists:`, 400);
        //   }



        for (let saleRecord of salesRecordArray) {
            const { saleDate, username, sellPrice, recievedAmount, orderId, site } = saleRecord;

            // if (!username || !saleDate || !sellPrice || !recievedAmount || !orderId || !site) {
            //     throw new ErrorResponse("All sales entries must have username, saleDate, salePrice, recievedAmount, orderId and site", 400);
            // }

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

       // await stockModel.updateMany({ username: { $in: usernamesToBeUpdated } }, { saleStatus: "sold" });
       await stockModel.deleteMany({
        username: { $in: usernames },
    });

        return res.status(201).json({ success: true, message: "sales has been added succesfully " });

    } catch (error) {
        next(error)
    }
}



const getAllSalesRecord = async (req, res, next) => {
    try {

        const { status } = req.query;
        let salesRecords;

        if (status) {
            salesRecords = await salesRecordModel.find({
                status: status
            });

        } else {
            salesRecords = await salesRecordModel.find({
                $or: [
                    { status: "approved" },
                    { status: "refunded" }
                ]
            });
        }

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
        console.log(req.body);

        const salesRecord = req.body;
        console.log("req params ", id);
        let updatedSalesRecord;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ErrorResponse("Invalid salesRecord ID", 400);
        }

        // Validate required fields
        // if (!salesRecord.username?.trim() ||
        //     !salesRecord.orderId?.trim() ||
        //     !salesRecord.sellPrice ||
        //     !salesRecord.recievedAmount ||
        //     !salesRecord.site?.trim() ||
        //     !salesRecord.saleDate) {
        //     throw new ErrorResponse("Missing fields in salesRecord object", 400);
        // }

        const getRecord = await salesRecordModel.findById(id);
        if (!getRecord)
            throw new ErrorResponse("salesRecord not found", 404);

        if (salesRecord.status === "rejected") {
            delete salesRecord.id;
            await faultyAccounts.create({ ...salesRecord, reason: "reason required" });
            await salesRecordModel.findByIdAndDelete(id);
        } else {
            updatedSalesRecord = await salesRecordModel.findByIdAndUpdate(id, salesRecord, { new: true });
            if (!updatedSalesRecord)
                throw new ErrorResponse("salesRecord not found", 404);
        }



        return res.status(200).json({ success: true, message: "salesRecord has been updated succesfully ", updatedSalesRecord });

    } catch (error) {
        console.log(error.message)
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
        const { username, rowId,reason } = req.body;

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
        delete newAccountData.saleStatus;// Remove saleStatus since it's specific to stockModel


        const previusAccountToBeSend = { ...previousAccount.toObject(), reason: reason};
        delete previusAccountToBeSend._id;
        const faultyAdded = await faultyAccounts.create(
            previusAccountToBeSend // Use toObject() to get a plain JS object
        );

        if (!faultyAdded)
            throw new ErrorResponse("Failed to add to faulty accounts", 500);

        console.log("faulty added ", faultyAdded);

       
        // Mark the stock as sold
        await stockModel.updateOne(
            { _id: newAccountFromAvailableStocks._id },
            { $set: { saleStatus: "sold" } }
        );


        await salesRecordModel.deleteOne({ _id: rowId });

        //newAccountFromAvailableStocks.status = "sold"; // Update the saleStatus in the new account object
        console.log("order ID from prevoius ============ ",previousAccount.orderId)
        const newAccountTobeAddedInSalesRecordAgain = { ...newAccountFromAvailableStocks.toObject(), orderId:previousAccount.orderId,saleDate: previousAccount.saleDate,status:'approved' , site: previousAccount.site, recievedAmount: previousAccount.recievedAmount, sellPrice: previousAccount.sellPrice };
       
        console.log(newAccountTobeAddedInSalesRecordAgain);

        await salesRecordModel.create(newAccountTobeAddedInSalesRecordAgain);
        return res.status(200).json({
            success: true,
            message: "salesRecord has been replaced successfully",
            newAccountFromAvailableStocks,
            previousAccount
        });

    } catch (error) {
        console.log(error.message)
        next(error);
    }
}


const refundAccount = async(req, res, next) => {
    try{

        const data = req.body;

        const faultyEntry = await faultyAccounts.create(data);
        if(!faultyEntry)
            throw new ErrorResponse("Failed to add to faulty accounts", 500);

        await salesRecordModel.updateOne(
            {_id:data?._id},
            { $set: { status: "refunded" }
        });
        return res.status(200).json({
            success: true,
            message: "Account has been refunded successfully",
            faultyEntry
        });


    }catch(error){
        console.log(error.message)
        next(error)
    }
}    

export {
    getAllSalesRecord,
    addSalesRecord,
    updateSalesRecordByID,
    getSalesRecordByID,
    deleteSalesRecordByID,
    replaceAccounts,
    refundAccount
}
