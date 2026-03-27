/**
 * Generate realistic seed content using local Ollama (qwen3.5:4b).
 *
 * Usage: bun run scripts/generate-seed-content.ts
 *
 * Prerequisites:
 * - Ollama running locally (http://localhost:11434)
 * - qwen3.5:4b model pulled: ollama pull qwen3.5:4b
 *
 * Output: scripts/seed-content.json
 */

import { writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "qwen3.5:4b";
const OUTPUT_PATH = join(import.meta.dir, "seed-content.json");

// Countries weighted for garment/supply chain industry
const COUNTRIES = [
  { name: "Vietnam", weight: 30 },
  { name: "Bangladesh", weight: 20 },
  { name: "Cambodia", weight: 15 },
  { name: "China", weight: 10 },
  { name: "India", weight: 10 },
  { name: "Indonesia", weight: 5 },
  { name: "Thailand", weight: 3 },
  { name: "Myanmar", weight: 2 },
  { name: "Ethiopia", weight: 2 },
  { name: "Sri Lanka", weight: 1 },
  { name: "Pakistan", weight: 1 },
  { name: "Philippines", weight: 1 },
];

const CASE_TYPES = [
  "Harassment",
  "Wage Theft",
  "Safety Violation",
  "Forced Labor",
  "Child Labor",
  "Discrimination",
  "Working Hours Violation",
  "Environmental Violation",
];

const COURSE_CATEGORIES = [
  "Workplace Safety",
  "Labor Rights",
  "Health & Hygiene",
  "Environmental Compliance",
  "Anti-Harassment",
  "Fire Safety",
  "Chemical Handling",
  "Worker Welfare",
  "Quality Assurance",
  "Management Training",
];

const NATIVE_LANGUAGES = ["Vietnamese", "Bengali", "Khmer", "Mandarin Chinese", "Hindi"];

// ─── Ollama Helper ─────────────────────────────────────────

async function ollamaJSON(prompt: string, retries = 3): Promise<Record<string, unknown>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
          think: false,
          format: "json",
          stream: false,
          options: { temperature: 0.9 },
        }),
      });
      if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
      const data = await res.json();
      let text = (data.message?.content as string) || "";
      // Strip markdown fences if present
      text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      return JSON.parse(text) as Record<string, unknown>;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`  Retry ${attempt + 1}...`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("ollamaJSON: all retries exhausted");
}

/** Extract first array of strings from a JSON object regardless of key name */
function extractStrings(obj: Record<string, unknown>): string[] {
  if (Array.isArray(obj)) return obj.filter((x: unknown) => typeof x === "string") as string[];
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === "string") return val as string[];
      // Array of objects - try to extract name/text property
      if (val.length > 0 && typeof val[0] === "object") {
        const extracted = val.map((item: unknown) => {
          if (typeof item === "string") return item;
          const record = item as Record<string, unknown>;
          return (record.name || record.text || record.title || record.value || JSON.stringify(item)) as string;
        });
        if (extracted.every((x: unknown) => typeof x === "string")) return extracted;
      }
    }
  }
  // Concatenate all string arrays
  const all: string[] = [];
  for (const val of Object.values(obj)) {
    if (Array.isArray(val)) all.push(...val.filter((x): x is string => typeof x === "string"));
    else if (typeof val === "string") all.push(val);
  }
  return all;
}

function progress(label: string, current: number, total: number) {
  const pct = Math.round((current / total) * 100);
  const bar = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
  process.stdout.write(`\r  [${bar}] ${pct}% ${label} (${current}/${total})`);
  if (current === total) console.log();
}

// ─── Content Types ─────────────────────────────────────────

interface SeedContent {
  factoryNames: Array<{ name: string; country: string }>;
  workerFirstNames: string[];
  workerLastNames: string[];
  grievanceMessages: Record<string, string[]>;
  surveyQuestionTitles: string[];
  surveyScoreOptionSets: Array<{ options: Array<{ label: string; weight: number }> }>;
  surveyFreeTextResponses: string[];
  coursesByCategory: Record<string, Array<{ name: string; summary: string }>>;
}

