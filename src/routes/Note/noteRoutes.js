import express from "express";
import {protect, authorizeRoles} from "../../middlewares/auth.js"
import noteController from "../../controller/Note/noteController.js"

const router = express.Router();


router.post("/", protect, authorizeRoles("Admin", "SalesRep", "Manager"), noteController.createNote);
router.get("/", protect, authorizeRoles("Admin", "SalesRep", "Manager"), noteController.getNotes);
router.put("/:id", protect, authorizeRoles("Admin", "SalesRep", "Manager"), noteController.updateNote);
router.delete("/:id", protect, authorizeRoles("Admin", "SalesRep", "Manager"), noteController.deleteNote);

export default router;