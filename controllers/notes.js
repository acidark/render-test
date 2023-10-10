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
notesRouter.get('/:id', async(request,response) => {
  const note = await Note.findById(request.params.id)
  if(note) {
    response.json(note)
  } else {
    response.status(404).end()
  }

})
const getTokenFrom = request => {
  let authorization = request.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')) {
    return authorization = authorization.replace('Bearer ','')
  }
  return null
}
notesRouter.post('/',async(request,response) => {
  const decodedToken = jwt.verify(getTokenFrom(request),process.env.SECRET)
  if(!decodedToken.id) {
    return response.status(401).json({ error:'invalid token' })
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
})
notesRouter.delete('/:id', async (request,response) => {
  await Note.findByIdAndRemove(request.params.id)
  response.status(204).end()
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