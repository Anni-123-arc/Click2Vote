const express = require('express');
const {verifyToken} = require('../controllers/verifyToken'); // Importing verifyToken function
const db = require('../DBConnection'); // Importing database connection
const accessElectionPageRouter = express.Router(); // Creating router for accessElectionPage

accessElectionPageRouter.use(express.json()); // Using JSON to handle JSON response
 

//middlware to allocate resource
function accessElectionPageMiddleware(req , res , next ){

    const user = req.user; // Extracting user from the request object
    console.log("User data:", user.voterID); // Logging user data for debugging
    const voterID = user.voterID; // Extracting voterID from the user object
    const token = req.header['authorization']?.split(' ')[1]; // Extracting token from the request header
    const q = "SELECT name FROM voters WHERE voterID = ?;"; // Query to fetch user name 
    
    db.query(q , [voterID] , (error , result)=>{
        if (error) {
            console.log("Error while fetching user name", error); // Logging error for debugging
            return res.status(500).json({
                status: false,
                message: "Error occurred while executing query"
            });
        }
        
        if (result.length === 0) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }
        
        const userName = result[0].name; // Extracting user name from the result
        console.log('accessing')
        res.setHeader('Authorization', `Bearer ${token}`);
        return res.status(200).json({
          status: true,
          name: userName,
          message: `Welcome ${userName} to the election page`,
          voterID: user.voterID
        });
    })
   
}

// Route to access election page
accessElectionPageRouter.get('/accessElectionPage', verifyToken, accessElectionPageMiddleware); // Using verifyToken middleware

//export router

module.exports = accessElectionPageRouter