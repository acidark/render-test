const notesRouter = require('express').Router()
const Note = require('../models/note')

// notesRouter.get('/',(request,response) => {
//   console.log('enter get')
//   Note
//     .find({})
//     .then(notes => {
//       console.log('enter get')
//       response.json(notes)
//     })
// })

notesRouter.get('/',async (request,response) => {
  const notes = await Note.find({})
  response.json(notes)
})

// notesRouter.get('/:id',(request,response,next) => {
//   Note
//     .findById(request.params.id)
//     .then(note => {
//       if(note){
//         response.json(note)
//       } else {
//         response.status(404).end()
//       }
//     }).catch(error => next(error))
// })

notesRouter.get('/:id', async(request,response,next) => {
  try {
    const note = await Note.findById(request.params.id)
    if(note) {
      response.json(note)
    } else {
      response.status(404)
    }
  } catch (exception) {
    next(exception)
  }
})

// notesRouter.post('/',(request,response,next) => {
//   const { content,important } = request.body
//   const note = new Note ({
//     content:content,
//     important:important||false
//   })
//   note
//     .save()
//     .then(savedNote => {
//       response.status(201).json(savedNote)
//     }).catch(error => next(error))
// })
notesRouter.post('/',async(request,response,next) => {
  const body = request.body
  const note = new Note({
    content:body.content,
    important:body.important||false
  })
  try{
    const savedNote = await note.save()
    response.status(201).json(savedNote)
  } catch(exception) {
    next(exception)
  }
})

// notesRouter.delete('/:id',(request,response,next) => {
//   Note
//     .findByIdAndRemove(request.params.id)
//     .then(() => {
//       response.status(204).end()
//     }).catch(error => next(error))
// })

notesRouter.delete('/:id', async (request,response,next) => {
  try {
    await Note.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

notesRouter.put('/:id',(request,response,next) => {
  const { content,important } = request.body
  Note
    .findbyIdAndUpdate(request.params.id,{
      content:content,
      important:important
    },{ new:true })
    .then(updatedNote => {
      response.json(updatedNote)
    }).catch(error => next(error))
})
module.exports=notesRouter