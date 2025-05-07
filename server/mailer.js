const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'khandareaniket93@gmail.com',
        pass: 'juha ahwd wtzs gcyq' // 🔐 You should replace this with a Gmail **App Password**
    }
});

function sendOTP(toMail, OTP) {
    return transport.sendMail({
        from: 'khandareaniket93@gmail.com',
        to: toMail, // ✅ fixed
        subject: "Your OTP Code",
        html: `<h3>Your OTP is: ${OTP}</h3><p>It will expire in 5 minutes.</p>` // ✅ fixed
    });
}

module.exports = sendOTP;
