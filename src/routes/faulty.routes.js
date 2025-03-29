import { Router } from "express";

import { checkAuthentication } from "../middlewares/auth.middleware.js";
import { addStock, deleteStockById, getAllStocks, getStockByID, updateStockById } from "../controllers/faulty.controller.js";

const router = Router();

router.route("/").post(checkAuthentication, addStock);

router.route("/").get(checkAuthentication, getAllStocks);


router.route("/:id").get(checkAuthentication, getStockByID);

router.route("/:id").put(checkAuthentication, updateStockById);

router.route("/:id").delete(checkAuthentication, deleteStockById);


export { router };