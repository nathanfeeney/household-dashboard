// scripts/create-users.ts
import "dotenv/config"; // loads .env.local so DATABASE_URL etc. are available
import { auth } from "../lib/auth"; // relative path — tsx won't resolve the "@/" alias

async function main() {
  await auth.api.signUpEmail({
    body: { email: "tnfeeney@hotmail.com", password: "123A56T89", name: "Nathan" },
  });

  await auth.api.signUpEmail({
    body: { email: "katrina98@live.co.uk", password: "123A56T89", name: "Katrina" },
  });

  console.log("Done");
}

main();