// routes/extraDetails.routes.js
import express from "express";
import {
    addDetails,
    getAllDetails,
    getDetailById,
    updateDetail,
    deleteDetail
} from "../controllers/extraDetails.controller.js";

const router = express.Router();

router.post("/", addDetails);
router.get("/", getAllDetails);
router.get("/:id", getDetailById);
router.put("/:id", updateDetail);
router.delete("/:id", deleteDetail);

export {router};
