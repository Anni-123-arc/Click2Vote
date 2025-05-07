
const express = require('express');
const candidateRouter = express.Router(); // Creating router for accessElectionPage
const db = require('../DBConnection'); // Importing database connection 

candidateRouter.use(express.json()); // Using JSON to handle JSON response


// Middleware to fetch candidates for a specific election

function fetchCandidates(req, res) {
    const {electionId} = req.body;

    const q = "SELECT * FROM candidates WHERE electionId = ?;"; // Query to fetch candidates for the given electionId   

    db.query(q , [electionId] , (error , result)=>{
        if(error){
            console.log("Error while fetching candidates", error); // Logging error for debugging
            return res.status(500).json({
                status: false,
                message: "Error occurred while executing query"
            });
        }
        if(result.length === 0){
            return res.status(404).json({
                status: false,
                message: "No candidates found for this election"
            });
        }

        console.log("Candidates fetched successfully", result); // Logging success message for debugging
        return res.status(200).json({
            status: true,
            result: result, // Sending candidates in the response
            message : "Candidates fetched successfully"
        })
    })
}

candidateRouter.post('/fetchCandidates', fetchCandidates); // Route to fetch candidates for a specific election
// Exporting router
module.exports = candidateRouter; // Exporting candidateRouter for use in other files