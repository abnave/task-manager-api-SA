const express = require('express')
const app = new express.Router()
const auth = require('../middleware/authentication')
const User = require("../models/user")
const multer = require('multer')
const sharp = require('sharp')
require('dotenv').config()
const {sendWelcomeEmail, sendCancellataionEmail} = require('../emails/account')


app.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send({error: error.message})
    }
})

app.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (error) {
        res.status(400).send("Invalid Login credentials")
    }
})

app.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send('You have logged out succesfully')
    } catch (error) {
        res.status(500).send(error)
    }
})

app.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send('You have logged out of all the devices')
    } catch (error) {
        res.status(500).send(error)
    }
})

app.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

app.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({error: "Invalid update"})
    }

    try {
        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        res.status(200).send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

app.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancellataionEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send("Something went wrong!")
    }
})

const upload = multer({
    limits : {
        fileSize :1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)/)) {
            return cb(new Error("Invalid image format. jpg, jpeg, png are accepted."))
        }
        cb(undefined, true)
    }
})
app.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width : 250, height : 250 }).png().toBuffer()
    req.user.avatar = buffer
    // req.user.avatar = req.file.buffer
    await req.user.save()
    res.send("Image uploaded succesfully")
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

app.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send("Avatar deleted succesfully")
    } catch (error) {
        res.status(400).send(error)
    }
})

app.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch (error) {
        res.status(404).send(error)
    }
})

app.get('/users/me/avatar', auth, async (req, res) => {
    // res.set('Content-Type', 'image/png')
    res.send(req.user.avatar)
})

module.exports = app