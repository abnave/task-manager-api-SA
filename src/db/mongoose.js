const mongoose = require('mongoose')
//console.log("URL:"+process.env.MONGODB_URL);
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser : true
})