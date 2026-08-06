import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import env from "../config/env.js";
const client = new MongoClient(env.MONGO_URI);

await client.connect();

const db = client.db("saas_booking");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      tenantId: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },

  // new
  trustedOrigins: ["http://localhost:3000", "http://*.localhost:3000"],
  // trustedOrigins: ["http://lvh.me:3000", "http://*.lvh.me:3000"],
  
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: "lvh.me", // এখানে সামনে ডট দেওয়া লাগবে না, Better Auth নিজে হ্যান্ডেল করবে
    },
  },
});
