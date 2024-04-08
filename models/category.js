const mongoose = require('mongoose')
const Scheme = mongoose.Schema;
const Categorys = new Scheme({
    name:{type:String},
},{
    timestamps:true
})

module.exports = mongoose.model('category',Categorys);