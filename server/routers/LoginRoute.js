const express = require('express');//importing express
const db = require('../DBConnection');//importing databaseConnection
//const {getISTDateTime, getFutureISTDateTime} = require('../ISTtimeConversionModule');//importing IST time conversion module
const jwt = require('jsonwebtoken');//importing jsonwebtoken

const KEY = "voting"

const { requestOTP, verifyOTP } = require('../controllers/OTPMailer');

const loginRouter = express.Router() // creating Login router

loginRouter.use(express.json());//using json to handle json response

let token ; // Variable to store the token


//MIddleware to check if voter exist
function CheckingForUser(req, res, next) {
    const { email , voterID } = req.body;

    const q = "SELECT * FROM voters WHERE email = ? and voterID = ?;";

    //   ____________
    //   |     |    |   Executing query
    //   |     |    |
    //   | ____|___ |
    //   |/________\|
    //   |____  ____|
    //   |_____Q____|

    db.query(q, [email , voterID], (error, result) => {
        if (error) {
            console.log("Error while searching for user", error);
            return res.status(500).json({
                check_status: false,
                message: "Error occurred while executing query"
            });
        }

        if (result.length ===0) {
            return res.status(500).json({
                status: false,
                message: "User does not exists"
            });
        }

        // User doesn't exist → move to next middleware
        next();

    });

}



//Middleware to handle login req
function LoginMiddleware(req , res ) {
    const {voterID , email ,  password} = req.body;//fetching data from request

    //query to serach voter

    const q = "select *FROM voters WHERE voterID = ? AND email =? AND password =? ;"

    //   ____________
    //   |     |    |   Executing query
    //   |     |    |
    //   | ____|___ |
    //   |/________\|
    //   |____  ____|
    //   |_____Q____|
     
    db.query(q , [voterID , email , password] , (error , result)=>{
        if(error){
            console.log("error while fetching voter")
            return res.status(500).json({
                status:false,
                message:"error in fetching voter data" , 

            })
        }
       // const expTime = getFutureISTDateTime(60); // Get the expiration time 5 minutes ahead    
        const token = jwt.sign( {voterID , email , password} ,
            KEY ,
            {expiresIn:"60min"}//token will expire in 5 minutes
         );
        console.log("token generated" , token)
        console.log("you're logged in!!")
        console.log(result[0])
        return res.status(200).json({
            status: true , 
            user:result[0] ,
            message: "you are logged in!!",
            token: token ,
           
        })
     })
     //next()
}


//using routers
loginRouter.post('/login',CheckingForUser , requestOTP)

loginRouter.post('/loginOTP-verify' , verifyOTP , LoginMiddleware)

//export router

module.exports = loginRouter 


