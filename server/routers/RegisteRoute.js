const express = require('express');
const router = express.Router();
const db = require('../DBConnection');
const { requestOTP, verifyOTP } = require('../controllers/OTPMailer');

// const generateOTP = require('../controllers/OTPMailer')
router.use(express.json());



// Middleware to check if user exists
function CheckingForUser(req, res, next) {
    const { voterID , email } = req.body;

    const q = "SELECT * FROM voters WHERE voterID = ? AND email =?;";

    //   ____________
    //   |     |    |   Executing query
    //   |     |    |
    //   | ____|___ |
    //   |/________\|
    //   |____  ____|
    //   |_____Q____|

    db.query(q, [voterID , email], (error, result) => {
        if (error) {
            console.log("Error while searching for user", error);
            return res.status(500).json({
                check_status: false,
                message: "Error occurred while executing query"
            });
        }

        if (result.length > 0) {
            return res.status(200).json({
                status: false,
                message: "User already exists"
            });
        }

        // User doesn't exist → move to next middleware
        next();
    });
}



// Middleware to register user
function Registration(req, res) {
    const {voterID, name, password, DOB, age, email, address , gender } = req.body;



    const q = "INSERT INTO voters (voterID,name, password, DOB, age, email, address , gender) VALUES (?, ?, ?, ?, ?, ?,?,?)";

    db.query(q, [voterID , name, password, DOB, age, email, address , gender], (error, result) => {
        if (error) {
            console.error('Error while adding user:', error);
            return res.status(500).json({
                status: false,
                message: 'Database error',
                error: error.message
            });
        }

        if (result && result.affectedRows > 0) {
            console.log('Voter added successfully!!!');
            return res.status(200).json({
                status: true,
                message: 'User registered successfully',
                data: result , 
                voterID: voterID
            });
        } else {
            return res.status(400).json({
                status: false,
                message: 'User registration failed',
                data: result
            });
        }
    });
}

// Step 1: Request OTP
router.post('/register', CheckingForUser, requestOTP);

// Step 2: Verify OTP and Register
router.post('/verify-otp', verifyOTP, Registration);

module.exports = router;
