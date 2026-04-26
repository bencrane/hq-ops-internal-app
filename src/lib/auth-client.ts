import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_AUX_API_BASE_URL ?? "https://api.authengine.dev",
});
