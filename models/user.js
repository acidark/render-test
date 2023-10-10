const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  notes : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Note'
    }
  ],
  username : {
    type:String,
    required:true,
    unique:true
  },
  name : String,
  passwordHash : String,

})
userSchema.set('toJSON',{
  transform:(document,newDoc) => {
    newDoc.id = newDoc._id.toString()
    delete newDoc._id
    delete newDoc.__v
    delete newDoc.passwordHash
  }
})
userSchema.plugin(uniqueValidator)
module.exports = mongoose.model('User',userSchema)
