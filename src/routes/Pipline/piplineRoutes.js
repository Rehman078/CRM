import express from "express"
import {protect, authorizeRoles} from "../../middlewares/auth.js"
import piplineController from "../../controller/Pipline/piplineController.js";
const router = express.Router();

router.post("/", protect, authorizeRoles("Admin", "Manager"), piplineController.createPipline);
router.get("/", protect, authorizeRoles("Admin", "Manager"), piplineController.getAllPipline);
router.put("/:id",protect, authorizeRoles("Admin", "Manager"), piplineController.updatePipline);
router.delete("/:id", protect, authorizeRoles("Admin", "Manager"), piplineController.deletePipline)

export default router