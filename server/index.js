const express = require('express'); // importing express
const cors = require('cors');//importing cors
const app = express();//creating express app


app.use(cors())
app.use(express.json())//for parsing application/jsons
const db = require('./DBConnection');
const PORT = 5000;

//importing bunch of routers ---------
//            _____________          |               ____     _ _ _      ____      ___
//           /  __   __   /|         |              |    \   |          /    \    |   \
//          /  __ / /  / / |      ___|___           |     |  |_ __     /______\   |    |  ______________________________
//         /  /__  /__/ /  |      \     /           |     |  |        /        \  |    |
//        /            /   |       \   /            |____/   |_ _ _  /          \ |___/
//       /____________/____|        \ /  
//                                   \  

const Register = require('./routers/RegisteRoute');

const Login = require('./routers/LoginRoute')
const Election = require('./routers/ElectionRoute'); // Adjust path as needed
const AddCandidate = require('./routers/CandidateRoute'); // Adjust path as needed
const addVote = require('./routers/votes'); // Adjust path as needed
const accessElectionPage = require('./routers/accessElectionPage'); // Adjust path as needed
const getAllElectionInfo = require('./routers/getAllElectionInfo'); // Adjust path as needed
const fetchCandidates = require('./routers/accessCandidates'); // Adjust path as needed
const adminRegister = require('./routers/adminRegister'); // Adjust path
const admin_Login = require('./routers/adminLogin'); // Adjust path
const result = require('./routers/Result')

app.use('/' , Register) // Register route
app.use('/' , Login)// Login route
app.use('/' , Election)// Election route
app.use('/' , AddCandidate)// Candidate route
app.use('/' , addVote)// Candidate route
app.use('/' , accessElectionPage)// Candidate route
app.use('/' , getAllElectionInfo)// Candidate route
app.use('/' , fetchCandidates)// Fetch Candidate route
app.use('/' , adminRegister)
app.use('/' , admin_Login)
app.use('/',result)


//app.use('/' , fetchCandidates)// Fetch Candidate route
//app.use('/api', ImageUploadRouter); // then your full route becomes /api/upload



app.get('/' , (req , res)=>{
    res.send("server is running at 5000")
})

app.listen( PORT ,  ()=>{
    console.log("its ONN" , PORT)
})