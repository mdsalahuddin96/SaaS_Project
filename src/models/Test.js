import mongoose from "mongoose";

const testSchema=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    age:{
        type:Number,
        require:true
    }
})

const Test=mongoose.model("Test",testSchema);
export default Test;