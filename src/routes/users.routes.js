import { Router } from "express";
import { addUser, deleteUserByID, getAllUsers, getUserByID, updateUserByID } from "../controllers/users.controllers.js";
import { checkAuthentication } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/").post(addUser);

router.route("/").get(checkAuthentication, getAllUsers);

router.route("/:id").get(checkAuthentication, getUserByID);

router.route("/:id").put(checkAuthentication, updateUserByID);

router.route("/:id").delete(checkAuthentication, deleteUserByID);




export { router };