const mongoose = require("mongoose")
if(process.argv.length<3){
    console.log("enter pass as argument")
    process.exit(1)
}
const password = process.argv[2]
const url = `mongodb+srv://atomikx:${password}@cluster0.ribgxny.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    content : String,
    important : Boolean
})
const Note = mongoose.model('Note',noteSchema)
// const note = new Note({
//     content : "Html is easy2",
//     important : true 
// })
Note.find({}).then(result=>{
    result.forEach(note =>{
        console.log(note)
    })
    mongoose.connection.close()
})


// note.save().then(result =>{
//     console.log("note saved")
//     mongoose.connection.close()
// })