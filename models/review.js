const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const Reviews = new Scheme({
    id_fruit:{type: Scheme.Types.ObjectId, ref:'fruit'},
    id_user:{type: Scheme.Types.ObjectId, ref:'user'},
    rating:{type: Number},
    comment:{type: String},

},{
    timestamps: true,
})
module.exports = mongoose.model('review',Reviews);