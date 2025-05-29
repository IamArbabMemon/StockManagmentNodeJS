import { Router } from "express";

import { checkAuthentication } from "../middlewares/auth.middleware.js";
import { addBoxes, addStock, deleteStockById, getAllStocks, getBoxes, getStockByID, updateStockById, deleteBox, getAllStocksDataForExcel, getBoxDataForSheet, getSupplierTotalData } from "../controllers/stock.controller.js";

const router = Router();
router.route("/getBoxSheetData").get( checkAuthentication,getBoxDataForSheet);

router.get("/boxes",checkAuthentication,getBoxes);

router.get("/supplier/data", checkAuthentication, getSupplierTotalData);

router.route("/").post(checkAuthentication, addStock);

router.route("/").get( checkAuthentication,getAllStocks);

router.get("/excelSheetData", checkAuthentication, getAllStocksDataForExcel);

router.route("/:id").get(checkAuthentication, getStockByID);

router.route("/:id").put(checkAuthentication, updateStockById);

router.route("/:id").delete(checkAuthentication, deleteStockById);

// routes for boxes

router.post("/boxes", checkAuthentication, addBoxes);

router.delete("/boxes/:id", checkAuthentication, deleteBox);


export { router };