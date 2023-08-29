// console.log('hello world')
// const http = require('http')
const express = require("express")
const app = express()
const cors = require("cors")
const morgan = require("morgan")
const mongoose =require("mongoose")
require('dotenv').config()
const Note = require('./models/note')



const password = process.argv[3]
// const url = `mongodb+srv://atomikx:d3AFlmFd6SzAcSgf@cluster0.ribgxny.mongodb.net/noteApp?retryWrites=true&w=majority`
const url = process.env.MONGODB_URI
// console.log('connecting to ',url) 
// mongoose.set('strictQuery',false)
// mongoose.connect(url)
// .then(result=>{
//   console.log('Connected to DB')
// }).catch((error)=>{
//   console.log('error conecting to DB',error.message)
// })

// const noteSchema = new mongoose.Schema({
//   content : String,
//   important : Boolean
// })

// const Note = mongoose.model('Note',noteSchema)
// noteSchema.set('toJSON',{
//   transform: (document,returnedDoc)=>{
//     returnedDoc.id = returnedDoc._id.toString()
//     delete returnedDoc._id
//     delete returnedDoc.__v
//   }
// })

// module.exports=mongoose.model('Note',noteSchema)
app.use(express.static('build'))
app.use(express.json())
app.use(cors())
app.use(morgan("tiny"))

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

app.get('/',(request,response)=>{
    response.send("<h1>Hello world</h1>")
})


app.get("/api/notes",(request,response)=>{
  console.log("get loggin")
  // response.json(notes)
  Note
  .find({})
  .then(notes => {
    response.json(notes)
  })
  console.log("get notes, backend log")
})
app.delete("/api/notes/:id",(request,response,next)=>{
  console.log('delete login')
  const id = request.params.id
  // console.log('delete loggin')
  Note
  .findByIdAndDelete(id)
  .then(result=>{
    response.status(204).end()
  }).catch(error=>next(error))
})


const errorHandler = (error,request,response,next) => {
  // console.error(error.message)
  if(error.name==='CastError'){
    return response.status(404).send({error:'malformated id'})
  }else if(error.name==='ValidationError'){
    return response.status(404).json({error:error.message})
  }
  // console.log("test enter error",error.name)
  // if(error.name==='ValidationError'){
  //   return response.status(404).send({error:"validation error test 222"})
  // }
  next(error)
}
app.get("/api/notes/:id",(request,response,next)=>{
  // const id = Number(request.params.id)
  Note
  .findById(request.params.id)
  .then(note=>{
    if(note){
    response.json(note)
  } else {
    response.status(404).end()
  }
  })
  .catch(error=>{
    console.log(error)
    next(error)
    // response.status(400).send({error : 'malformated id' })
    // console.log('error',error.message)
  })
})
const unknownEndpoint = (request,response)=>{
  response.status(404).send({error:"unknown endpoint"})
}



// app.get("/api/notes/:id",(request,response)=>{
//     const id = Number(request.params.id)
//     const note = notes.find((note)=>(note.id === id))
//     if(note){
//         response.json(note)
//     } else {
//         response.status(404).end()
//     }
//  })

const generateId = () =>{
  const maxId = notes.length > 0
  ? Math.max(...notes.map(n=>n.id))
  : 0
  return maxId +1
}

app.post("/api/notes",(request,response,next)=>{
  // const note = request.body
  const body = request.body
  console.log(body)
  if(!body||body.content===undefined) {
    response.status(400).json({
      error: "content missing"
    })
  }

  const note = new Note ({
    content:body.content,
    important: body.important || false,
    // id : generateId()
  })
  console.log("added,backend log")
  note
  .save()
  .then(savedNote=>{
    response.json(savedNote)  
  }).catch(error=>next(error))
  // notes = notes.concat(note)
  // response.json(note)

})


// app.delete("/api/notes/:id",(request,response)=>{
//   const id = Number(request.params.id)
//   notes = notes.filter((note)=>note.id !== id)
//   console.log("deleted")
//   response.status(204).end()

//  })

// app.lister()
// const app  = http.createServer((request,response)=>{
//     response.writeHead(200,{"Content" : "application/json"})

//     response.end(JSON.stringify(notes))
// })
app.put("/api/notes/:id",(request,response,next)=>{
  const id = request.params.id
  const {content,important} = request.body
  // const note = {
  //   content : body.content,
  //   important:body.important
  // }
  Note
  .findByIdAndUpdate(id,
    {content,important},
    {new : true, runValidators:true,context:'query'})
  .then(updatedNote=>{
    response.json(updatedNote)
  }).catch(error=>next(error))
})
app.use(errorHandler) 

app.use(unknownEndpoint)
const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`Server listening in por ${PORT}`)
})
// console.log(`server listening on ${PORT}`)

