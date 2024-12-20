import express from "express"
import userController from "../controller/userController.js";
import { protect, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router()
router.get("/admin", protect, authorizeRoles("Admin"), userController.getUsers);

export default router;