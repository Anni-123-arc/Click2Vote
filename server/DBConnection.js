const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'anni@9890',
    database: 'onlineelection'
})

db.connect((err)=>{
    if(err){
        console.log('error while connecting to db')
    }
    //succesfull docking <--(-)-----(-)-->
    console.log('connection established <--(-)-----(-)-->')
})

module.exports = db;