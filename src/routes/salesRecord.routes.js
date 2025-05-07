import { Router } from "express";

import { checkAuthentication, CheckRequestIsFromAdmin } from "../middlewares/auth.middleware.js";
import { addSalesRecord, deleteSalesRecordByID, getAllSalesRecord, getSalesRecordByID, updateSalesRecordByID ,replaceAccounts, refundAccount} from "../controllers/salesRecord.controller.js";



const router = Router();


router.route("/refund").post(checkAuthentication, refundAccount);

router.route("/").post(checkAuthentication, addSalesRecord);

router.route("/").get(checkAuthentication, getAllSalesRecord);

router.route("/:id").get(checkAuthentication, getSalesRecordByID);

router.route("/:id").put(checkAuthentication, updateSalesRecordByID);

router.route("/:id").delete(checkAuthentication, deleteSalesRecordByID);

router.route("/replace").post(checkAuthentication, replaceAccounts);




export { router };