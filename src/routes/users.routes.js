import { Router } from "express";


const router = Router();

router.route("/", (req, res, next) => {
    return res.json({ message: "up and running" });
})

export { router };