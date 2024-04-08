const mongoose = require('mongoose')
const Scheme = mongoose.Schema;

const Orders = new Scheme({
    order_code:{type:String},
    id_user:{type: Scheme.Types.ObjectId, ref:'user'}
},{
    timestamps:true,
})

module.exports = mongoose.model('order',Orders);