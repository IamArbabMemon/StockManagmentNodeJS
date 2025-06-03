import { reserveAccounts } from "../models/reserve.model.js";
import { boxesModel } from "../models/boxes.model.js";
import { stockModel } from "../models/stocks.model.js";
import { faultyAccounts } from "../models/faultyStocks.model.js"
import { getNextSequence } from "../utils/counterIncrement.js";
import { ErrorResponse } from "../utils/errorResponse.js";
import mongoose from "mongoose";
import { closingAccounts } from "../models/closing.model.js";


const addStock = async (req, res, next) => {
    try {

        const model = req.query.modelName;
        const stockDataArray = req.body;
        console.log("stock data ", stockDataArray);

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
        
        if(model === "faulty") {
            const usernames = stockDataArray.map((doc) => doc.username || doc.userName);
            console.log("usernames ", usernames);
            // Delete documents from another collection using these usernames
            const result = await faultyAccounts.deleteMany({
                username: { $in: usernames },
            });
        }



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

        if (!stocks)
            throw new ErrorResponse("stocks are not fetching properly", 500);

        // if (stocks.length === 0) {
        //     return res.status(200).json({ success: true, message: "Stocks table has no data " });
        // }

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

        // const faultyCount = await faultyAccounts.aggregate([
        //     {
        //         $match: { filter, faultyStatus: true }
        //     },
        //     { $count: "faultyCount" }
        // ]);
        const faultyCount = await faultyAccounts.aggregate([
            {
                $match: { ...filter, faultyStatus: true }
            },
            { $count: "faultyCount" }
        ]);

        console.log("raw faulty count ", faultyCount)

        //        console.log(sum)

        const result = await reserveAccounts.aggregate([
            {
                $match: {
                    gameName: gameName,
                    productName: productName
                }
            },
            {
                $group: {
                    _id: "$website",
                    count: { $sum: 1 } // Count the number of matching documents per website
                }
            },
            {
                $sort: { count: -1 } // Sort by count in descending order (optional)
            }
        ]);

        console.log("web: ", result);

        const sumOfFaultycpInPKR = await faultyAccounts.aggregate([
            { $match: filter }, // Apply filters
            {
                $group: {
                    _id: null,
                    totalCpInPKR: { $sum: "$cpInPKR" },
                },
            },
        ]);

        const sumOfFaultycpInUSD = await faultyAccounts.aggregate([
            { $match: filter }, // Apply filters
            {
                $group: {
                    _id: null,
                    totalCpInUSD: { $sum: "$cpInDollar" },
                    //totalCpInUSD: { $sum: { $ifNull: ["$cpInUSD", 0] } }
                },
            },
        ]);

        const totalOfReserved = await reserveAccounts.countDocuments(filter);
        const totalStock = totalOfReserved + stocks.length;


        const data = {
            stocks,
            sumOfcpInPKR: sumOfcpInPKR.length > 0 ? sumOfcpInPKR[0].totalCpInPKR : 0,
            sumOfcpInUSD: sumOfcpInUSD.length > 0 ? sumOfcpInUSD[0].totalCpInUSD : 0,
            faultyCount: faultyCount.length > 0 ? faultyCount[0].faultyCount : 0,
            sumOfFaultycpInPKR: sumOfFaultycpInPKR.length > 0 ? sumOfFaultycpInPKR[0].totalCpInPKR : 0,
            sumOfFaultycpInUSD: sumOfFaultycpInUSD.length > 0 ? sumOfFaultycpInUSD[0].totalCpInUSD : 0,
            websiteCount: result,
            totalStock
        };

        console.log(result)
        console.log("faulty count from data ", data.faultyCount);


        return res.status(200).json({ success: true, message: "All stocks has been fetched succesfully according to gameName and productName with sum ", data });

    } catch (error) {
        console.log(error);
        next(error)

    }
}

