const mongoose = require('mongoose')
// require('dotenv').config()


mongoose.set('strictQuery',false)
const url = process.env.MONGODB_URI

mongoose.connect(url)
.then(result=>{
    console.log('Connected to ',url)
}).catch(error=>{
    console.log('Error connecting',error.message)
})

const noteSchema = new mongoose.Schema({
    content:{
        type:String,
        minLength:5,
        required:true
    },
    important:Boolean
})

noteSchema.set('toJSON',{
    transform:(document,returnedDoc)=>{
        returnedDoc.id = returnedDoc._id.toString()
        delete returnedDoc._id
        delete returnedDoc.__v
    }
})

module.exports = mongoose.model('Note',noteSchema)