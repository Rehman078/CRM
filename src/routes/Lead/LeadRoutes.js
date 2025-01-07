import express from "express";
import leadController from "../../controller/Lead/leadController.js"
import { protect, authorizeRoles } from "../../middlewares/auth.js";

const router = express.Router();

router.post("/",  protect, authorizeRoles("Admin", "SalesRep", "Manager"), leadController.createLead);
router.get("/",  protect, authorizeRoles("Admin", "SalesRep", "Manager"), leadController.getLeads);
router.get("/:id",  protect, authorizeRoles("Admin", "SalesRep", "Manager"), leadController.getLeadById);
router.put("/:id",  protect, authorizeRoles("Admin", "SalesRep", "Manager"), leadController.updateLead);
router.delete("/:id",  protect, authorizeRoles("Admin","SalesRep", "Manager"), leadController.deleteLead);    

router.patch("/assign/:id",  protect, authorizeRoles("Admin" , "Manager"), leadController.assignLead);
router.patch("/status/:id",  protect, authorizeRoles("Admin", "SalesRep", "Manager"), leadController.updateStatus);

export default router;