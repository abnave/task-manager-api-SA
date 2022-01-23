const express = require('express')
const Post = require("../models/post")
const auth = require("../middleware/authentication")
const User = require("../models/user");
const app = new express.Router()



app.post('/posts', auth, async (req, res) => {
    const post = new Post ({
        ...req.body,
        owner :req.user._id
    })
    try {
        await post.save()
        res.status(201).send(post)
    } catch (error) {
        res.status(400).send(err)
    }  
})

app.get('/posts', auth, async (req, res) => {
    const match = {}
    const sort = {}
    // if(req.query.completed) {
    //     match.completed = req.query.completed === "true"
    // }

    // if(req.query.sortBy) {
    //     const parts = req.query.sortBy.split(":")
    //     sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    // }
    try {
        // const allPosts = await Post.find();
        // console.log("all Posts:"+allPosts); 
        //console.log(req.user);
        // const result = await req.user.populate({
        //     path: 'posts',
        //     options: {
        //         limit: parseInt(req.query.limit),
        //         skip: parseInt(req.query.skip),
        //         sort
        //     }
        // }).execPopulate();
        const user = await User.findById('61ed26ede8e2bbf4dc0df09e')
    await user.populate('posts').execPopulate()
    console.log(user.posts)
        // const result = await req.user.populate('posts').execPopulate()
        // console.log("Succesful get post"+result);
       // res.send(req.user.posts)
        res.send(user.posts)
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

module.exports = app