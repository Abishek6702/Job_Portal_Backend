const express = require('express');
const upload = require('../middlewares/upload'); 
const {
  uploadVideo,
  getVideos,
  updateVideo,
  deleteVideo,
  getVideoById
} = require('../controllers/videoController');

const {
  verifyToken,
  authorizeRoles,
  checkCourseOwnership
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
  '/upload/:lessonId',
  verifyToken,
  checkCourseOwnership, 
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'resources', maxCount: 3 } 
  ]),
  uploadVideo
);
router.get('/lesson/:lessonId',getVideos);
router.get('/:id', getVideoById);
router.put(
  '/:id',
  verifyToken,
  checkCourseOwnership,
  upload.fields([{ name: 'video' }, { name: 'resources' }]),
  updateVideo
);
router.delete('/:id', verifyToken,checkCourseOwnership,  deleteVideo);
module.exports = router;
