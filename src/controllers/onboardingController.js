
import { auth } from "../auth/auth.js";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js"
export const registerTenant = async (req, res) => {
  const { orgName, subdomain, adminName, adminEmail, password } = req.body;

  //input validation
  if (!orgName || !subdomain || !adminName || !adminEmail || !password) {
    return res.status(400).json({ error: 'All field are not fill up!'});
  }

  // checking valid subdomain format
  const cleanSubdomain = subdomain.toLowerCase().trim();
  const subdomainRegex = /^[a-z0-9-]+$/;
  if (!subdomainRegex.test(cleanSubdomain)) {
    return res.status(400).json({ error: 'subdomain contain only lowercase, number and (-)' });
  }

  try {
    // Check is this domain already exist on the tenant
    const existingTenant = await Tenant.findOne({ subdomain: cleanSubdomain });
    if (existingTenant) {
      return res.status(400).json({ error: 'This subdomain already used by other.Try with new one!' });
    }

    //create new tenant (organization)
    const newTenant = await Tenant.create({
      name: orgName,
      subdomain: cleanSubdomain
    });

    // create admin user under this tenant
    const authResult=await auth.api.signUpEmail({
        body:{
            name:adminName,
            email:adminEmail,
            password:password,
            tenantId:newTenant._id.toString(),
            role:"admin"
        }
    })

    // successful response and redirect url to dashboard
    const redirectUrl = `http://${newTenant.subdomain}.localhost:3000/dashboard`;
    res.status(201).json({
      message: 'Onboarding Successful',
      tenant: {
        id: newTenant._id,
        name: newTenant.name,
        subdomain: newTenant.subdomain
      },
      admin: {
        id: authResult.user.id,
        email: authResult.user.email
      },
      redirectUrl
    });

  } catch (error) {
    console.error('Onboarding Error:', error);
    res.status(500).json({ error: 'Server encountered an error. Filed Onboarding!' });
  }
};

