// const mongoose = require('mongoose');
import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  name: { type: String, trim:true, required: true },
  subdomain: { type: String, required: true, unique: true, lowercase: true }, 
  createdAt: { type: Date, default: Date.now }
});
const Tenant=mongoose.model('Tenant', tenantSchema);
export default Tenant;