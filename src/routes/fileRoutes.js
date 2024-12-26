import express from 'express';
import upload from '../middlewares/multer.js';
import fileController from '../controller/fileController.js';
import {protect, authorizeRoles} from '../middlewares/auth.js'

const router = express.Router();
router.post('/', upload.array('files', 10), fileController.createFile);
router.get('/', protect, authorizeRoles("Admin"), fileController.getAllFiles);
router.put('/update-file', upload.array('files', 10), fileController.updateFile);
router.delete('/:contact_id', fileController.deleteFiles);


export default router;
