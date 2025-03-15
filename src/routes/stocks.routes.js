import { Router } from "express";

import { checkAuthentication } from "../middlewares/auth.middleware.js";
import { addBoxes, addStock, deleteStockById, getAllStocks, getBoxes, getStockByID, updateStockById } from "../controllers/stock.controller.js";

const router = Router();


router.route("/").post(checkAuthentication, addStock);

router.route("/").get(checkAuthentication, getAllStocks);


router.route("/:id").get(checkAuthentication, getStockByID);

router.route("/:id").put(checkAuthentication, updateStockById);

router.route("/:id").delete(checkAuthentication, deleteStockById);

// routes for boxes
router.get("/boxes", checkAuthentication, getBoxes);

router.post("/boxes", checkAuthentication, addBoxes);



export { router };