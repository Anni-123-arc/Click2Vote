
const express = require('express');//importing express
const db = require('../DBConnection');//importing db connection

const ElectionROuter = express.Router() // creating election router

ElectionROuter.use(express.json()) // using json to handle json req

//Middleware to checke title conflict
function ConflictCheck(req, res, next) {
    const { title } = req.body;
    const q = "SELECT * FROM election WHERE title = ?;"

    db.query(q, [title], (error, result) => {
        if (error) {
            console.log("Error while fetching data");
            return res.status(500).json({
                status: false,
                message: "Error in check"
            });
        }

        if (result && result.length > 0) {
            console.log("Title already exists, change title and try again");
            return res.status(200).json({
                status: false,
                message: "Election title already exists"
            });
        }

        // No conflict
        next();
    });
}

//Election Middleware
function AddElection(req , res , next) {
    const { title , startDate , endDate} = req.body; // gathering data from req
    
    //query to add election
    const q = "INSERT INTO election (title , startDate , endDate) VALUES(? ,? ,?);"

    
    /*            Execution of Query

                            _________
                           |         |        
                           |  _____  |     
                           | |     | |        
                           | |     | |
                           | |     | |
                           |_|_____|_|
                              || ||
                              || ||         
                              || ||
                              || ||
                            __||_||__
                           |   ||   |
                           |   ||   |     
                           |   \/   |      
                           |  /==\  |      
                           | /====\ |
                           |/______\|
                           |        |       
                           |  (_Q_) |      
                           |        |
                           |        |
                           |        |
                         __|________|__    
                        |            |
                        |            |    
                        |   ______   |   
                       /|  |      |  |\
                      /_|__|______|__|_\   
                      ||            ||
                      ||            ||    
                      ||            ||
                     /_|            |_\
                    /__\            /__\    

*/
 
db.query(q , [title , startDate , endDate] , (error , result)=>{
    if(error){
        console.log("error while creating election")
        return res.status(500).json({
            status:false,
            message:"error while creating election",
            error:error
        })
    }

    if(result&&result.affectedRows>0){
        console.log("democracy rocks!!!");
        return res.status(200).json({
            status:true , 
            message:"democracy rocks!!!"
        })
    }
})
  

}

//router to post
ElectionROuter.post('/election' , ConflictCheck , AddElection) ;

//export router

module.exports = ElectionROuter;



