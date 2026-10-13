// Deterministic recovery for interrupted or drifted factory runs.
// Reconciles factory-state checkpoint/counts, writer claim leases (48h TTL)
// and seo-master-matrix rows against the immutable published article files.
// Auto-repairs only deterministic, provable drift; every other inconsistency
// is reported and the script exits non-zero for human review.
import fs from "node:fs";
import { sitePlan, publishedRecords, readJSON, writeJSON } from "./factory-core.mjs";

const CLAIM_TTL_HOURS = 48;
const now = Date.now();
const at = new Date(now).toISOString();
const { site, plan, state } = sitePlan();

let files;
try { files = publishedRecords(); }
catch (err) { console.error(JSON.stringify({ mode: "RECOVERY", at, errors: ["published record unreadable: " + String(err)] }, null, 2)); process.exit(1); }

const rowsById = new Map(plan.items.map(r => [r.id, r]));
const report = { mode: "RECOVERY", at, repaired: [], cleared: [], kept: [], errors: [] };

// 1. Published files and PUBLISHED plan rows must be exactly the same set.
const publishedRowIds = new Set(plan.items.filter(r => r.status === "PUBLISHED").map(r => r.id));
for (const f of files) if (!publishedRowIds.has(f.id)) report.errors.push("published file " + f.id + " is not PUBLISHED in editorial plan");
for (const id of publishedRowIds) if (!files.some(f => f.id === id)) report.errors.push("plan PUBLISHED row " + id + " has no published file");
for (const f of files) {
  const row = rowsById.get(f.id);
  if (row && f.path !== row.outputPath) report.errors.push("published path drift " + f.id + ": " + f.path + " != " + row.outputPath);
  if (f.role !== "SUPPORT") report.errors.push("published file " + f.id + " must have role SUPPORT");
}

// 2. Repair deterministic checkpoint / count drift from the published files.
if (state.publishedCount !== files.length) {
  report.repaired.push("publishedCount " + state.publishedCount + " -> " + files.length);
  state.publishedCount = files.length;
}
const last = files.at(-1) || null;
const lastRow = last ? rowsById.get(last.id) : null;
const expectedCheckpoint = {
  lastArticleId: last ? last.id : null,
  lastBatch: lastRow ? lastRow.batch : null,
  updatedAt: state.checkpoint?.updatedAt || null
};
const ck = state.checkpoint || {};
if (ck.lastArticleId !== expectedCheckpoint.lastArticleId || ck.lastBatch !== expectedCheckpoint.lastBatch) {
  report.repaired.push("checkpoint " + JSON.stringify(ck.lastArticleId) + " -> " + JSON.stringify(expectedCheckpoint.lastArticleId));
  state.checkpoint = { ...expectedCheckpoint, updatedAt: at };
}
for (const row of plan.items) if (row.status === "PUBLISHED" && !row.datePublished) {
  const f = files.find(x => x.id === row.id);
  if (f?.publishedAt) { row.datePublished = f.publishedAt; report.repaired.push("datePublished restored for " + row.id); }
}

// 3. Writer claim leases: drop stale entries, validate the rest.
const keptClaims = [];
for (const entry of state.claimed || []) {
  const claim = typeof entry === "string" ? { id: entry } : entry;
  const id = claim?.id;
  if (typeof id !== "string" || !/^HI\d{4}$/.test(id) || !plan.items.some(r => r.id === id && r.status !== "PUBLISHED")) {
    report.errors.push("invalid writer claim entry " + JSON.stringify(entry));
    continue;
  }
  if (keptClaims.some(k => (typeof k === "string" ? k : k.id) === id)) { report.errors.push("duplicate writer claim " + id); continue; }
  if (claim.claimedAt != null) {
    const claimedMs = Date.parse(claim.claimedAt);
    if (Number.isNaN(claimedMs)) { report.errors.push("claim " + id + " has invalid claimedAt"); continue; }
    const ageHours = (now - claimedMs) / 3.6e6;
    if (ageHours > CLAIM_TTL_HOURS) { report.cleared.push("stale claim " + id + " expired after " + ageHours.toFixed(1) + "h"); continue; }
  }
  keptClaims.push(entry);
}
if ((state.claimed || []).length !== keptClaims.length) state.claimed = keptClaims;
report.kept = keptClaims.map(k => (typeof k === "string" ? k : k.id));

// 4. seo-master-matrix: restore missing SUPPORT rows for published articles.
const matrix = readJSON("data/seo-master-matrix.json");
const slugs = new Set(matrix.map(m => m.slug));
if (slugs.size !== matrix.length) report.errors.push("seo-master-matrix contains duplicate slugs");
for (const f of files) {
  if (!slugs.has(f.path)) {
    const row = rowsById.get(f.id);
    matrix.push({ url: site.baseUrl + f.path, slug: f.path, language: "hi-IN", keyword: f.title, role: "SUPPORT", parent: f.parentSilo, searchIntent: row?.searchIntent ?? "", status: "PUBLISHED", decision: "KEEP", published: true, gscEvidence: null, collisionStatus: "PASSED_AUTOMATED_QA", nextAction: "MONITOR_PERFORMANCE" });
    report.repaired.push("seo-master-matrix row restored for " + f.id);
    slugs.add(f.path);
  }
}
const publishedPaths = new Set(files.map(f => f.path));
for (const m of matrix) if (m.role === "SUPPORT" && m.published === true && !publishedPaths.has(m.slug))
  report.errors.push("matrix SUPPORT row " + m.slug + " claims published but no article file exists");

// 5. A leftover transactionPending flag may only be cleared on a verified-consistent repo.
if (state.transactionPending === true) {
  if (report.errors.length === 0) { report.cleared.push("transactionPending reset after consistent verification"); state.transactionPending = false; }
  else report.errors.push("transactionPending is set and repo is inconsistent; manual review required");
}

if (report.errors.length) {
  console.error(JSON.stringify({ ...report, repaired: [], cleared: [] }, null, 2));
  console.error("RECOVERY_BLOCKED: nothing was modified; resolve errors above and rerun.");
  process.exit(1);
}
const stateChanged = report.repaired.some(r => r.startsWith("publishedCount") || r.startsWith("checkpoint")) || report.cleared.length > 0;
const planChanged = report.repaired.some(r => r.startsWith("datePublished"));
const matrixChanged = report.repaired.some(r => r.startsWith("seo-master-matrix"));
if (stateChanged) { state.updatedAt = at; writeJSON("data/factory-state.json", state); }
if (planChanged) writeJSON("data/editorial-plan.json", plan);
if (matrixChanged) writeJSON("data/seo-master-matrix.json", matrix);
report.changed = stateChanged || planChanged || matrixChanged;
console.log("RECOVERY_REPORT", JSON.stringify(report));
if (!report.changed) console.log("No factory drift detected; working tree unchanged.");
