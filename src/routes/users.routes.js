import { Router } from "express";
import { addUser, deleteUserByID, getUserByID, updateUserByID } from "../controllers/users.controllers.js";

const router = Router();


router.route("/").post(addUser);

router.route("/:id").get(getUserByID);

router.route("/:id").put(updateUserByID);

router.route("/:id").delete(deleteUserByID);


export { router };