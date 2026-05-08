import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import "dotenv/config";
import cors from "cors";
import express from "express";
import { hydrateZerionApiKeyFromFile } from "./bootstrapEnv.ts";
import { computeMock, getDeskSnapshot, performCheckpoint, performEvaluate, performExecute, summarizeDeskAuth } from "./deskActions.ts";
import { DeskPolicySchema } from "./policySchema.ts";
import { savePolicy } from "./policyStore.ts";
import { DATA_DIR, PROJECT_ROOT } from "./paths.ts";

hydrateZerionApiKeyFromFile();

mkdirSync(DATA_DIR, { recursive: true, mode: process.platform === "win32" ? undefined : 0o700 });

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "256kb" }));

const MOCK = computeMock();

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "take-profit-desk",
    zerionCliProject: summarizeDeskAuth(MOCK),
    time: new Date().toISOString(),
  });
});

app.get("/api/desk", async (_req, res) => {
  try {
    const body = await getDeskSnapshot();
    res.json(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: message });
  }
});

app.put("/api/policy", (req, res) => {
  try {
    const body = DeskPolicySchema.parse(req.body);
    savePolicy(body);
    res.json({ ok: true, policy: body });
  } catch (e) {
    res.status(400).json({
      error: e instanceof Error ? e.message : "Invalid policy body",
    });
  }
});

app.post("/api/evaluate", async (_req, res) => {
  try {
    const { portfolio, evaluation, pnl } = await performEvaluate();
    res.json({ portfolio, evaluation, pnl });
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : String(e),
    });
  }
});

app.post("/api/checkpoint", async (_req, res) => {
  try {
    const { lastCheckpointTotalGainUsd, state } = await performCheckpoint();
    res.json({ ok: true, lastCheckpointTotalGainUsd, state });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Cannot checkpoint")) {
      res.status(400).json({ error: msg });
      return;
    }
    res.status(500).json({ error: msg });
  }
});

app.post("/api/execute", async (req, res) => {
  const secret = req.header("x-execute-secret");
  try {
    const out = await performExecute(secret);

    if (!out.ok) {
      if (out.error === "Missing or invalid execute secret") {
        res.status(401).json({
          error: "Missing or invalid X-Execute-Secret (set EXECUTE_SECRET in .env)",
        });
        return;
      }
      if (out.evaluation && out.error.includes("Policy blocks")) {
        res.status(409).json({
          error: "Policy blocks execution",
          evaluation: out.evaluation,
        });
        return;
      }
      res.status(500).json({
        error: out.error,
        stderr: out.stderr,
        evaluation: out.evaluation,
      });
      return;
    }

    if (out.mock) {
      res.json({
        mock: true,
        evaluation: out.evaluation,
        result:
          typeof out.result === "object" && out.result !== null ? out.result : { executed: true },
      });
      return;
    }

    res.json({ evaluation: out.evaluation, result: out.result });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

/** Single-process demo: SERVE_STATIC — Vercel ignores express.static; there we use CDN + rewrites instead. */
const distDir = path.join(PROJECT_ROOT, "dist");
const vercel = process.env.VERCEL === "1";
if (!vercel && (process.env.SERVE_STATIC === "1" || process.env.SERVE_STATIC === "true")) {
  if (existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get(/^\/(?!api).*/, (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  } else {
    // eslint-disable-next-line no-console
    console.warn("SERVE_STATIC set but ./dist missing — run `npm run build` first.");
  }
}

export default app;
export { MOCK };
