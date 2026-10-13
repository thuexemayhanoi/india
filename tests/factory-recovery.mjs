// Recovery test operates ONLY in a disposable temp repo fixture. Never alters production.
// Simulates interrupted factory runs and verifies deterministic reconciliation.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const root = process.cwd();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "hi-recovery-test-"));
function run(script, opts = {}) {
  try { return execFileSync(process.execPath, [script], { cwd: temp, encoding: "utf8" }); }
  catch (err) { if (opts.allowFail) return err.stdout + "\n" + err.stderr; throw err; }
}
try {
  fs.cpSync(path.join(root, "scripts"), path.join(temp, "scripts"), { recursive: true });
  fs.cpSync(path.join(root, "data"), path.join(temp, "data"), { recursive: true });
  fs.mkdirSync(path.join(temp, "content/published"), { recursive: true });
  const planPath = path.join(temp, "data/editorial-plan.json");
  const statePath = path.join(temp, "data/factory-state.json");
  const matrixPath = path.join(temp, "data/seo-master-matrix.json");
  const site = JSON.parse(fs.readFileSync(path.join(temp, "data/site.json"), "utf8"));
  const reset = () => {
    const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
    for (const item of plan.items) { item.status = "PLANNED"; item.datePublished = null; }
    fs.writeFileSync(planPath, JSON.stringify(plan, null, 2) + "\n");
    fs.writeFileSync(statePath, JSON.stringify({ phase: "AUTO_PUBLISH_READY", version: 2, enabled: true, writerEnabled: true, autoPublish: true, publishedCount: 0, checkpoint: { lastArticleId: null, lastBatch: null, updatedAt: null }, claimed: [], immutablePublishedUrls: true, transactionPending: false, updatedAt: null, notes: "fixture" }, null, 2) + "\n");
    const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
    fs.writeFileSync(matrixPath, JSON.stringify(matrix.filter(m => m.role !== "SUPPORT"), null, 2) + "\n");
    for (const f of fs.readdirSync(path.join(temp, "content/published"))) fs.rmSync(path.join(temp, "content/published", f));
  };
  const publishFixture = (ids) => {
    const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
    const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
    const when = new Date().toISOString();
    for (const id of ids) {
      const row = plan.items.find(r => r.id === id);
      row.status = "PUBLISHED"; row.datePublished = when;
      fs.writeFileSync(path.join(temp, "content/published", id + ".json"), JSON.stringify({ id, title: row.title, path: row.outputPath, parentSilo: row.parentSilo, parentHub: row.parentHub, role: "SUPPORT", lead: "fixture", publishedAt: when }, null, 2) + "\n");
      matrix.push({ url: site.baseUrl + row.outputPath, slug: row.outputPath, language: "hi-IN", keyword: row.title, role: "SUPPORT", parent: row.parentSilo, searchIntent: row.searchIntent, status: "PUBLISHED", decision: "KEEP", published: true, gscEvidence: null, collisionStatus: "PASSED_AUTOMATED_QA", nextAction: "MONITOR_PERFORMANCE" });
    }
    fs.writeFileSync(planPath, JSON.stringify(plan, null, 2) + "\n");
    fs.writeFileSync(matrixPath, JSON.stringify(matrix, null, 2) + "\n");
    return ids;
  };

  // Scenario 1: clean run interrupted before checkpoint update (state stale, files committed).
  reset();
  publishFixture(["HI0001", "HI0002"]);
  let out = run("scripts/factory-recovery.mjs");
  let state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  assert.equal(state.publishedCount, 2, "recovery must repair publishedCount");
  assert.equal(state.checkpoint.lastArticleId, "HI0002", "recovery must repair checkpoint");
  assert.equal(state.checkpoint.lastBatch, "B01");
  out = run("scripts/factory-recovery.mjs");
  assert.ok(out.includes("No factory drift detected"), "recovery must be idempotent: " + out);
  run("scripts/factory-preflight.mjs");
  console.log("RECOVERY TEST 1 PASS: stale checkpoint after interruption reconciled, idempotent, preflight green");

  // Scenario 2: transactionPending left true on a consistent repo must be cleared.
  state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  state.transactionPending = true;
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n");
  out = run("scripts/factory-recovery.mjs");
  state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  assert.equal(state.transactionPending, false, "consistent repo must clear transactionPending");
  console.log("RECOVERY TEST 2 PASS: leftover transactionPending cleared on verified-consistent repo");

  // Scenario 3: writer claim leases — stale claims expire, fresh claims are kept.
  const staleAt = new Date(Date.now() - 72 * 3.6e6).toISOString();
  const freshAt = new Date(Date.now() - 1 * 3.6e6).toISOString();
  state.claimed = [{ id: "HI0005", claimedAt: staleAt, by: "writer-a" }, { id: "HI0006", claimedAt: freshAt, by: "writer-a" }, "HI0007"];
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n");
  run("scripts/factory-recovery.mjs");
  state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  assert.deepEqual(state.claimed.map(c => c.id || c), ["HI0006", "HI0007"], "stale lease must expire, fresh lease must survive");
  run("scripts/factory-preflight.mjs");
  console.log("RECOVERY TEST 3 PASS: 48h claim lease TTL enforced, preflight validates lease shape");

  // Scenario 4: missing matrix SUPPORT rows are restored deterministically.
  const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
  const filtered = matrix.filter(m => m.slug !== plan0(planPath, "HI0002"));
  fs.writeFileSync(matrixPath, JSON.stringify(filtered, null, 2) + "\n");
  run("scripts/factory-recovery.mjs");
  const restored = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
  assert.ok(restored.some(m => m.slug === plan0(planPath, "HI0002")), "missing matrix row must be restored");
  run("scripts/factory-preflight.mjs");
  console.log("RECOVERY TEST 4 PASS: seo-master-matrix SUPPORT rows restored from published files");

  // Scenario 5: data-loss inconsistency must block, never auto-repair.
  reset();
  publishFixture(["HI0001", "HI0002"]);
  fs.rmSync(path.join(temp, "content/published", "HI0002.json"));
  const before = fs.readFileSync(statePath, "utf8");
  out = run("scripts/factory-recovery.mjs", { allowFail: true });
  assert.ok(out.includes("RECOVERY_BLOCKED"), "orphan PUBLISHED row must block recovery");
  assert.equal(fs.readFileSync(statePath, "utf8"), before, "blocked recovery must not mutate factory state");
  console.log("RECOVERY TEST 5 PASS: inconsistent repo blocks with error, state untouched");

  // Scenario 6: future-dated claim is rejected by preflight lease validation.
  reset();
  state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  state.claimed = [{ id: "HI0003", claimedAt: new Date(Date.now() + 3.6e7).toISOString() }];
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n");
  out = run("scripts/factory-preflight.mjs", { allowFail: true });
  assert.ok(out.includes("in the future"), "future claim timestamp must fail preflight");
  console.log("RECOVERY TEST 6 PASS: future-dated lease rejected by preflight");
  console.log("RECOVERY INTEGRATION PASS: interrupted-run reconciliation verified end to end");
} finally { process.chdir(root); fs.rmSync(temp, { recursive: true, force: true }); }
function plan0(planPath, id) {
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  return plan.items.find(r => r.id === id).outputPath;
}
