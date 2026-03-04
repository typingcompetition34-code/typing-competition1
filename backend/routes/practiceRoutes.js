const express = require('express');
const router = express.Router();
const PracticeResult = require('../models/PracticeResult');
const auth = require('../middleware/authMiddleware');
const { generateContestText } = require('../utils/textGenerator');
const practiceContent = require('../utils/practiceContent');
const drillContent = require('../utils/drillContent');

// Get drill content
router.get('/drill/:type/:courseType/:lesson', (req, res) => {
  try {
    const { type, courseType, lesson } = req.params;
    const content = drillContent.getDrillContent(type, courseType, lesson);
    res.json(content);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get available practice topics
router.get('/topics', (req, res) => {
  try {
    const topics = Object.keys(practiceContent);
    res.json(topics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Generate practice text
router.get('/text', (req, res) => {
  try {
    const { type } = req.query;
    const seed = Date.now().toString();
    const text = generateContestText(type, seed);
    res.json({ text });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Save practice result
router.post('/results', auth, async (req, res) => {
  try {
    const { type, level, wpm, accuracy } = req.body;
    const newResult = new PracticeResult({
      userId: req.user.id,
      type,
      level,
      wpm,
      accuracy
    });
    const savedResult = await newResult.save();
    res.json(savedResult);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user practice results
router.get('/results', auth, async (req, res) => {
  try {
    const results = await PracticeResult.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