// ─── Generators ────────────────────────────────────────────

async function generateFactoryNames(): Promise<Array<{ name: string; country: string }>> {
  const allNames: Array<{ name: string; country: string }> = [];

  const large = COUNTRIES.filter((c) => c.weight >= 10);
  const small = COUNTRIES.filter((c) => c.weight < 10);

  // Each batch tracks which country(ies) it covers
  interface Batch { label: string; countries: string; count: number; countryList: Array<{ name: string; weight: number }> }
  const batches: Batch[] = [];

  for (const c of large) {
    batches.push({ label: c.name, countries: c.name, count: Math.round((c.weight / 100) * 200), countryList: [c] });
  }
  const smallCount = small.reduce((s, c) => s + Math.max(2, Math.round((c.weight / 100) * 200)), 0);
  batches.push({ label: "Others", countries: small.map((c) => c.name).join(", "), count: smallCount, countryList: small });

  const totalTarget = 200;
  const currentTotal = batches.reduce((s, b) => s + b.count, 0);
  batches[0].count += totalTarget - currentTotal;

  let done = 0;
  for (const batch of batches) {
    const perCall = 20;
    const calls = Math.ceil(batch.count / perCall);
    // Build weighted country cycle for multi-country batches ("Others")
    const countryCycle: string[] = [];
    if (batch.countryList.length > 1) {
      for (const c of batch.countryList) {
        const n = Math.max(2, Math.round((c.weight / 100) * 200));
        for (let j = 0; j < n; j++) countryCycle.push(c.name);
      }
    }
    let cycleIdx = 0;

    for (let i = 0; i < calls; i++) {
      const n = Math.min(perCall, batch.count - i * perCall);
      const result = await ollamaJSON(
        `Generate a JSON object: {"names": ["name1", "name2", ...]} with exactly ${n} unique garment/textile factory names based in ${batch.countries}. Use local naming conventions + English words like "Garment", "Textile", "Apparel", "Manufacturing", "Industries", "Co., Ltd."`,
      );
      for (const name of extractStrings(result).slice(0, n)) {
        const country = batch.countryList.length === 1
          ? batch.countryList[0].name
          : countryCycle[cycleIdx++ % countryCycle.length];
        allNames.push({ name, country });
      }
      done += n;
      progress("Factory names", Math.min(done, totalTarget), totalTarget);
    }
  }
  return allNames.slice(0, totalTarget);
}

async function generateWorkerNames(): Promise<{ firstNames: string[]; lastNames: string[] }> {
  const allFirst: string[] = [];
  for (let i = 0; i < 6; i++) {
    const result = await ollamaJSON(
      `Generate JSON: {"names": ["name1", "name2", ...]} with exactly 50 unique English first names. Mix 60% female, 40% male. Batch ${i + 1}/6 — all different names.`,
    );
    allFirst.push(...extractStrings(result));
    progress("First names", (i + 1) * 50, 300);
  }

  const lastResult = await ollamaJSON(
    `Generate JSON: {"names": ["name1", "name2", ...]} with exactly 100 unique English last names/surnames. Mix of origins.`,
  );
  const allLast = extractStrings(lastResult);

  return {
    firstNames: [...new Set(allFirst)].slice(0, 300),
    lastNames: [...new Set(allLast)].slice(0, 100),
  };
}

async function generateGrievanceMessages(): Promise<Record<string, string[]>> {
  const messages: Record<string, string[]> = {};
  let done = 0;
  const total = CASE_TYPES.length * 2;

  for (const caseType of CASE_TYPES) {
    const enResult = await ollamaJSON(
      `Generate JSON: {"messages": ["msg1", "msg2", ...]} with exactly 10 unique worker grievance messages about "${caseType}" at a garment factory. Each 2-4 sentences, worker's perspective. Vary tone.`,
    );
    done++;
    progress("Grievance messages", done, total);

    const lang = NATIVE_LANGUAGES[done % NATIVE_LANGUAGES.length];
    const nativeResult = await ollamaJSON(
      `Generate JSON: {"messages": ["msg1", "msg2", ...]} with exactly 5 worker grievance messages about "${caseType}" written in ${lang} language using ${lang} script/characters. 2-4 sentences, worker perspective.`,
    );
    done++;
    progress("Grievance messages", done, total);

    messages[caseType] = [
      ...extractStrings(enResult).slice(0, 10),
      ...extractStrings(nativeResult).slice(0, 5),
    ];
  }
  return messages;
}

