// console.log('hello world')
// const http = require('http')
const express = require("express")
const app = express()
const cors = require("cors")
const morgan = require("morgan")

app.use(express.json())
app.use(cors())
app.use(express.static('build'))
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
  response.json(notes)
  console.log("get notes, backend log")
})
app.get("/api/notes/:id",(request,response)=>{
    const id = Number(request.params.id)
    const note = notes.find((note)=>(note.id === id))
    if(note){
        response.json(note)
    } else {
        response.status(404).end()
    }
 })





const generateId = () =>{
  const maxId = notes.length > 0
  ? Math.max(...notes.map(n=>n.id))
  : 0
  return maxId +1
}



app.post("/api/notes",(request,response)=>{
  // const note = request.body
  const body = request.body
  console.log(body)
  if(!body) {
    response.status(400).json({
      error: "content missing"
    })
  }

  const note = {
    content:body.content,
    important: body.important || false,
    id : generateId()
  }
  console.log("added,backend log")
  notes = notes.concat(note)
  response.json(note)

})

app.delete("/api/notes/:id",(request,response)=>{
  const id = Number(request.params.id)
  notes = notes.filter((note)=>note.id !== id)
  console.log("deleted")
  response.status(204).end()

 })

// app.lister()
// const app  = http.createServer((request,response)=>{
//     response.writeHead(200,{"Content" : "application/json"})

//     response.end(JSON.stringify(notes))
// })

const PORT = process.env.PORT || 3001
app.listen(PORT,()=>{
    console.log(`Server listening in por ${PORT}`)
})
// console.log(`server listening on ${PORT}`)