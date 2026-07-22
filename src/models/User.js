// const mongoose = require('mongoose');
import mongoose from "mongoose";
const userSchema = new mongoose.Schema({},{
  collection:"user",
  strict:false
});

//Security trick: Emails cannot be duplicated under the same tenant
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
const User=mongoose.model('User', userSchema);
export default User;