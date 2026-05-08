import "dotenv/config";
import app, { MOCK } from "./app.ts";

const PORT = Number(process.env.PORT || 8787);

/** Vercel runs the bundled app via default export from ../index.ts — no TCP listen here. */
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Take Profit Desk API http://localhost:${PORT}`);
    // eslint-disable-next-line no-console
    if (MOCK) console.log("Using synthetic PnL/portfolio (mock). On Windows this is normal — live Zerion CLI needs WSL or macOS/Linux.");
  });
}
