function getISTDateTime() {
    const now = new Date();
    const istDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    return istDate.toISOString().slice(0, 19).replace('T', ' ');
}

function getFutureISTDateTime(minutesAhead = 5) {
    const now = new Date();
    const istDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const futureIST = new Date(istDate.getTime() + minutesAhead * 60000);
    return futureIST.toISOString().slice(0, 19).replace('T', ' ');
}


module.exports = { getISTDateTime, getFutureISTDateTime };

 
