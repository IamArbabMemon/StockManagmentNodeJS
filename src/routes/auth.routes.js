import { Router } from "express";
import { login } from "../controllers/auth.controller.js";


const router = Router();

router.route("/login").post(login);

export {
    router
}