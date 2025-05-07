const express = require('express');
const AdminLoginRouter = express.Router()

AdminLoginRouter.use(express.json())


const db = require('./../DBConnection')

const {requestOTP , verifyOTP} = require('./../controllers/OTPMailer')

const jwt = require('jsonwebtoken');

const KEY = "Admin";


//Middleware to check if admin already exists

function Check_b4_admin_login(req , res ,next) {
    const { email , voterID } = req.body;

    const q = "SELECT * FROM admin WHERE email = ? and voterID = ?;";

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


//Middleware to register user
function Login_admin(req , res , next) {
     const {voterID , email ,  password} = req.body;//fetching data from request
   
       //query to serach voter
   
       const q = "select *FROM admin WHERE voterID = ? AND email =? AND password =? ;"
   
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
           console.log(result)
           return res.status(200).json({
               status: true , 
               user:result[0] ,
               message: "you are logged in!!",
               token: token ,
              
           })
        })
        //next()
}


AdminLoginRouter.post('/adminLogin' , Check_b4_admin_login , requestOTP)
AdminLoginRouter.post('/adminLogin-verify', verifyOTP , Login_admin)

module.exports = AdminLoginRouter;