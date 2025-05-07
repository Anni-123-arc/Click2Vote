const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../DBConnection'); // Adjust if needed

const ImageUploadRouter = express.Router();
ImageUploadRouter.use(express.json());
ImageUploadRouter.use('/uploads', express.static('uploads')); // Serve images statically

// Ensure 'uploads/' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const { voterID } = req.body;
    cb(null, voterID + path.extname(file.originalname)); // Save as voterID.extension
  }
});

const upload = multer({ storage: storage });

/** Upload image route */
ImageUploadRouter.post('/upload', upload.single('image'), (req, res) => {
  const { voterID } = req.body;
  const image_name = req.file.filename;
  const image_path = path.join('uploads', req.file.filename); // relative path to serve publicly

  const q = "INSERT INTO images (voterID, image_name, image_path) VALUES (?, ?, ?);";
  db.query(q, [voterID, image_name, image_path], (error, result) => {
    if (error) {
      console.error('Error while saving image to DB:', error);
      return res.status(500).json({
        status: false,
        message: 'Error occurred while uploading image'
      });
    }
    res.status(200).json({
      status: true,
      message: 'Image uploaded successfully',
      filePath: image_path
    });
  });
});

/** Get image info by voterID */
ImageUploadRouter.get('/image/:voterID', (req, res) => {
    const { voterID } = req.params;
  
    const q = "SELECT * FROM images WHERE voterID = ? ORDER BY imgID DESC LIMIT 1;";
    db.query(q, [voterID], (error, result) => {
      if (error) {
        console.error('Error while fetching image:', error);
        return res.status(500).json({
          status: false,
          message: 'Error occurred while fetching image'
        });
      }
  
      if (result.length > 0) {
        // Fix image_path to be web-friendly
        result[0].image_path = result[0].image_path.replace(/\\/g, '/');
  
        res.status(200).json({
          status: true,
          message: 'Image fetched successfully',
          image: result[0]
        });
      } else {
        res.status(404).json({
          status: false,
          message: 'No image found for this voterID'
        });
      }
    });
  });
  

module.exports = ImageUploadRouter;
