const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const Carts = new Scheme({
    id_user:{type:Scheme.Types.ObjectId,ref:'user'},
    id_fruit:{type:Scheme.Types.ObjectId,ref:'fruit'},
    quantity:{type:String},
    
},{
    timestamps:true,
})

module.exports = mongoose.model('cart',Carts);