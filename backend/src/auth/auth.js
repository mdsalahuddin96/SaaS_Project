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
  user:{
    additionalFields:{
      tenantId:{
        type:"string",
        required:false
      },
      role:{
        type:"string",
        defaultValue:"user"
      }
    }
  }
});