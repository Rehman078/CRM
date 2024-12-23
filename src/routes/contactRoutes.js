import express from "express";
import contactController from "../controller/contactController.js"
import { protect, authorizeRoles } from "../middlewares/auth.js";
const router = express.Router();


router.post("/",  protect, authorizeRoles("Admin"), contactController.createContact);
router.get("/",  protect, authorizeRoles("Admin"), contactController.getAllContacts);
router.put("/:id",  protect, authorizeRoles("Admin"), contactController.updateContact);
router.delete("/:id", protect, authorizeRoles("Admin"), contactController.deleteContact);

export default router;
