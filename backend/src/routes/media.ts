import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { MediaController, mediaValidation, upload } from '../controllers/media.controller';

const router = Router();
const mediaController = new MediaController();

// All media routes require authentication
router.use(authenticateToken);

// Media file management routes
router.post('/upload', upload.single('file'), mediaValidation.uploadMedia, asyncHandler(mediaController.uploadMedia));
router.get('/device/:deviceId', mediaValidation.getDeviceMedia, asyncHandler(mediaController.getDeviceMedia));
router.get('/download/:mediaId', mediaValidation.downloadMedia, asyncHandler(mediaController.downloadMedia));
router.delete('/:mediaId', mediaValidation.deleteMedia, asyncHandler(mediaController.deleteMedia));
router.get('/metadata/:mediaId', mediaValidation.getMediaMetadata, asyncHandler(mediaController.getMediaMetadata));

export default router;
