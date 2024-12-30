import express from "express";
import contactController from "../controller/contactController.js"
import { protect, authorizeRoles } from "../middlewares/auth.js";
const router = express.Router();


router.post("/",  protect, authorizeRoles("Admin", "Manager", "SalesRep"), contactController.createContact);
router.get("/",  protect, authorizeRoles("Admin", "Manager", "SalesRep"), contactController.getAllContacts);
router.put("/:id",  protect, authorizeRoles("Admin", "Manager", "SalesRep"), contactController.updateContact);
router.delete("/:id", protect, authorizeRoles("Admin", "Manager", "SalesRep"), contactController.deleteContact);

export default router;
