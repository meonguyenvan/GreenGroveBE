const mongoose = require('mongoose')
const Scheme = mongoose.Schema;
const Favourites = new Scheme({
    id_user:{type:Scheme.Types.ObjectId,ref:'user'},
    id_fruit:{type:Scheme.Types.ObjectId,ref:'fruit'},   
},{
    timestamps: true
})

module.exports = mongoose.model('favourite',Favourites)