async function generateSurveyQuestions(): Promise<string[]> {
  const allQ: string[] = [];
  for (let i = 0; i < 2; i++) {
    const result = await ollamaJSON(
      `Generate JSON: {"questions": ["q1", "q2", ...]} with exactly 25 unique survey questions for garment factory worker satisfaction. Topics: safety, management, compensation, conditions, benefits, training, feedback. Batch ${i + 1}/2.`,
    );
    allQ.push(...extractStrings(result));
    progress("Survey questions", (i + 1) * 25, 50);
  }
  return [...new Set(allQ)].slice(0, 50);
}

async function generateSurveyScoreOptionSets(): Promise<
  Array<{ options: Array<{ label: string; weight: number }> }>
> {
  const result = await ollamaJSON(
    `Generate JSON: {"sets": [{"options": [{"label": "text", "weight": number}, ...]}, ...]} with exactly 10 scored survey option sets.
4-option sets use weights: 100, 75, 50, 25. 5-option sets use weights: 100, 80, 60, 40, 20.
Mix 5 sets of 4-options and 5 sets of 5-options. Each set has different wording: satisfaction, agreement, frequency, quality, likelihood, confidence, safety, effectiveness.`,
  );

  const raw = result.sets || Object.values(result)[0];
  if (!Array.isArray(raw) || raw.length === 0) return getDefaultOptionSets();

  type OptionSet = { options: Array<{ label: string; weight: number }> };

  const parsed = raw.map((s: unknown): OptionSet | null => {
    const set = s as Record<string, unknown>;
    const opts = set.options || Object.values(set)[0];
    if (!Array.isArray(opts)) return null;
    return {
      options: opts.map((o: unknown) => {
        const opt = o as Record<string, unknown>;
        return {
          label: (opt.label || opt.text || String(o)) as string,
          weight: typeof opt.weight === "number" ? opt.weight : ((opt.score || opt.value || 50) as number),
        };
      }),
    };
  }).filter((x): x is OptionSet => x !== null);

  return parsed.length >= 5 ? parsed : getDefaultOptionSets();
}

function getDefaultOptionSets() {
  return [
    { options: [{ label: "Very Satisfied", weight: 100 }, { label: "Satisfied", weight: 75 }, { label: "Neutral", weight: 50 }, { label: "Dissatisfied", weight: 25 }] },
    { options: [{ label: "Strongly Agree", weight: 100 }, { label: "Agree", weight: 80 }, { label: "Neutral", weight: 60 }, { label: "Disagree", weight: 40 }, { label: "Strongly Disagree", weight: 20 }] },
    { options: [{ label: "Excellent", weight: 100 }, { label: "Good", weight: 75 }, { label: "Fair", weight: 50 }, { label: "Poor", weight: 25 }] },
    { options: [{ label: "Always", weight: 100 }, { label: "Often", weight: 80 }, { label: "Sometimes", weight: 60 }, { label: "Rarely", weight: 40 }, { label: "Never", weight: 20 }] },
    { options: [{ label: "Very Likely", weight: 100 }, { label: "Likely", weight: 75 }, { label: "Unlikely", weight: 50 }, { label: "Very Unlikely", weight: 25 }] },
    { options: [{ label: "Very Confident", weight: 100 }, { label: "Confident", weight: 80 }, { label: "Somewhat Confident", weight: 60 }, { label: "Not Confident", weight: 40 }, { label: "Not At All Confident", weight: 20 }] },
    { options: [{ label: "Very Helpful", weight: 100 }, { label: "Helpful", weight: 75 }, { label: "Somewhat Helpful", weight: 50 }, { label: "Not Helpful", weight: 25 }] },
    { options: [{ label: "Very Important", weight: 100 }, { label: "Important", weight: 80 }, { label: "Moderately Important", weight: 60 }, { label: "Slightly Important", weight: 40 }, { label: "Not Important", weight: 20 }] },
    { options: [{ label: "Completely Safe", weight: 100 }, { label: "Mostly Safe", weight: 75 }, { label: "Somewhat Safe", weight: 50 }, { label: "Unsafe", weight: 25 }] },
    { options: [{ label: "Very Effective", weight: 100 }, { label: "Effective", weight: 80 }, { label: "Somewhat Effective", weight: 60 }, { label: "Ineffective", weight: 40 }, { label: "Very Ineffective", weight: 20 }] },
  ];
}