const getBoxDataForSheet = async (req, res, next) => {
    try {
       // const stocks = await stockModel.find({});
        const gameProductCombos = await stockModel.distinct("gameName");

        const resultData = [];

        for (const gameName of gameProductCombos) {
            const productNames = await stockModel.distinct("productName", { gameName });

            for (const productName of productNames) {
                const filter = { gameName, productName };

                const stocks = await stockModel.find(filter);

                const sumOfcpInPKR = await stockModel.aggregate([
                    { $match: filter },
                    {
                        $group: {
                            _id: null,
                            totalCpInPKR: { $sum: "$cpInPKR" }
                        }
                    }
                ]);

                const sumOfcpInUSD = await stockModel.aggregate([
                    { $match: filter },
                    {
                        $group: {
                            _id: null,
                            totalCpInUSD: { $sum: "$cpInDollar" }
                        }
                    }
                ]);

                const faultyCount = await faultyAccounts.aggregate([
                    {
                        $match: { ...filter, faultyStatus: true }
                    },
                    { $count: "faultyCount" }
                ]);

                const sumOfFaultycpInPKR = await faultyAccounts.aggregate([
                    { $match: filter },
                    {
                        $group: {
                            _id: null,
                            totalCpInPKR: { $sum: "$cpInPKR" },
                        },
                    },
                ]);

                const sumOfFaultycpInUSD = await faultyAccounts.aggregate([
                    { $match: filter },
                    {
                        $group: {
                            _id: null,
                            totalCpInUSD: { $sum: "$cpInDollar" },
                        },
                    },
                ]);

                const websiteCount = await reserveAccounts.aggregate([
                    { $match: filter },
                    {
                        $group: {
                            _id: "$website",
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { count: -1 } }
                ]);

                const totalOfReserved = await reserveAccounts.countDocuments(filter);
                const totalStock = totalOfReserved + stocks.length;
                const avaliableStocks =  stocks.length;

                resultData.push({
                    gameName,
                    productName,
                    avaliableStocks,
                    sumOfcpInPKR: sumOfcpInPKR.length > 0 ? sumOfcpInPKR[0].totalCpInPKR : 0,
                    sumOfcpInUSD: sumOfcpInUSD.length > 0 ? sumOfcpInUSD[0].totalCpInUSD : 0,
                    faultyCount: faultyCount.length > 0 ? faultyCount[0].faultyCount : 0,
                    sumOfFaultycpInPKR: sumOfFaultycpInPKR.length > 0 ? sumOfFaultycpInPKR[0].totalCpInPKR : 0,
                    sumOfFaultycpInUSD: sumOfFaultycpInUSD.length > 0 ? sumOfFaultycpInUSD[0].totalCpInUSD : 0,
                    websiteCount,
                    totalStock
                });
            }
        }

        if (resultData.length === 0) {
            throw new ErrorResponse("No box data found to generate report.",404);
        }


        // Group by gameName
        const groupedResult = {};
        for (const item of resultData) {
            const { gameName } = item;
            if (!groupedResult[gameName]) {
                groupedResult[gameName] = [];
            }
            groupedResult[gameName].push(item);
        }

        const finalData = Object.values(groupedResult);

        
        return res.status(200).json({
            success: true,
            message: "Grouped stocks fetched successfully",
            data: finalData
        });

    } catch (error) {
        console.log(error);
        next(error);
    }   
};


// const getSupplierTotalData = async (req, res, next) => {
//     try {
//         // Step 1: Get all distinct supplier names from all collections
//         const [stockSuppliers, faultySuppliers, reserveSuppliers] = await Promise.all([
//             stockModel.distinct("supplierName"),
//             faultyAccounts.distinct("supplierName"),
//             reserveAccounts.distinct("supplierName"),
//         ]);

//         const supplierNamesSet = new Set([
//             ...stockSuppliers,
//             ...faultySuppliers,
//             ...reserveSuppliers,
//         ]);
//         const supplierNames = Array.from(supplierNamesSet);

//         const resultData = [];

//         // Step 2: Loop through all suppliers
//         for (const supplierName of supplierNames) {
//             const [gameNamesFromStock, gameNamesFromFaulty, gameNamesFromReserve] = await Promise.all([
//                 stockModel.distinct("gameName", { supplierName }),
//                 faultyAccounts.distinct("gameName", { supplierName }),
//                 reserveAccounts.distinct("gameName", { supplierName }),
//             ]);

//             const gameNamesSet = new Set([
//                 ...gameNamesFromStock,
//                 ...gameNamesFromFaulty,
//                 ...gameNamesFromReserve,
//             ]);
//             const gameNames = Array.from(gameNamesSet);

//             // Step 3: Loop through all games
//             for (const gameName of gameNames) {
//                 const [productNamesFromStock, productNamesFromFaulty, productNamesFromReserve] = await Promise.all([
//                     stockModel.distinct("productName", { supplierName, gameName }),
//                     faultyAccounts.distinct("productName", { supplierName, gameName }),
//                     reserveAccounts.distinct("productName", { supplierName, gameName }),
//                 ]);

//                 const productNamesSet = new Set([
//                     ...productNamesFromStock,
//                     ...productNamesFromFaulty,
//                     ...productNamesFromReserve,
//                 ]);
//                 const productNames = Array.from(productNamesSet);

//                 // Step 4: Loop through all products
//                 for (const productName of productNames) {
//                     const filter = { supplierName, gameName, productName };
//                     const faultyFilter = { ...filter, faultyStatus: true };

//                     const [
//                         avaliableStocks,
//                         stockCpInPKR,
//                         stockCpInUSD,
//                         faultyCountResult,
//                         faultyCpInPKR,
//                         faultyCpInUSD,
//                         totalOfReserved,
//                         reserveCpInPKR,
//                         reserveCpInUSD
//                     ] = await Promise.all([
//                         stockModel.countDocuments(filter),

//                         stockModel.aggregate([
//                             { $match: filter },
//                             { $group: { _id: null, total: { $sum: "$cpInPKR" } } },
//                         ]),

//                         stockModel.aggregate([
//                             { $match: filter },
//                             { $group: { _id: null, total: { $sum: "$cpInDollar" } } },
//                         ]),

//                         faultyAccounts.aggregate([
//                             { $match: faultyFilter },
//                             { $count: "faultyCount" },
//                         ]),

//                         faultyAccounts.aggregate([
//                             { $match: faultyFilter },
//                             { $group: { _id: null, total: { $sum: "$cpInPKR" } } },
//                         ]),

//                         faultyAccounts.aggregate([
//                             { $match: faultyFilter },
//                             { $group: { _id: null, total: { $sum: "$cpInDollar" } } },
//                         ]),

//                         reserveAccounts.countDocuments(filter),

//                         reserveAccounts.aggregate([
//                             { $match: filter },
//                             { $group: { _id: null, total: { $sum: "$cpInPKR" } } },
//                         ]),

//                         reserveAccounts.aggregate([
//                             { $match: filter },
//                             { $group: { _id: null, total: { $sum: "$cpInDollar" } } },
//                         ]),
//                     ]);

//                     const totalCpInPKR = (stockCpInPKR[0]?.total || 0) + (reserveCpInPKR[0]?.total || 0);
//                     const totalCpInUSD = (stockCpInUSD[0]?.total || 0) + (reserveCpInUSD[0]?.total || 0);
//                     const totalStock = totalOfReserved + avaliableStocks;

//                     resultData.push({
//                         supplierName,
//                         gameName,
//                         productName,
//                         avaliableStocks,
//                         sumOfcpInPKR: totalCpInPKR,
//                         sumOfcpInUSD: totalCpInUSD,
//                         faultyCount: faultyCountResult[0]?.faultyCount || 0,
//                         sumOfFaultycpInPKR: faultyCpInPKR[0]?.total || 0,
//                         sumOfFaultycpInUSD: faultyCpInUSD[0]?.total || 0,
//                         totalStock,
//                     });
//                 }
//             }
//         }

//         if (resultData.length === 0) {
//             throw new ErrorResponse("No data found", 404);
//         }

//         // Step 5: Group by supplierName > gameName
//         const groupedResult = {};
//         for (const item of resultData) {
//             const { supplierName, gameName } = item;
//             if (!groupedResult[supplierName]) {
//                 groupedResult[supplierName] = {};
//             }
//             if (!groupedResult[supplierName][gameName]) {
//                 groupedResult[supplierName][gameName] = [];
//             }
//             groupedResult[supplierName][gameName].push(item);
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Grouped stocks fetched successfully",
//             data: groupedResult,
//         });

//     } catch (error) {
//         console.error(error);
//         next(error);
//     }
// };

const getSupplierTotalData = async (req, res, next) => {
    try {
        // Step 1: Get all data in bulk to minimize database queries
        const [allStockData, allFaultyData, allReserveData] = await Promise.all([
            stockModel.find().lean(),
            faultyAccounts.find().lean(),
            reserveAccounts.find().lean(),
        ]);

        // Step 2: Create a map structure to organize the data
        const supplierMap = new Map();

        // Process stock data
        for (const item of allStockData) {
            const { supplierName, gameName, productName, cpInPKR, cpInDollar } = item;
            
            if (!supplierMap.has(supplierName)) {
                supplierMap.set(supplierName, new Map());
            }
            
            const gameMap = supplierMap.get(supplierName);
            if (!gameMap.has(gameName)) {
                gameMap.set(gameName, new Map());
            }
            
            const productMap = gameMap.get(gameName);
            if (!productMap.has(productName)) {
                productMap.set(productName, {
                    avaliableStocks: 0,
                    stockCpInPKR: 0,
                    stockCpInUSD: 0,
                    faultyCount: 0,
                    faultyCpInPKR: 0,
                    faultyCpInUSD: 0,
                    totalOfReserved: 0,
                    reserveCpInPKR: 0,
                    reserveCpInUSD: 0
                });
            }
            
            const productData = productMap.get(productName);
            productData.avaliableStocks += 1;
            productData.stockCpInPKR += cpInPKR || 0;
            productData.stockCpInUSD += cpInDollar || 0;
        }

        // Process faulty data
        for (const item of allFaultyData) {
            if (!item.faultyStatus) continue;
            
            const { supplierName, gameName, productName, cpInPKR, cpInDollar } = item;
            
            if (!supplierMap.has(supplierName)) {
                supplierMap.set(supplierName, new Map());
            }
            
            const gameMap = supplierMap.get(supplierName);
            if (!gameMap.has(gameName)) {
                gameMap.set(gameName, new Map());
            }
            
            const productMap = gameMap.get(gameName);
            if (!productMap.has(productName)) {
                productMap.set(productName, {
                    avaliableStocks: 0,
                    stockCpInPKR: 0,
                    stockCpInUSD: 0,
                    faultyCount: 0,
                    faultyCpInPKR: 0,
                    faultyCpInUSD: 0,
                    totalOfReserved: 0,
                    reserveCpInPKR: 0,
                    reserveCpInUSD: 0
                });
            }
            
            const productData = productMap.get(productName);
            productData.faultyCount += 1;
            productData.faultyCpInPKR += cpInPKR || 0;
            productData.faultyCpInUSD += cpInDollar || 0;
        }

        // Process reserve data
        for (const item of allReserveData) {
            const { supplierName, gameName, productName, cpInPKR, cpInDollar } = item;
            
            if (!supplierMap.has(supplierName)) {
                supplierMap.set(supplierName, new Map());
            }
            
            const gameMap = supplierMap.get(supplierName);
            if (!gameMap.has(gameName)) {
                gameMap.set(gameName, new Map());
            }
            
            const productMap = gameMap.get(gameName);
            if (!productMap.has(productName)) {
                productMap.set(productName, {
                    avaliableStocks: 0,
                    stockCpInPKR: 0,
                    stockCpInUSD: 0,
                    faultyCount: 0,
                    faultyCpInPKR: 0,
                    faultyCpInUSD: 0,
                    totalOfReserved: 0,
                    reserveCpInPKR: 0,
                    reserveCpInUSD: 0
                });
            }
            
            const productData = productMap.get(productName);
            productData.totalOfReserved += 1;
            productData.reserveCpInPKR += cpInPKR || 0;
            productData.reserveCpInUSD += cpInDollar || 0;
        }

        // Convert the map structure to the desired output format
        const groupedResult = {};
        
        for (const [supplierName, gameMap] of supplierMap) {
            groupedResult[supplierName] = {};
            
            for (const [gameName, productMap] of gameMap) {
                groupedResult[supplierName][gameName] = [];
                
                for (const [productName, productData] of productMap) {
                    const totalCpInPKR = productData.stockCpInPKR + productData.reserveCpInPKR;
                    const totalCpInUSD = productData.stockCpInUSD + productData.reserveCpInUSD;
                    const totalStock = productData.totalOfReserved + productData.avaliableStocks;
                    
                    groupedResult[supplierName][gameName].push({
                        supplierName,
                        gameName,
                        productName,
                        avaliableStocks: productData.avaliableStocks,
                        sumOfcpInPKR: totalCpInPKR,
                        sumOfcpInUSD: totalCpInUSD,
                        faultyCount: productData.faultyCount,
                        sumOfFaultycpInPKR: productData.faultyCpInPKR,
                        sumOfFaultycpInUSD: productData.faultyCpInUSD,
                        totalStock
                    });
                }
            }
        }

        if (Object.keys(groupedResult).length === 0) {
            throw new ErrorResponse("No data found", 404);
        }

        return res.status(200).json({
            success: true,
            message: "Grouped stocks fetched successfully",
            data: groupedResult,
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
};
const getAllStocksDataForExcel = async (req, res, next) => {
    try {
        const { saleStatus, gameName, productName } = req.query;

        // Build dynamic filter object
        const filter = {};
        if (saleStatus) filter.saleStatus = saleStatus;
        if (gameName) filter.gameName = gameName;
        if (productName) filter.productName = productName;

        const stocks = await stockModel.find(filter);
        const reserve = await reserveAccounts.find(filter);
        const faulty = await faultyAccounts.find(filter);
        const closing = await closingAccounts.find(filter);

        

        const data = {
            stocksAccounts:stocks,
            reserveAccounts:reserve,
            faultyAccounts: faulty,
            closingAccounts: closing
        };

        if (!data || (data.stocksAccounts.length === 0 && data.reserveAccounts.length === 0 && data.faultyAccounts.length === 0 && data.closingAccounts.length === 0))
            throw new ErrorResponse("Unable to generate the report. No stock data was found.", 404);


        return res.status(200).json({ success: true, message: "Stocks fetched successfully by game and product name for Excel.", data });

    } catch (error) {
        console.log(error);
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
        let boxAdded ;
        const box = req.body;
        console.log("box data ", box);
        
        
        
        if (!box)
            throw new ErrorResponse("box data is epmty in request body", 400);


        const boxFound = await boxesModel.findOne({
            gameName: box.gameName,
            productName: box.productName,
        });

        console.log(boxFound);


        if (boxFound)
            throw new ErrorResponse("A box with this game name and product name already exists.", 400);
      
    //     if (boxFound.gameName.toLowerCase() === box.gameName.toLowerCase() || boxFound.productName.toLowerCase() === box.productName.toLowerCase()) {
    //  
        
    // }
    // }else{
    //     
    // }
    boxAdded = await boxesModel.create(box);

        return res.status(200).json({ success: true, message: "box has been added", boxAdded });


    } catch (error) {
        console.log("error in adding box ", error);
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

const deleteBox = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ErrorResponse("Box ID is required in request parameters", 400);
        }

        const deletedBox = await boxesModel.findByIdAndDelete(id);

        if (!deletedBox) {
            throw new ErrorResponse("Box not found with the provided ID", 404);
        }

        return res.status(200).json({ 
            success: true, 
            message: "Box has been deleted successfully", 
            deletedBox 
        });

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
    getBoxes, 
    deleteBox,
    getAllStocksDataForExcel,
    getBoxDataForSheet,
    getSupplierTotalData
}