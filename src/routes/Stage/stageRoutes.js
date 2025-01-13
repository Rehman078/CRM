import express from "express"
import stageController from "../../controller/Stage/stageController.js";
import {protect, authorizeRoles} from "../../middlewares/auth.js"
const router = express.Router();

router.post("/", protect, authorizeRoles("Admin", "Manager"), stageController.createStage);
router.get("/", protect, authorizeRoles("Admin", "Manager"), stageController.getStage);
 router.put("/:id",protect, authorizeRoles("Admin", "Manager"), stageController.updateStage);
 router.delete("/:id", protect, authorizeRoles("Admin", "Manager"), stageController.deleteStage)

export default router