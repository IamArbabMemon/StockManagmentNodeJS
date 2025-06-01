import { Router } from "express";
import { getGraphData } from "../controllers/graph.controller.js"
import { checkAuthentication } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/revenue-data",checkAuthentication, getGraphData);

export {
    router
}