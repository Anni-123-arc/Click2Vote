const express = require('express');
const db = require('../DBConnection');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { error } = require('console');
const { requestOTP, verifyOTP } = require('../controllers/OTPMailer')
const AdminRegisterRouter = express.Router();

AdminRegisterRouter.use(express.json());

// Make sure 'uploads' directory exists
const upload_path = path.join(__dirname, '../uploads'); // Changed path to be in parent directory
if (!fs.existsSync(upload_path)) {
    fs.mkdirSync(upload_path, { recursive: true });
}

AdminRegisterRouter.use('/uploads', express.static(upload_path)); // Serve images statically

// multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, upload_path);
    },
    filename: function (req, file, cb) {
        const { voterID } = req.body;
        // Make sure adminID exists in the request body
        if (!voterID) {
            return cb(new Error('voterID is required'), null);
        }
        cb(null, voterID + path.extname(file.originalname)); // Changed from voterID to adminID
    }
});

const upload = multer({ storage: storage });

AdminRegisterRouter.post('/check_b4_upload', (req, res, next) => {
    const { voterID, name, email, password } = req.body;

    // Validate required fields
    if (!voterID || !name || !email || !password) {
        return res.status(400).json({
            status: false,
            message: "All fields are required"
        });
    }

    const q = "SELECT * FROM admin WHERE voterID = ? OR email = ?;";

    db.query(q, [voterID, email], (error, result) => {
        if (error) {
            console.log("error in executing query", error);
            return res.status(500).json({
                status: false,
                message: "error in executing query"
            });
        }
        if (result.length > 0) {
            console.log("user exists!!");
            return res.status(409).json({ // 409 Conflict is more appropriate for existing resource
                status: false,
                message: "Admin with this ID or email already exists",
                result: result
            });
        }
        next();
    });
}, requestOTP); 

AdminRegisterRouter.post('/upload', upload.single('image'), verifyOTP, (req, res) => {
    // Check if file was uploaded
    if (!req.file) {
        return res.status(400).json({
            status: false,
            message: "Image file is required"
        });
    }

    const { voterID, name, email, password } = req.body;
    const image_url = `/uploads/${req.file.filename}`;

    // Hash the password before storing it (you should implement this)
    // const hashedPassword = await bcrypt.hash(password, 10);

    const q = "INSERT INTO admin(voterID, name, email, password, image_url) VALUES (?, ?, ?, ?, ?);";

    db.query(q, [voterID, name, email, password, image_url], (error, result) => { // Fixed: Added all required fields
        if (error) {
            console.log("error in executing query", error);
            // Delete the uploaded file if DB operation fails
            fs.unlinkSync(path.join(upload_path, req.file.filename));
            return res.status(500).json({
                status: false,
                message: "error in executing query"
            });
        }
        if (result.affectedRows > 0) {
            return res.status(201).json({ // 201 Created for successful resource creation
                status: true,
                message: "Admin registered successfully",
                adminName: name
            });
        } else {
            // If no rows were affected (though this shouldn't happen with INSERT)
            fs.unlinkSync(path.join(upload_path, req.file.filename));
            return res.status(500).json({
                status: false,
                message: "Failed to register admin"
            });
        }
    });
});

module.exports = AdminRegisterRouter;