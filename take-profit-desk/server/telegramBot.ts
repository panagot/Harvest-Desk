/**
 * Telegram control plane for Harvest Desk (runs alongside zerion CLI + API).
 *
 * Env:
 *   TELEGRAM_BOT_TOKEN     — from @BotFather
 *   TELEGRAM_CHAT_IDS      — comma-separated numeric chat IDs (strongly recommended)
 *
 * Commands:
 *   /status, /evaluate, /checkpoint, /execute <EXECUTE_SECRET>
 */

import "dotenv/config";
import { mkdirSync } from "node:fs";
import { Telegraf } from "telegraf";
import { hydrateZerionApiKeyFromFile } from "./bootstrapEnv.ts";
import { DATA_DIR } from "./paths.ts";
import { getDeskSnapshot, performEvaluate, performExecute, performCheckpoint } from "./deskActions.ts";

hydrateZerionApiKeyFromFile();
mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
if (!token) {
  // eslint-disable-next-line no-console
  console.error("Set TELEGRAM_BOT_TOKEN in environment.");
  process.exit(1);
}

const rawAllow = process.env.TELEGRAM_CHAT_IDS?.trim();
const allowedChatIds = rawAllow
  ? new Set(
      rawAllow
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    )
  : null;

if (!allowedChatIds) {
  // eslint-disable-next-line no-console
  console.warn("[telegram] TELEGRAM_CHAT_IDS unset — any Telegram user can invoke this bot!");
}

function isAllowed(chatId: number | undefined): boolean {
  if (chatId === undefined) return false;
  if (!allowedChatIds) return true;
  return allowedChatIds.has(String(chatId));
}

function formatStatus(snapshot: Awaited<ReturnType<typeof getDeskSnapshot>>) {
  const ev = snapshot.evaluation;
  const g = ev?.pnlSnapshot;
  const lines = [
    `Mode: ${snapshot.auth.mockMode ? "mock" : "live"}`,
    g?.totalGainUsd != null ? `Total gain: $${Number(g.totalGainUsd).toFixed(2)}` : "Total gain: —",
    ev ? `Decision: ${ev.decision === "fire" ? "FIRE" : "HOLD"}` : "Decision: —",
    ev ? `Reason: ${ev.reason}` : "",
    snapshot.fetchError ? `Fetch error: ${snapshot.fetchError}` : "",
    ev?.proposedCommand ? `CLI: ${ev.proposedCommand}` : "",
  ];
  return lines.filter(Boolean).join("\n\n");
}

const bot = new Telegraf(token);

bot.use(async (ctx, next) => {
  if (!isAllowed(ctx.chat?.id)) {
    await ctx.reply("Unauthorized for this Harvest Desk deployment.");
    return;
  }
  await next();
});

bot.start(async (ctx) => {
  await ctx.reply(
    [
      "Harvest Desk — Telegram shard",
      "",
      "/status — gates + PnL snapshot",
      "/evaluate — append audit row",
      "/checkpoint — record PnL checkpoint",
      "/execute <secret> — run swap when eligible (same secret as EXECUTE_SECRET on server)",
    ].join("\n"),
  );
});

bot.command("status", async (ctx) => {
  const snap = await getDeskSnapshot();
  await ctx.reply(formatStatus(snap));
});

bot.command("evaluate", async (ctx) => {
  const { evaluation } = await performEvaluate();
  await ctx.reply(
    `Evaluate logged: ${evaluation.decision === "fire" ? "FIRE" : "HOLD"}\n${evaluation.reason}`,
  );
});

bot.command("checkpoint", async (ctx) => {
  try {
    const { lastCheckpointTotalGainUsd } = await performCheckpoint();
    await ctx.reply(`Checkpoint at total gain $${lastCheckpointTotalGainUsd!.toFixed(2)}`);
  } catch (e) {
    await ctx.reply(e instanceof Error ? e.message : String(e));
  }
});

bot.command("execute", async (ctx) => {
  const text = ctx.message && "text" in ctx.message ? ctx.message.text : "";
  const parts = text.trim().split(/\s+/).slice(1);
  const provided = parts.join(" ").trim();

  if (!provided) {
    await ctx.reply("Usage: /execute <EXECUTE_SECRET> (must match server's EXECUTE_SECRET)");
    return;
  }

  const out = await performExecute(provided);
  if (!out.ok) {
    await ctx.reply(`Error: ${out.error}`);
    return;
  }

  const hash =
    typeof out.result === "object" && out.result !== null && "tx" in out.result
      ? ((out.result as { tx?: { hash?: string } }).tx?.hash ?? "—")
      : "see CLI output / UI";

  await ctx.reply(out.mock ? `Mock swap recorded. Fake hash: ${hash}` : `Swap submitted. Tx: ${hash}`);
});

bot.launch().then(() => {
  // eslint-disable-next-line no-console
  console.log("Harvest Desk Telegram bot running.");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
