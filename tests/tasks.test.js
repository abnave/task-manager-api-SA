const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {userOne, userOneId, setupDatabase, taskOne, taskTwo, taskThree} = require('../tests/fixtures/db')

beforeEach(setupDatabase)

test('should create a task for the user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'write test task',
        })
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()

    expect(task.completed).toEqual(false)
    expect(task.owner).toStrictEqual(userOneId)
})

test('should not create a task for an unauthenticated user', async () => {
    await request(app)
        .post('/tasks')
        .send({
            description: 'write test task',
        })
        .expect(400)
})

test('should get all the user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(2)
})

test('should not delete other user\'s task', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(500)
    const task = await Task.findById(taskThree._id)
    expect(task).not.toBeNull()
})


