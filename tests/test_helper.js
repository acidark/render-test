const Note = require('../models/note')
const initialNotes = [
  {
    content : 'html is easy',
    important : true
  },
  {
    content : 'Browser can execute only JavaScript',
    important : false
  }
]

const nonExistingId = async () => {
  const note = new Note({ content : 'will remove soon' })
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const notesInDb= async () => {
  const notes = await Note.find({})
  return notes.map(note => note.toJSON())
}

module.exports = {
  initialNotes,
  nonExistingId,
  notesInDb
}