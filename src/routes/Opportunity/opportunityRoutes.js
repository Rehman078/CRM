import express from "express"
import {protect, authorizeRoles} from "../../middlewares/auth.js"
import opportunityController from "../../controller/Opportunity/opportunityController.js";
const router = express.Router();

router.post("/", protect, authorizeRoles("Admin", "SalesRep", "Manager"), opportunityController.createOpportunity);
router.get("/", protect, authorizeRoles("Admin", "SalesRep", "Manager"), opportunityController.getOpportunity);
router.get("/details", protect, authorizeRoles("Admin", "SalesRep", "Manager"), opportunityController.getOpportunityById); // Fetch by query param
router.put("/:id", protect, authorizeRoles("Admin", "SalesRep", "Manager"), opportunityController.updateOpportunity)
router.delete("/:id", protect, authorizeRoles("Admin", "SalesRep", "Manager"), opportunityController.deleteOpportunity);


export default router