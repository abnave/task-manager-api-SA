const express = require('express')
require("./db/mongoose")
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const postRouter = require('./routers/post')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
app.use(postRouter)

module.exports = app