const mongoose = require('mongoose')
const app = require('../app')
const supertest = require('supertest')
const Note = require('../models/note')
const api = supertest(app)
const helper = require('../tests/test_helper')

beforeEach(async () => {
  await Note.deleteMany({})
  let noteObject = new Note(helper.initialNotes[0])
  await noteObject.save()
  noteObject = new Note(helper.initialNotes[1])
  await noteObject.save()
})

test('all notes are returned',async () => {
  const response = await api
    .get('/api/notes')
  console.log(response)
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
test('a specific note can be viewed', async () => {
  const notesAtStart = await helper.notesInDb()
  const noteToView = notesAtStart[0]
  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type',/application\/json/)
  expect(resultNote.body).toEqual(noteToView)
})

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
test('there are two notes',async () => {
  const response = await api
    .get('/api/notes')
  expect(response.body).toHaveLength(2)
})

test('the frstnote is about http methods',async () => {
  const response = await api.get('/api/notes')
  expect(response.body[0].content).toBe('html is easy')
})

afterAll(async() => {
  await mongoose.connection.close()
})