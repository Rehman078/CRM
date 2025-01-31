import express from "express";
import userController from "../controller/userController.js";
import { protect, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get('/users', protect, authorizeRoles("Admin", "Manager"), userController.getUsers);

export default router;