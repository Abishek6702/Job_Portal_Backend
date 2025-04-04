const express = require('express');
const router = express.Router();
const { createLesson, updateLesson, deleteLesson,getLessonsByCourse,getLessonById} = require('../controllers/lessonController');
const { verifyToken, authorizeRoles, checkCourseOwnership } = require('../middlewares/authMiddleware'); 


router.post('/', verifyToken, authorizeRoles('Admin', 'Instructor'), createLesson); 

router.put('/:id', verifyToken, authorizeRoles('Admin', 'Instructor'), checkCourseOwnership, updateLesson);


router.delete('/:id', verifyToken, authorizeRoles('Admin', 'Instructor'), deleteLesson);

router.get('/course/:courseId',verifyToken,  getLessonsByCourse); 

router.get('/:id',verifyToken,  getLessonById); 


module.exports = router;