async function generateSurveyFreeTextResponses(): Promise<string[]> {
  const all: string[] = [];
  for (let i = 0; i < 2; i++) {
    const result = await ollamaJSON(
      `Generate JSON: {"responses": ["r1", "r2", ...]} with exactly 50 unique free-text survey responses from garment factory workers. Answers to open-ended questions about conditions, safety, wages, management. Vary length (1-3 sentences), tone, topics. Batch ${i + 1}/2.`,
    );
    all.push(...extractStrings(result));
    progress("Free-text responses", i + 1, 4);
  }
  for (let i = 0; i < 2; i++) {
    const langs = NATIVE_LANGUAGES.slice(i * 2, i * 2 + 2);
    const result = await ollamaJSON(
      `Generate JSON: {"responses": ["r1", "r2", ...]} with exactly 50 free-text survey responses from factory workers written in ${langs.join(" and ")} languages using native script. Topics: workplace conditions, safety, management, wages.`,
    );
    all.push(...extractStrings(result));
    progress("Free-text responses", i + 3, 4);
  }
  return all;
}

async function generateCourses(): Promise<Record<string, Array<{ name: string; summary: string }>>> {
  const courses: Record<string, Array<{ name: string; summary: string }>> = {};
  let done = 0;

  for (const category of COURSE_CATEGORIES) {
    const result = await ollamaJSON(
      `Generate JSON: {"courses": [{"name": "title", "summary": "2-3 sentence description"}, ...]} with exactly 5 training courses for "${category}" in a garment factory context. Professional course titles for a corporate LMS.`,
    );

    const raw = result.courses || Object.values(result)[0];
    if (Array.isArray(raw)) {
      courses[category] = raw.slice(0, 5).map((c: unknown) => {
        if (typeof c === "string") return { name: c, summary: "" };
        const course = c as Record<string, unknown>;
        return {
          name: ((course.name || course.title || `${category} Training`) as string),
          summary: ((course.summary || course.description || "") as string),
        };
      });
    } else {
      courses[category] = Array.from({ length: 5 }, (_, i) => ({
        name: `${category} Module ${i + 1}`,
        summary: `Core training module for ${category} compliance.`,
      }));
    }
    done++;
    progress("Courses", done, COURSE_CATEGORIES.length);
  }
  return courses;
}

// ─── Main ──────────────────────────────────────────────────

