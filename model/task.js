
const mongoose = require('mongoose');


const taskSchema= new mongoose.Schema({
    task:Number,
    description:String
  })

const Task= mongoose.model("task",taskSchema)



module.exports=Task;




