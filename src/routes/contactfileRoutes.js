import express from 'express'
import contactFileController from "../controller/contactfileController.js";
const router = express.Router();
router.get('/contacts/:contactId/files', contactFileController.getContactFileById);
export default router;