async function main() {
  console.log(`🏭 Generating seed content via Ollama (${MODEL})...\n`);
  const startTime = Date.now();

  // Load partial progress if exists
  let content: Partial<SeedContent> = {};
  if (existsSync(OUTPUT_PATH)) {
    try {
      content = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
      console.log("  Resuming from previous run...\n");
    } catch { /* start fresh */ }
  }

  const needsFactoryRegen = !content.factoryNames
    || content.factoryNames.length < 200
    || (content.factoryNames.length > 0 && typeof content.factoryNames[0] === "string");
  if (needsFactoryRegen) {
    console.log("1/7 Factory names");
    content.factoryNames = await generateFactoryNames();
    console.log(`  ✓ ${content.factoryNames.length} factory names\n`);
    saveProgress(content);
  } else {
    console.log(`1/7 Factory names ✓ (${content.factoryNames!.length} cached)\n`);
  }

  if (!content.workerFirstNames || content.workerFirstNames.length < 100) {
    console.log("2/7 Worker names");
    const { firstNames, lastNames } = await generateWorkerNames();
    content.workerFirstNames = firstNames;
    content.workerLastNames = lastNames;
    console.log(`  ✓ ${firstNames.length} first, ${lastNames.length} last\n`);
    saveProgress(content);
  } else {
    console.log(`2/7 Worker names ✓ (${content.workerFirstNames!.length} first, ${content.workerLastNames!.length} last cached)\n`);
  }

  if (!content.grievanceMessages || Object.values(content.grievanceMessages).flat().length < 50) {
    console.log("3/7 Grievance messages");
    content.grievanceMessages = await generateGrievanceMessages();
    const total = Object.values(content.grievanceMessages).flat().length;
    console.log(`  ✓ ${total} grievance messages\n`);
    saveProgress(content);
  } else {
    const total = Object.values(content.grievanceMessages!).flat().length;
    console.log(`3/7 Grievance messages ✓ (${total} cached)\n`);
  }

  if (!content.surveyQuestionTitles || content.surveyQuestionTitles.length < 30) {
    console.log("4/7 Survey questions");
    content.surveyQuestionTitles = await generateSurveyQuestions();
    console.log(`  ✓ ${content.surveyQuestionTitles.length} questions\n`);
    saveProgress(content);
  } else {
    console.log(`4/7 Survey questions ✓ (${content.surveyQuestionTitles!.length} cached)\n`);
  }

  if (!content.surveyScoreOptionSets || content.surveyScoreOptionSets.length < 5) {
    console.log("5/7 Survey score option sets");
    content.surveyScoreOptionSets = await generateSurveyScoreOptionSets();
    console.log(`  ✓ ${content.surveyScoreOptionSets.length} option sets\n`);
    saveProgress(content);
  } else {
    console.log(`5/7 Score option sets ✓ (${content.surveyScoreOptionSets!.length} cached)\n`);
  }

  if (!content.surveyFreeTextResponses || content.surveyFreeTextResponses.length < 50) {
    console.log("6/7 Free-text responses");
    content.surveyFreeTextResponses = await generateSurveyFreeTextResponses();
    console.log(`  ✓ ${content.surveyFreeTextResponses.length} responses\n`);
    saveProgress(content);
  } else {
    console.log(`6/7 Free-text responses ✓ (${content.surveyFreeTextResponses!.length} cached)\n`);
  }

  if (!content.coursesByCategory || Object.values(content.coursesByCategory).flat().length < 30) {
    console.log("7/7 Training courses");
    content.coursesByCategory = await generateCourses();
    const total = Object.values(content.coursesByCategory).flat().length;
    console.log(`  ✓ ${total} courses\n`);
    saveProgress(content);
  } else {
    const total = Object.values(content.coursesByCategory!).flat().length;
    console.log(`7/7 Courses ✓ (${total} cached)\n`);
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n✅ Done in ${elapsed} minutes!`);
  console.log(`   Output: ${OUTPUT_PATH}`);
  printSummary(content as SeedContent);
}

function saveProgress(content: Partial<SeedContent>) {
  writeFileSync(OUTPUT_PATH, JSON.stringify(content, null, 2), "utf-8");
}

function printSummary(c: SeedContent) {
  console.log(`   Factory names: ${c.factoryNames.length}`);
  console.log(`   Worker names: ${c.workerFirstNames.length} first + ${c.workerLastNames.length} last`);
  console.log(`   Grievance messages: ${Object.values(c.grievanceMessages).flat().length}`);
  console.log(`   Survey questions: ${c.surveyQuestionTitles.length}`);
  console.log(`   Score option sets: ${c.surveyScoreOptionSets.length}`);
  console.log(`   Free-text responses: ${c.surveyFreeTextResponses.length}`);
  console.log(`   Courses: ${Object.values(c.coursesByCategory).flat().length}`);
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message || err);
  process.exit(1);
});
