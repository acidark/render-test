const mongoose = require('mongoose')
const app = require('../app')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const Note = require('../models/note')
const User = require('../models/user')
const api = supertest(app)
const helper = require('../tests/test_helper')

// beforeEach(async () => {
//   await Note.deleteMany({})
//   const noteObjects = helper.initialNotes.map(note => new Note(note))
//   const promisesArray = noteObjects.map(note => note.save())
//   // console.log(promisesArray)
//   await Promise.all(promisesArray)
// })

beforeEach(async () => {
  await Note.deleteMany({})
  for (let note of helper.initialNotes) {
    let noteObject = new Note(note)
    await noteObject.save()
  }
})

describe('when there are notes saved',() => {
  test('there are two notes',async () => {
    const response = await api
      .get('/api/notes')
    expect(response.body).toHaveLength(2)
  })

  test('the frstnote is about http methods',async () => {
    const response = await api.get('/api/notes')
    expect(response.body[0].content).toBe('html is easy')
  })

  test('all notes are returned',async () => {
    const response = await api
      .get('/api/notes')
    expect(response.body).toHaveLength(helper.initialNotes.length)
  })

  test('a specific note is within the returned notes',async () => {
    const response = await api
      .get('/api/notes')
    const contents = response.body.map(r => r.content)
    expect(contents).toContain(
      'Browser can execute only JavaScript'
    )
  })

  test('notes are returned as json',async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type',/application\/json/)
  })
})

describe('a specific note can be added',() => {
  test('a valid note can be added',async () => {
    const newNote = {
      content : 'async/await makes async calls easier',
      important :true
    }
    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type',/application\/json/)

    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length+1)
    const contents = notesAtEnd.map(n => n.content)
    expect(contents).toContain(
      'async/await makes async calls easier'
    )
  })
  test('fails with code 404 of note data invalid',async () => {
    const note = {
      important:true
    }
    await api
      .post('/api/notes')
      .send(note)
      .expect(400)

    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
  })
})
describe('viewing a specific note',() => {
  test('a specific note can be viewed', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToView = notesAtStart[0]
    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type',/application\/json/)
    expect(resultNote.body).toEqual(noteToView)
  })

  test('test throws 404 if note not found',async () => {
    const noneExistingNote = await helper.nonExistingId()
    await api
      .get(`/api/notes/${noneExistingNote}`)
      .expect(404)
  })

  test('test throws 400 if is an invalid id', async () => {
    const invalidId = 'jgdk65066jk560'
    await api
      .get(`/api/notes/${invalidId}`)
      .expect(400)
  })
})

describe('when there is initially an user in db',() => {
  beforeEach(async () => {
    await User.deleteMany()
    const passwordHash = await bcrypt.hash('sekret',10)
    const user = new User({ username:'root',passwordHash })
    await user.save()
  })
  test('creation falls with statuscde 400 if username already exists',async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
      username:'root',
      name:'root',
      password:'root'
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type',/application\/json/)
    expect(result.body.error).toContain('expected `username` to be unique')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
  test('creation succed with valid user', async () => {
    const initialUsers = await helper.usersInDb()
    const newUser = {
      username : 'test',
      name:'test',
      password:'test'
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type',/application\/json/)
    const usersAtEnd = await helper.usersInDb()
    const usernames = usersAtEnd.map(u => u.username)
    expect(usersAtEnd).toHaveLength(initialUsers.length+1)
    expect(usernames).toContain(newUser.username)
  })
})

describe('deleting notes',() => {
  test('a note can be deleted', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]
    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204)
    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length-1)

    const contents = notesAtEnd.map(n => n.content)
    expect(contents).not.toContain(noteToDelete.content)
  })
})

afterAll(async() => {
  await mongoose.connection.close()
})