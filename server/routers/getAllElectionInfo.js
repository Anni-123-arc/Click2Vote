
const express = require('express');
const router = express.Router();

router.use(express.json());

const db = require('../DBConnection')

//MiddleWare to extract all election related info

function getAllElectionInfo(req, res) {
    const q = "SELECT * FROM election;";

    db.query(q , (error , result)=>{
        if(error){
            console.log(error);
            return res.status(500).json({
                status:false,
                message:"Internal Server Error"
            })
         }
        if(result.length === 0){
            return res.status(404).json({
                status:false,
                message:"No election found"
            });
        }
        // console.log(result);

        return res.status(200).json({
            status:true,
            message:"All election info",
            result:result
        })
    });
}

router.get('/getAllElectionInfo', getAllElectionInfo);

module.exports = router;