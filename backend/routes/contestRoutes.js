const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, contestController.createContest);
router.post('/:id/accept', auth, contestController.acceptContest);
router.get('/open/all', auth, contestController.getOpenContests);
router.get('/:id', auth, contestController.getContest);
router.get('/', auth, contestController.getUserContests);

module.exports = router;
