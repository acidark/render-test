const mongoose = require('mongoose')
if(process.argv.length<3){
  console.log('enter pass as argument')
  process.exit(1)
}
const password = process.argv[2]
// const url = `mongodb+srv://atomikx:${password}@cluster0.ribgxny.mongodb.net/noteApp?retryWrites=true&w=majority`
const TEST_MONGODB_URI = `mongodb+srv://atomikx:${password}@cluster0.ribgxny.mongodb.net/testNoteApp?retryWrites=true&w=majority`
mongoose.set('strictQuery',false)
// mongoose.connect(url)
mongoose.connect(TEST_MONGODB_URI)
const noteSchema = new mongoose.Schema({
  content : String,
  date : Date,
  important : Boolean
})
const Note = mongoose.model('Note',noteSchema)
const note = new Note({
  content : 'Html is easy2',
  date : new Date(),
  important : true
})

Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})


note.save().then(() => {
  console.log('note saved')
  mongoose.connection.close()
})