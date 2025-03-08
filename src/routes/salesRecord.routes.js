import { Router } from "express";

import { checkAuthentication, CheckRequestIsFromAdmin } from "../middlewares/auth.middleware.js";
import { addSalesRecord, deleteSalesRecordByID, getAllSalesRecord, getSalesRecordByID, updateSalesRecordByID } from "../controllers/salesRecord.controller.js";



const router = Router();


router.route("/").post(checkAuthentication, CheckRequestIsFromAdmin, addSalesRecord);

router.route("/").get(checkAuthentication, CheckRequestIsFromAdmin, getAllSalesRecord);

router.route("/:id").get(checkAuthentication, CheckRequestIsFromAdmin, getSalesRecordByID);

router.route("/:id").put(checkAuthentication, CheckRequestIsFromAdmin, updateSalesRecordByID);

router.route("/:id").delete(checkAuthentication, CheckRequestIsFromAdmin, deleteSalesRecordByID);




export { router };