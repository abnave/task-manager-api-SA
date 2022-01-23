const mongoose = require('mongoose')
const validator = require('validator')

const postSchema = new mongoose.Schema({
    description : {
        type: String,
        trim : true,
    }, 
    likes : {
        type : Number,
        default : false,
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref: 'User'
    },
    comments: [{
        type: String
    }]
}, {    
    timestamps: true
})
const Post = mongoose.model('Post', postSchema)

module.exports = Post