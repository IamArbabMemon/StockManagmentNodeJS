import { Router } from "express";
import { getGraphData, getGraphDataOnMonth } from "../controllers/graph.controller.js"
import { checkAuthentication } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/revenue-data",checkAuthentication, getGraphData);
router.get("/revenue-data-on-month", checkAuthentication, getGraphDataOnMonth);

export {
    router
}