import express from "express"
import {protect, authorizeRoles} from "../../middlewares/auth.js"
import opportunityController from "../../controller/Opportunity/opportunityController.js";
const router = express.Router();

router.get("/opportunity", protect, authorizeRoles("Admin", "Manager"), opportunityController.getOpportunityByPipelineId);
router.get("/details", protect, authorizeRoles("Admin", "SalesRep", "Manager"), opportunityController.getOpportunityByParmsId); 
router.post("/", protect, authorizeRoles("Admin", "SalesRep", "Manager"), opportunityController.createOpportunity);
router.get("/", protect, authorizeRoles("Admin", "Manager"), opportunityController.getOpportunity);
router.put("/:id", protect, authorizeRoles("Admin", "SalesRep", "Manager"), opportunityController.updateOpportunity)
router.patch("/update/stage/", protect, authorizeRoles("Admin", "SalesRep", "Manager"), opportunityController.updateOpportunityStage)
router.delete("/:id", protect, authorizeRoles("Admin", "SalesRep", "Manager"), opportunityController.deleteOpportunity);




export default router