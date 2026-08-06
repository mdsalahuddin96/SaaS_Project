import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    // Optional: if you don't provide a client, database transactions won't be enabled.
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      tenantId: {
        type: "string",
      },
      role: {
        type: "string",
      },
    },
  },

  // ⚠️ ১. Wildcard Subdomains ট্রাস্ট করার জন্য
  trustedOrigins: ["http://localhost:3000", "http://*.localhost:3000"],

  // ⚠️ ২. CSRF & Cross-Subdomain handling
  advanced: {
    crossSubDomainCookies: {
      enabled: false, // Subdomain-specific login এ এটি false রাখাই নিরাপদ
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: false, // Local HTTP-এর জন্য
    },
  },
});
