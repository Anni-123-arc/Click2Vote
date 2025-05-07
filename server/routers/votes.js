const express = require('express'); // importing express
const db = require('../DBConnection'); // importing db connection

const votesRouter = express.Router(); // creating votes router

votesRouter.use(express.json()) // using json to handle json req

// Middleware to check if user has already voted
function CheckForVote(req , res , next) {
    const {voterID , electionID } =req.body

    const q = "SELECT * FROM votes WHERE voterID = ? AND electionID = ?;";

    db.query(q , [voterID , electionID] , (error , result)=>{
        if(error){
            console.log('error while fetching data' , error)
            return res.status(500).json({
                status:false,
                message:"operation failed due to following error",
                error:error
            })
        }
        if(result &&result.length>0){
            console.log('ONE ELECTION ONE VOTE')
            return res.status(200).json({
                status:false, 
                message:"ONE ELECTION ONE VOTE",
                data:result
            })
        }
        next()



    })
}


//Middleware to add vote

function voting(req , res ) {
    const {voterID , candidateID , electionID} = req.body;

    const q = "INSERT INTO votes(voterID , candidateID , electionID) VALUES(?,?,?);"

    db.query(q , [voterID , candidateID , electionID] , (error , result)=>{
        if(error){
            console.log('error while inserting -----(->/)')
            return res.status(500).json({
                status:false,
                message:"error while inserting -----(->/)",
                error:error
            })
        }
       if(result && result.affectedRows>0){
           console.log("thanks for voting and believing in democracy")
           return res.status(200).json({
            status:true,
            message:"thanks for voting and believing in democracy",
            data:result
           })
       }
        
    })
}

votesRouter.post('/addVote' , CheckForVote , voting)

module.exports = votesRouter