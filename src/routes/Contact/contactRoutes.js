import express from "express";
import contactController from "../../controller/Contact/contactController.js"
import { protect, authorizeRoles } from "../../middlewares/auth.js";
const router = express.Router();

router.post("/",  protect, authorizeRoles("Admin", "SalesRep", "Manager"), contactController.createContact);
router.get("/",  protect, authorizeRoles("Admin", "Manager", "SalesRep"), contactController.getAllContacts);
router.get("/:id",  protect, authorizeRoles("Admin", "Manager", "SalesRep"), contactController.getContactById);
router.put("/:id",  protect, authorizeRoles("Admin", "SalesRep", "Manager"), contactController.updateContact);
router.delete("/:id", protect, authorizeRoles("Admin", "SalesRep", "Manager"), contactController.deleteContact);
router.patch("/assign/:id",  protect, authorizeRoles("Admin" , "Manager"), contactController.assignContact);
export default router;
