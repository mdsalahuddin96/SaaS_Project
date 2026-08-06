import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: "http://localhost:5000",

  //   new
  fetchOptions: {
    credentials: "include", // এটি বাধ্যতামূলক!
  },
  user: {
    additionalFields: {
      tenantId: { type: "string" },
      role: { type: "string" },
    },
  },
});

export const { signIn, signOut, useSession } = authClient;
