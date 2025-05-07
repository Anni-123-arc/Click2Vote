const sendOTP = require('../mailer');
const db = require('../DBConnection');
const {getISTDateTime,getFutureISTDateTime} = require('../ISTtimeConversionModule');
 //temperory OTP storing 
let storedOTP = {}

//function to generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
}
 




//This function will send OTP to voters email
async function requestOTP(req , res, next) {
    const {email , voterID } = req.body;

    const otp = generateOTP()
    const exTime = getFutureISTDateTime()

    //query to insert otp into database
    const q = "INSERT INTO OTP (otp , voterID , email , time) VALUES (?, ?, ?, ?)";
    db.query(q, [otp , voterID , email , exTime],  (error, result) => {
        if (error) {
            console.log("Error while inserting OTP", error);
            return res.status(500).json({
                status: false,
                message: "Error occurred while executing query"
            });
        }
        console.log('OTP inserted successfully')
    });

    //storedOTP[email] = { otp, expires: Date.now() + 5 * 60000 }; // 5 min

    try {
        await sendOTP(email , otp)
        console.log('check your mail for OTP')
        return res.status(200).json({
            
            status:true,
            message:"OTP SENT",
            data: {
                otp: otp,
                expires: exTime
            }
        })
    } catch (error) {
        console.log('error in sending otp')
        console.log(error)
        return res.status(500).json({

            status:false,
            message:"FAILURE IN SENDING OTP"
        }) 
    }
    next()


}


function verifyOTP(req, res, next) {
    const { voterID , email, otp } = req.body;

    const q = "SELECT * FROM OTP WHERE voterID = ? AND email = ? AND otp = ?;"
    const q1 = "DELETE FROM OTP WHERE voterID = ? AND email = ?;"
    db.query(q, [voterID, email , otp], (error, result) => {
        if(error) {
            console.log("Error while fetching OTP", error);
            return res.status(500).json({
                status: false,
                message: "Error occurred while executing query"
            });
        }
      
        if (result.length==0 ) {
             
            return res.status(500).json({ status: false, message: 'NO OTP FOUND'}); 
        }

        const storedOTP = result[0];

        if (storedOTP.otp != otp) {
            return res.status(400).json({
                status: false,
                message: "Invalid OTP"
            });
        }
        const storedTime = new Date(storedOTP.time); // MySQL datetime
        const currentTime = new Date(getISTDateTime()); // Corrected function output
        if (currentTime >storedTime) {
            return res.status(400).json({
                status: false,
                message: "OTP expired"
            });
        }
        

        
        db.query(q1, [voterID, email], (error, result) => {
            if (error) {
                console.log("Error while deleting OTP", error);
                return res.status(500).json({
                    status: false,
                    message: "Error occurred while executing query"
                });
            }
            console.log('OTP deleted successfully')
            next()

        }
    )
        
    })

   
}


module.exports = {
    requestOTP,
    verifyOTP
  
};