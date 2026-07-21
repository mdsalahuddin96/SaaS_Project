import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  MONGO_URI: z.string().url({ message: "Invalid Mongo DB URL format" }),
  // JWT_SECRET: z.string().min(8),
});

const envServer = envSchema.safeParse(process.env);

if (!envServer.success) {
  console.error("Invalid environment variables:", envServer.error.format());
  process.exit(1); 
}
const env = envServer.data;
export default env;