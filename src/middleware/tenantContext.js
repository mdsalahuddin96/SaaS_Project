const Tenant = require('../models/Tenant');

const tenantContext = async (req, res, next) => {
  const host = req.headers.host; 
  const parts = host.split('.');

  // If it is a main domain without localhost or subdomains (such as onboarding or main landing pages)
  if (parts.length < 2 || parts[0] === 'localhost' || parts[0] === 'www') {
    req.tenantId = null;
    return next();
  }

  const subdomain = parts[0].toLowerCase();

  try {
    // finding tenant using subdomain
    const tenant = await Tenant.findOne({ subdomain });
    
    if (!tenant) {
      return res.status(404).json({ error: 'This organization or subdomain not found' });
    }

    // save tenantId to the request
    req.tenantId = tenant._id;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Tenant context error' });
  }
};

module.exports = tenantContext;