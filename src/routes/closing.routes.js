import { Router } from "express";

import { checkAuthentication } from "../middlewares/auth.middleware.js";
import { addClosingAccounts, getAllClosingAccounts } from "../controllers/closing.controller.js";

const router = Router();


router.route("/").post(checkAuthentication, addClosingAccounts);

router.route("/").get( checkAuthentication,getAllClosingAccounts);







export { router };