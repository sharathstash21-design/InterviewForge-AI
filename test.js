/**
 * InterviewForge AI — Unit Tests
 * Run with: npx jest test.js
 *
 * Tests cover: grading logic, CSV generation, answer parsing,
 * API response parsing, and input validation.
 */

// ─── Mock browser globals ─────────────────────────────────
global.sessionStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = v; },
  removeItem(k) { delete this._store[k]; },
};

global.CONFIG = {
  GEMINI_API_KEY: "",
  GEMINI_MODEL: "gemini-2.0-flash",
  GEMINI_ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models/",
  SHEETS_API_KEY: "",
  SPREADSHEET_ID: "",
};

// ─── Inline helpers (mirror app.js pure functions) ────────
function gradeLabel(score) {
  if (score >= 85) return "🏆 Excellent — You're interview-ready!";
  if (score >= 70) return "👍 Good — A few more practice rounds and you're set";
  if (score >= 50) return "📈 Developing — Keep practising, you're improving";
  return "💪 Needs work — Review fundamentals and try again";
}

function parseGeminiScore(raw) {
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    const scoreMatch = raw.match(/"score"\s*:\s*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
    return {
      score,
      strengths: "You provided a response to the question.",
      improvements: "Try to be more specific with examples from your experience.",
      sample: "A strong answer would include concrete examples.",
    };
  }
}

function buildCSVRow(date, role, level, qNum, question, answer, score, strengths, improvements) {
  return [date, role, level, qNum, `"${question}"`, `"${answer}"`, score, `"${strengths}"`, `"${improvements}"`].join(",");
}

function validateSetup(role, numQuestions) {
  const errors = [];
  if (!role || role.trim().length < 2) errors.push("Role must be at least 2 characters.");
  if (numQuestions < 1 || numQuestions > 20) errors.push("Number of questions must be between 1 and 20.");
  return errors;
}

function averageScore(scores) {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function parseQuestionList(raw) {
  return raw
    .split("\n")
    .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim())
    .filter((l) => l.length > 10);
}

// ─── TESTS ────────────────────────────────────────────────

describe("gradeLabel()", () => {
  test("returns Excellent for score >= 85", () => {
    expect(gradeLabel(85)).toContain("Excellent");
    expect(gradeLabel(100)).toContain("Excellent");
  });

  test("returns Good for score 70–84", () => {
    expect(gradeLabel(70)).toContain("Good");
    expect(gradeLabel(84)).toContain("Good");
  });

  test("returns Developing for score 50–69", () => {
    expect(gradeLabel(50)).toContain("Developing");
    expect(gradeLabel(69)).toContain("Developing");
  });

  test("returns Needs work for score < 50", () => {
    expect(gradeLabel(0)).toContain("Needs work");
    expect(gradeLabel(49)).toContain("Needs work");
  });
});

describe("parseGeminiScore()", () => {
  test("parses valid JSON from Gemini response", () => {
    const raw = `{"score": 78, "strengths": "Good structure", "improvements": "Add examples", "sample": "Better answer here"}`;
    const result = parseGeminiScore(raw);
    expect(result.score).toBe(78);
    expect(result.strengths).toBe("Good structure");
  });

  test("handles JSON wrapped in markdown code fences", () => {
    const raw = "```json\n{\"score\": 65, \"strengths\": \"Clear\", \"improvements\": \"More depth\", \"sample\": \"Use STAR\"}\n```";
    const result = parseGeminiScore(raw);
    expect(result.score).toBe(65);
  });

  test("falls back gracefully on malformed JSON", () => {
    const raw = `Sorry, I can't score this. "score": 40`;
    const result = parseGeminiScore(raw);
    expect(result.score).toBe(40);
    expect(result.strengths).toBeTruthy();
    expect(result.improvements).toBeTruthy();
  });

  test("returns score 50 when no score found in fallback", () => {
    const raw = "Completely invalid response with no JSON";
    const result = parseGeminiScore(raw);
    expect(result.score).toBe(50);
  });
});

describe("validateSetup()", () => {
  test("accepts valid role and question count", () => {
    const errors = validateSetup("Frontend Developer", 5);
    expect(errors).toHaveLength(0);
  });

  test("rejects empty role", () => {
    const errors = validateSetup("", 5);
    expect(errors.length).toBeGreaterThan(0);
  });

  test("rejects single character role", () => {
    const errors = validateSetup("A", 5);
    expect(errors.length).toBeGreaterThan(0);
  });

  test("rejects 0 questions", () => {
    const errors = validateSetup("Developer", 0);
    expect(errors.length).toBeGreaterThan(0);
  });

  test("rejects more than 20 questions", () => {
    const errors = validateSetup("Developer", 21);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("averageScore()", () => {
  test("calculates correct average", () => {
    expect(averageScore([60, 80, 100])).toBe(80);
  });

  test("handles single score", () => {
    expect(averageScore([75])).toBe(75);
  });

  test("returns 0 for empty array", () => {
    expect(averageScore([])).toBe(0);
  });

  test("rounds correctly", () => {
    expect(averageScore([66, 67])).toBe(67);
  });
});

describe("parseQuestionList()", () => {
  test("parses numbered question list from Gemini", () => {
    const raw = `1. What is the difference between null and undefined in JavaScript?
2. Explain the concept of closures with an example.
3. How does event delegation work in the DOM?`;
    const questions = parseQuestionList(raw);
    expect(questions).toHaveLength(3);
    expect(questions[0]).toContain("null and undefined");
    expect(questions[0]).not.toMatch(/^\d+\./);
  });

  test("filters out short/empty lines", () => {
    const raw = `1. What is React?\n\n\n2. Short\n3. Describe the virtual DOM reconciliation process in React in detail.`;
    const questions = parseQuestionList(raw);
    expect(questions.every((q) => q.length > 10)).toBe(true);
  });

  test("handles period and parenthesis numbering styles", () => {
    const raw = `1) Explain async/await versus Promises in JavaScript.\n2. What is the event loop?`;
    const questions = parseQuestionList(raw);
    expect(questions[0]).not.toMatch(/^1[\)\.]/);
    expect(questions).toHaveLength(2);
  });
});

describe("buildCSVRow()", () => {
  test("builds correct CSV row structure", () => {
    const row = buildCSVRow("2024-01-01", "Developer", "mid", "Q1", "What is JS?", "A scripting language", 80, "Good", "Add more");
    expect(row).toContain("Developer");
    expect(row).toContain("80");
    expect(row).toContain('"What is JS?"');
  });

  test("wraps fields with commas in quotes", () => {
    const row = buildCSVRow("2024-01-01", "Dev", "mid", "Q1", "Q with, comma", "Answer", 50, "OK", "Try harder");
    expect(row).toContain('"Q with, comma"');
  });
});
