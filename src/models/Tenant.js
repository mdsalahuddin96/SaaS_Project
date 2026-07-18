const mongoose = require('mongoose');


const tenantSchema = new mongoose.Schema({
  name: { type: String, trim:true, required: true },
  subdomain: { type: String, required: true, unique: true, lowercase: true }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', tenantSchema);