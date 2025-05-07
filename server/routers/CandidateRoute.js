const express = require('express');
const CandidateRouter = express.Router();
const db = require('../DBConnection');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure upload directory
const upload_path = path.join(__dirname, '../uploads');
if (!fs.existsSync(upload_path)) {
    fs.mkdirSync(upload_path, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, upload_path);
    },
    filename: function (req, file, cb) {
        const email = req.body.email || 'unknown'; // Fallback if email not parsed yet
        const uniqueFileName = email + path.extname(file.originalname);
        cb(null, uniqueFileName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Modified CheckForCandidate middleware
function CheckForCandidate(req, res, next) {
    // Get email from either req.body (if parsed) or req.query
    const email = req.body.email || req.query.email;
    
    if (!email) {
        return res.status(400).json({
            status: false,
            message: "Email is required"
        });
    }

    const q = "SELECT * FROM candidates WHERE email = ?;";

    db.query(q, [email], (error, result) => {
        if (error) {
            console.error("Error while fetching data:", error);
            return res.status(500).json({
                status: false,
                message: "Error in check"
            });
        }

        if (result && result.length > 0) {
            return res.status(200).json({
                status: false,
                message: "Candidate already exists"
            });
        }

        next();
    });
}

// Modified AddCandidate function
function AddCandidate(req, res) {
    if (!req.file) {
        return res.status(400).json({
            status: false,
            message: "No file uploaded"
        });
    }

    const { cadName, electionID, age, email } = req.body;
    const image_url = `/uploads/${req.file.filename}`;
    const q = "INSERT INTO candidates (cadName, electionID, age, email, image_url) VALUES (?, ?, ?, ?, ?);";

    db.query(q, [cadName, electionID, age, email, image_url], (error, result) => {
        if (error) {
            console.error("Error while inserting data:", error);
            return res.status(500).json({
                status: false,
                message: "Error in inserting data",
                error: error.message
            });
        }
        
        return res.status(201).json({
            status: true,
            message: "Candidate added successfully",
            data: {
                cadName,
                electionID,
                age,
                email,
                image_url
            }
        });
    });
}

// Modified route to parse form data before CheckForCandidate
CandidateRouter.post('/addCandidate', 
    upload.single('image'), // Parse multipart form first
    (req, res, next) => {
        // Now req.body should be populated
        CheckForCandidate(req, res, next);
    },
    AddCandidate
);

module.exports = CandidateRouter;