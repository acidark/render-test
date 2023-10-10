const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

notesRouter.get('/',async (request,response) => {
  const notes = await Note
    .find({})
    .populate('user',{ username:1,name:1 })
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

notesRouter.get('/:id', async(request,response) => {
  // try {
  const note = await Note.findById(request.params.id)
  if(note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
  // } catch (exception) {
  // next(exception)
  // }
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
const getTokenFrom = request => {
  let authorization = request.get('authorization')
  if(authorization && authorization.starsWith('Bearer')) {
    return authorization = authorization.replace('Bearer','')
  }
  return null
}
notesRouter.post('/',async(request,response) => {
  const decodedToken = jwt.verify(getTokenFrom(request),process.env.SECRET)
  if(!(decodedToken.id)) {
    return response.status(401).json({
      error:'invalid token'
    })
  }
  const body = request.body
  const user = await User.findById(decodedToken.id)
  const note = new Note({
    content:body.content,
    important:body.important||false,
    user:user.id
  })

  const savedNote = await note.save()
  console.log(savedNote)
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  response.status(201).json(savedNote)
  // } catch(exception) {
  // next(exception)
  // }
})

// notesRouter.delete('/:id',(request,response,next) => {
//   Note
//     .findByIdAndRemove(request.params.id)
//     .then(() => {
//       response.status(204).end()
//     }).catch(error => next(error))
// })

notesRouter.delete('/:id', async (request,response) => {
  // try {
  await Note.findByIdAndRemove(request.params.id)
  response.status(204).end()
  // } catch (exception) {
  // next(exception)
  // }
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