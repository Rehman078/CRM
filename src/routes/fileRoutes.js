import express from 'express';
import upload from '../middlewares/multer.js';
import fileController from '../controller/fileController.js';
import {protect, authorizeRoles} from '../middlewares/auth.js'

const router = express.Router();

router.post('/', protect, authorizeRoles("Admin"),upload.single('file'), fileController.createFile);
router.get('/', protect, authorizeRoles("Admin"), fileController.getAllFiles);
router.get('/:id', protect, authorizeRoles("Admin"), fileController.getFileById);
router.put('/:id', protect, authorizeRoles("Admin"), upload.single('file'), fileController.updateFile);
router.delete('/:id', protect, authorizeRoles("Admin"), fileController.deleteFile);

export default router;
