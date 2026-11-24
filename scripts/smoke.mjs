const base = process.env.BASE_URL ?? "http://localhost:3000";

function jar() {
  const cookies = new Map();
  return {
    store(response) {
      const list = typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : [];
      for (const raw of list) {
        const [pair] = raw.split(";");
        const eq = pair.indexOf("=");
        const name = pair.slice(0, eq).trim();
        const value = pair.slice(eq + 1).trim();
        if (!value) cookies.delete(name);
        else cookies.set(name, value);
      }
    },
    header() {
      return [...cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
    },
    has(name) {
      return cookies.has(name);
    },
  };
}

async function request(cookies, path, options = {}) {
  const headers = new Headers(options.headers ?? {});
  if (cookies.header()) headers.set("cookie", cookies.header());
  const response = await fetch(base + path, { ...options, headers, redirect: "manual" });
  cookies.store(response);
  return response;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function json(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON, got ${response.status}: ${text.slice(0, 300)}`);
  }
}

const cookies = jar();
const email = `pilot-${Date.now()}@example.com`;

let response = await request(cookies, "/api/auth/register", {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({ name: "Pilot Parent", email, password: "homeschool-demo" }),
});
assert(response.status === 200, `register ${response.status}`);
assert(cookies.has("beacon_parent"), "parent cookie missing after register");

response = await request(cookies, "/api/children", {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({ nickname: "Ada", grade: "3" }),
});
const created = await json(response);
assert(response.status === 200 && created.childId, "create child failed");
const childId = created.childId;

response = await request(cookies, `/api/children/${childId}/sessions`, {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({ kind: "DIAGNOSTIC" }),
});
const started = await json(response);
assert(response.status === 200 && started.sessionId, `diagnostic start failed ${response.status}`);
assert(cookies.has("beacon_child"), "child cookie missing");
assert(!cookies.has("beacon_parent"), "parent cookie should be cleared in child mode");

const blocked = await request(cookies, `/parent/children/${childId}`);
assert(blocked.status === 307 || blocked.status === 302, `child mode reached parent page ${blocked.status}`);

let answered = 0;
for (let i = 0; i < 12; i += 1) {
  const current = await json(await request(cookies, "/api/child-session"));
  if (current.mode === "done") break;
  assert(current.mode === "question", `unexpected session mode ${current.mode}`);
  assert(current.choices.length === 4, "expected 4 choices");
  const choice = current.choices[i % current.choices.length];
  const feedback = await json(await request(cookies, "/api/child-session/answer", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ attemptId: current.attemptId, choiceId: choice.id, responseMs: 1200 }),
  }));
  assert(typeof feedback.correct === "boolean", "answer missing correct flag");
  assert(feedback.explanation.length > 10, "missing prewritten explanation");
  answered += 1;
}
assert(answered >= 2, `diagnostic too short: ${answered}`);

await request(cookies, "/api/child-session/finish", { method: "POST" });
response = await request(cookies, "/api/child-session/unlock", {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({ password: "homeschool-demo" }),
});
assert(response.status === 200, `unlock ${response.status}`);
assert(cookies.has("beacon_parent"), "parent cookie missing after unlock");
assert(!cookies.has("beacon_child"), "child cookie still set");

const dashboard = await (await request(cookies, `/parent/children/${childId}`)).text();
assert(dashboard.includes("Ada"), "dashboard missing child");
assert(dashboard.includes("confidence"), "dashboard missing confidence");
assert(/In progress|Placed by diagnostic|Mastered/.test(dashboard), "dashboard missing mastery status");

const planHtml = await (await request(cookies, `/parent/children/${childId}/plan`)).text();
const tags = [...planHtml.matchAll(/<input\b[^>]*name="skillIds"[^>]*>/g)].map((match) => match[0]);
const selectable = tags
  .filter((tag) => !/\bdisabled\b/.test(tag))
  .map((tag) => tag.match(/value="([^"]+)"/)?.[1])
  .filter(Boolean);
const chosen = tags
  .filter((tag) => /\bchecked\b/.test(tag) && !/\bdisabled\b/.test(tag))
  .map((tag) => tag.match(/value="([^"]+)"/)?.[1])
  .filter(Boolean);
assert(selectable.length > 0, `no selectable skills. sample: ${tags[0] ?? "none"}`);
const toApprove = chosen.length > 0 ? chosen : selectable.slice(0, 2);

response = await request(cookies, `/api/children/${childId}/plan`, {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({ intent: "approve", skillIds: toApprove, dailyMinutes: "15", parentNote: "Keep the diagnostic focus." }),
});
const approved = await json(response);
assert(response.status === 200 && approved.ok, `approve failed ${response.status} ${JSON.stringify(approved)}`);

const blockedPractice = await request(jar(), `/api/children/${childId}/sessions`, {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({ kind: "PRACTICE" }),
});
assert(blockedPractice.status === 401, "practice without auth should fail");

response = await request(cookies, `/api/children/${childId}/sessions`, {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({ kind: "PRACTICE" }),
});
assert(response.status === 200, `practice start ${response.status} ${await response.text()}`);

for (let i = 0; i < 4; i += 1) {
  const current = await json(await request(cookies, "/api/child-session"));
  if (current.mode !== "question") break;
  await request(cookies, "/api/child-session/answer", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ attemptId: current.attemptId, choiceId: current.choices[0].id, responseMs: 900 }),
  });
}
await request(cookies, "/api/child-session/finish", { method: "POST" });
response = await request(cookies, "/api/child-session/unlock", {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({ password: "homeschool-demo" }),
});
assert(response.status === 200, "second unlock failed");

const after = await (await request(cookies, `/parent/children/${childId}`)).text();
assert(after.includes("In progress") || after.includes("Mastered") || after.includes("Placed by diagnostic"), "mastery not visible after practice");

const report = await (await request(cookies, `/parent/children/${childId}/report`)).text();
assert(report.includes("Ada"), "report missing child");
assert(/practiced|no practice|question/i.test(report), "report missing narrative");

const csv = await request(cookies, `/api/children/${childId}/export?format=csv`);
const csvText = await csv.text();
assert(csv.headers.get("content-type")?.includes("text/csv"), "csv content type");
assert(csvText.includes("Ada") && csvText.includes("skill_code"), "csv body");

const pdf = await request(cookies, `/api/children/${childId}/export?format=pdf`);
const pdfBytes = new Uint8Array(await pdf.arrayBuffer());
const pdfText = new TextDecoder().decode(pdfBytes.slice(0, 8));
assert(pdfText.startsWith("%PDF"), "pdf header");

const demo = jar();
response = await request(demo, "/api/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({ email: "parent@example.com", password: "homeschool-demo" }),
});
assert(response.status === 200, "demo login failed");
const home = await (await request(demo, "/parent")).text();
assert(home.includes("Riley") && home.includes("Sam"), "demo household missing");
const demoChild = home.match(/Riley[\s\S]{0,800}?href="(\/parent\/children\/(?!new\b)[^"]+)"/)?.[1] ?? "";
const rileyPage = await (await request(demo, demoChild)).text();
assert(rileyPage.includes("Riley"), `could not open Riley at ${demoChild}`);
assert(rileyPage.includes("Mastered"), "Riley is missing mastered skills");
assert(/stuck on|ready for/i.test(rileyPage), "Riley is missing an alert");
const rileyReport = await (await request(demo, `${demoChild}/report`)).text();
assert(/Getting stronger|still hard|practiced/i.test(rileyReport), "Riley weekly note is empty");

console.log(`Smoke passed. Diagnostic answers: ${answered}. Approved skills: ${toApprove.join(", ")}.`);
