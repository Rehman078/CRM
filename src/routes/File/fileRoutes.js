import express from 'express';
import upload from '../../middlewares/multer.js';
import fileController from '../../controller/File/fileController.js';
import {protect, authorizeRoles} from '../../middlewares/auth.js';

const router = express.Router();
router.post('/', protect, authorizeRoles("Admin", "Manager", "SalesRep"), upload.array('files', 10), fileController.createFile);
router.get('/', protect, authorizeRoles("Admin", "Manager", "SalesRep"), fileController.getAllFiles);
router.get('/:id', protect, authorizeRoles("Admin", "Manager",), fileController.getFilesBySourceId);
router.put('/:id', protect, authorizeRoles("Admin", "Manager", "SalesRep"), upload.array('files', 10), fileController.updateFile);
router.delete('/:id',protect, authorizeRoles("Admin", "Manager", "SalesRep"), fileController.deleteFiles);
router.delete('/file/:id',protect, authorizeRoles("Admin", "Manager", "SalesRep"), fileController.deleteByFileId)



export default router;
