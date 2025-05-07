const express = require('express');
const db = require('./../DBConnection');

const ResultRouter = express.Router();
ResultRouter.use(express.json());

// Middleware to fetch result
function FetchResult(req, res, next) {
    const { electionID } = req.params;

    const q = `
        SELECT c.image_url, COUNT(v.voteID) AS vote_count
        FROM candidates AS c
        INNER JOIN votes AS v ON v.candidateID = c.candidateID
        WHERE v.electionID = ?
        GROUP BY c.image_url
        ORDER BY vote_count DESC;
    `;

    db.query(q, [electionID], (error, result) => {
        if (error) {
            console.log("Error while fetching data:", error);
            return res.status(500).json({
                status: false,
                message: "Internal server error while fetching data"
            });
        }

        if (result.length > 0) {
            console.log("Result fetched successfully!");
            return res.status(200).json({
                status: true,
                data: result
            });
        } else {
            return res.status(404).json({
                status: false,
                message: "No results found for this election ID"
            });
        }
    });
}

ResultRouter.get('/result/:electionID', FetchResult);

module.exports = ResultRouter;
