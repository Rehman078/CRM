import express from 'express';
import upload from '../middlewares/multer.js';
import fileController from '../controller/fileController.js';
import {protect, authorizeRoles} from '../middlewares/auth.js'

const router = express.Router();
router.post('/', protect, authorizeRoles("Admin"), upload.array('files', 10), fileController.createFile);
router.get('/', protect, authorizeRoles("Admin"), protect, authorizeRoles("Admin"), fileController.getAllFiles);
router.get('/:id', protect, authorizeRoles("Admin"), protect, authorizeRoles("Admin"), fileController.getFilesBySourceId);
router.put('/update', protect, authorizeRoles("Admin"), upload.array('files', 10), fileController.updateFile);
router.delete('/:id',protect, authorizeRoles("Admin"), fileController.deleteFiles);



export default router;
