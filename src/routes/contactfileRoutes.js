import express from 'express'
import contactFileController from "../controller/contactfileController.js";
import {protect, authorizeRoles} from "../middlewares/auth.js"
const router = express.Router();
router.post("/", protect, authorizeRoles("Admin"), contactFileController.createContactFile);
router.get("/", protect, authorizeRoles("Admin"), contactFileController.getAllContactFiles);
router.put("/:id", protect, authorizeRoles("Admin"), contactFileController.updateContactFiles);
router.delete('/:id', protect, authorizeRoles("Admin"), contactFileController.deleteContactFile);
export default router;