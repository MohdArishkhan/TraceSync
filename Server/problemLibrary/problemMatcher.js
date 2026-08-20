// ─────────────────────────────────────────────────────────────────────────────
//  PROBLEM MATCHER
//  Fast client-side fingerprinting — no LLM, runs in <5ms.
//  Returns { problem, score, confidence } or null.
//
//  Confidence tiers:
//    EXACT   (≥0.95) → use stored spec as-is, skip LLM entirely
//    HIGH    (≥0.80) → use stored spec, optionally let LLM fill variable names
//    MEDIUM  (≥0.65) → use stored template, call LLM for thin config only
//    LOW     (<0.65) → full LLM generation
// ─────────────────────────────────────────────────────────────────────────────

const { PROBLEMS } = require('./problemLibrary');

// ── Signal extractors ────────────────────────────────────────────────────────

const extractSignals = (code) => {
  const c = code.toLowerCase();
  return {
    // structural
    has2DArray:      /\[\s*\w+\s*\]\s*\[\s*\w+\s*\]/.test(code),
    has1DArray:      /\[\s*\w+\s*\]/.test(code) && !/\]\s*\[/.test(code),
    hasRecursion:    detectSelfCall(code),
    hasBFSQueue:     /deque|popleft|appendleft|queue\s*=|collections\.deque/.test(c),
    has4Direction:   /dx.*dy|dy.*dx|\[\s*[01-]\s*,\s*[01-]\s*\]|directions|dirs/.test(c),
    has8Direction:   /8\s*(dir|neighbor)|for.*[-1,0,1].*for.*[-1,0,1]/.test(c),
    hasHeap:         /heapq|heappush|heappop|priority.?queue/i.test(code),
    hasHashMap:      /\{\}|dict\(\)|hashmap|defaultdict|counter\(/i.test(code),
    hasStack:        /stack\s*=\s*\[|\.append|\.pop\(\)/.test(c) && !/queue/.test(c),
    hasDeque:        /deque/.test(c),
    hasLinkedList:   /\.next|listn|node\./.test(c),
    hasTreeNodes:    /\.left|\.right|treenode/i.test(code),
    hasParentArray:  /parent\s*=|rank\s*=|find\s*\(|union\s*\(/.test(c),
    hasVisitedSet:   /visited|seen/.test(c),
    hasLeftRight:    /\bleft\b.*\bright\b|\bright\b.*\bleft\b/.test(c),
    hasMidPointer:   /\bmid\b/.test(c),
    hasLowMidHigh:   /\blow\b.*\bmid\b.*\bhigh\b|\blow\b.*\bhigh\b/.test(c),
    hasDP:           /dp\s*=|\bmemo\b|cache|@lru_cache/.test(c),
    hasVisitedMutation: /grid\[.*\]\s*=|board\[.*\]\s*=|image\[.*\]\s*=/.test(code),
  };
};

const detectSelfCall = (code) => {
  const fnMatch = code.match(/def\s+(\w+)\s*\(|function\s+(\w+)\s*\(/);
  if (!fnMatch) return false;
  const name = fnMatch[1] || fnMatch[2];
  const body = code.slice(code.indexOf(fnMatch[0]) + fnMatch[0].length);
  return new RegExp(`\\b${name}\\s*\\(`).test(body);
};

const extractFunctionNames = (code) => {
  const names = [];
  // def/function/const declarations, AND class declarations (Python "class X:",
  // JS/Java "class X {") — many library problems are class-based designs
  // (MinStack, LRUCache, Trie) where the distinguishing name IS the class,
  // not any individual method inside it.
  const re = /def\s+(\w+)\s*\(|function\s+(\w+)\s*\(|const\s+(\w+)\s*=|class\s+(\w+)\s*[:({]/g;
  let m;
  while ((m = re.exec(code)) !== null) names.push(m[1] || m[2] || m[3] || m[4]);
  return names;
};

const extractKeywords = (code) => {
  const words = code.toLowerCase().match(/[a-z]{3,}/g) ?? [];
  return new Set(words);
};

// ── Scoring ──────────────────────────────────────────────────────────────────

const scoreProblem = (problem, code, codeSignals, codeFns, codeWords) => {
  const m = problem.match;
  let score = 0;
  let nameMatched = false;

  // 1. Exact function name match → strong base score, but NOT an instant
  // decision. Two different problems can share a common name (e.g. "maxArea"
  // is used by both max-area-island and container-with-most-water) — signal
  // agreement below breaks the tie instead of "whichever was defined first."
  for (const fn of (m.functions ?? [])) {
    if (codeFns.some(f => f.toLowerCase() === fn.toLowerCase())) {
      nameMatched = true;
      score += 0.55;
      break;
    }
  }

  // 2. Keyword cluster (need ≥2 of the listed keywords)
  // Capped LOWER than before (0.30, not 0.45): keyword overlap alone is weak
  // evidence — generic terms like "stack"/"push"/"pop" appear in almost any
  // stack-related code, correct or not, and must not alone approach EXACT
  // confidence. Distinguishing library entries (e.g. Min Stack needing
  // "getmin") is the real fix; this cap is the safety net for any entry
  // that isn't perfectly distinguishing.
  const kwHits = (m.keywords ?? []).filter(k => codeWords.has(k));
  if (kwHits.length >= 3) score += 0.30;
  else if (kwHits.length === 2) score += 0.20;
  else if (kwHits.length === 1) score += 0.08;

  // 3. Structural signals — capped LOWER than before (0.30, not 0.55).
  // A single boolean signal like hasStack is true for ANY stack-shaped code,
  // correct match or not — it breaks ties between name-matched candidates,
  // but must never alone (or with weak keywords) manufacture false
  // confidence. Without a name match, keywords(0.30) + signals(0.30) = 0.60
  // max, landing at MEDIUM tier — triggers a cheap LLM verification call
  // instead of blindly committing to a possibly-wrong library spec.
  const sig = m.signals ?? {};
  const sigKeys = Object.keys(sig);
  if (sigKeys.length > 0) {
    const hits = sigKeys.filter(k => sig[k] === codeSignals[k]).length;
    score += (hits / sigKeys.length) * 0.30;
  }

  return { score, reason: `kw:${kwHits.length} sig:${Object.keys(sig).length}` };
};

// ── Main export ──────────────────────────────────────────────────────────────

const matchCode = (code) => {
  if (!code?.trim()) return null;

  const signals  = extractSignals(code);
  const fns      = extractFunctionNames(code);
  const words    = extractKeywords(code);

  let best = null, bestScore = 0;

  for (const problem of PROBLEMS) {
    const { score, reason } = scoreProblem(problem, code, signals, fns, words);
    if (score > bestScore) {
      bestScore = score;
      best = { problem, score, reason };
    }
  }

  if (!best || bestScore < 0.50) return null;

  const confidence =
    bestScore >= 0.95 ? 'EXACT' :
    bestScore >= 0.80 ? 'HIGH' :
    bestScore >= 0.65 ? 'MEDIUM' : 'LOW';

  return { ...best, confidence };
};

const matchAndGetSpec = (code) => {
  const result = matchCode(code);
  if (!result) return null;
  return { vizSpec: result.problem.vizSpec, confidence: result.confidence, score: result.score, problemId: result.problem.id };
};

module.exports = { matchCode, matchAndGetSpec, extractSignals };