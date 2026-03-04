const express = require('express');
const router = express.Router();
const Charity = require('../models/Charity');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for video upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// GET all charities (public - active only or all?)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }
    
    // If explicit 'all' is passed (e.g. for admin), clear the status filter
    if (status === 'all') {
      delete query.status;
    }

    const charities = await Charity.find(query).sort({ createdAt: -1 });
    res.json(charities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single charity
router.get('/:id', async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Charity campaign not found' });
    res.json(charity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new charity (Admin only - ideally protected)
// Now supports video upload
router.post('/', upload.single('video'), async (req, res) => {
  const { title, goalAmount, description } = req.body;
  
  // If file uploaded, get path
  let videoUrl = '';
  if (req.file) {
    videoUrl = `/uploads/${req.file.filename}`;
  }

  const charity = new Charity({
    title,
    goalAmount,
    description,
    videoUrl
  });

  try {
    const newCharity = await charity.save();
    res.status(201).json(newCharity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update charity (e.g. status)
router.put('/:id', upload.single('video'), async (req, res) => {
  try {
    // Construct update object dynamically to support partial updates (e.g. status toggle)
    let updateData = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.goalAmount) updateData.goalAmount = req.body.goalAmount;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.status) updateData.status = req.body.status;

    // If file uploaded, get path and delete old video
    if (req.file) {
      updateData.videoUrl = `/uploads/${req.file.filename}`;
      
      // Find old charity to get old video path
      const oldCharity = await Charity.findById(req.params.id);
      if (oldCharity && oldCharity.videoUrl) {
        // Construct absolute path safely
        const oldVideoPath = path.join(__dirname, '..', oldCharity.videoUrl);
        if (fs.existsSync(oldVideoPath)) {
          fs.unlinkSync(oldVideoPath);
        }
      }
    }

    const updatedCharity = await Charity.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedCharity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE charity
router.delete('/:id', async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Charity not found' });

    // Delete associated video file if exists
    if (charity.videoUrl) {
      const videoPath = path.join(__dirname, '..', charity.videoUrl);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    await Charity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Charity deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
