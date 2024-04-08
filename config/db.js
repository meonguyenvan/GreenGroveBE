const mongoose = require('mongoose')
mongoose.set('strictQuery',true)
require('dotenv').config();

// kết nối vs dattabase altas
const altas = process.env.MONGGO_URL
const connect = async () =>{
    try {
        await mongoose.connect(altas,{
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true,
    })
    console.log(`Connect Success`)
    } catch (error) {
        console.log(error)
        console.log(`connect fail`)
    }
}
module.exports = {connect}