import { Router } from "express";

import { checkAuthentication } from "../middlewares/auth.middleware.js";
import { addSalesRecord, deleteSalesRecordByID, getAllSalesRecord, getSalesRecordByID, updateSalesRecordByID } from "../controllers/salesRecord.controller.js";



const router = Router();


router.route("/").post(checkAuthentication, addSalesRecord);

router.route("/").get(checkAuthentication, getAllSalesRecord);

router.route("/:id").get(checkAuthentication, getSalesRecordByID);

router.route("/:id").put(checkAuthentication, updateSalesRecordByID);

router.route("/:id").delete(checkAuthentication, deleteSalesRecordByID);




export { router };