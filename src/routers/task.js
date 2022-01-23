const express = require('express')
const Task = require("../models/task")
const auth = require("../middleware/authentication")
const app = new express.Router()

app.post('/tasks', auth, async (req, res) => {
    const task = new Task ({
        ...req.body,
        owner :req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(err)
    }  
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:asc

app.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if(req.query.completed) {
        match.completed = req.query.completed === "true"
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send()
    }
})

app.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({error: "Invalid update"})
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send("No task found!")
        }

        updates.forEach((update)=> task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

app.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findByOneAndDelete({ _id:req.params.id, owner : req.user._id})
        if (!task) {
            return res.status(404).send("Task not found!")
        }
        res.send(task)
    } catch (error) {
        res.status(500).send("Something went wrong!")
    }
})

module.exports = app