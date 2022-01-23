const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOne, userOneId, setupDatabase} = require('../tests/fixtures/db')


const userOneUpdated = {
    name: 'Rushikesh Manwatkar',
}

beforeEach(setupDatabase)

test('should sign up a new user' , async () => {
    const response = await request(app).post('/users').send({
        name : "Rushikesh",
        email : "rushikesh@email.com",
        password: "passme!n"

    }).expect(201)

    // user should be created in the database
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user : {
            name : "Rushikesh",
            email : "rushikesh@email.com",
        },
        token : user.tokens[0].token
    })

    expect(user.password).not.toBe('passme!n')
})

test('should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email : userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(user.tokens[1].token).toBe(response.body.token)
})

test('should not login a nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email : userOne.email,
        password: userOne.password + "extra"
    }).expect(400)
})

test ('should get the user profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('should not get the user profile for unauthenticated users', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer   ${userOne.tokens[0].token}`)
        .send()
        .expect(400)

})

test('should delete the user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
    
})

test('should not delete for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer    ${userOne.tokens[0].token}`)
        .send()
        .expect(400)
        const user = await User.findById(userOneId)
        expect(user).not.toBeNull()
})


test('should upload an avatar', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/My_photo.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({name:userOneUpdated.name})
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe(userOneUpdated.name)
})

test('should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({name:userOneUpdated.name, height:10})
        .expect(400)
})
