const mongoose=require("mongoose")


const bookingSchema=new mongoose.Schema({
    tenantId:{type:mongoose.Schema.Types.ObjectId, ref:"Tenant", require:true},
    userId:{type:mongoose.Schema.Types.ObjectId, ref:"User", require:true},
    bookingDate:{type:Date, require:true},
    status:{type:String, required:true, trim:true, enum:["pending","confirmed","cancelled"], default:"pending" },
    createdAt:{type:Date, default:Date.now}
})

module.exports=mongoose.model("Booking",bookingSchema);