var nodemailer = require("nodemailer");

const transporter= nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"langquen5102004@gmail.com" ,//email gửi đi
        pass:"myii chlg galf onez"//mật khẩu email gửi
    },
});
module.exports = transporter;