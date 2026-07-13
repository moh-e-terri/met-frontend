import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = "https://met-efgo.onrender.com/api/v1";
const OUT_DIR = path.resolve(".qa/sessions");

const ACCOUNTS = [
  { key: "admin", email: "admin1@edu.com", password: "123456789", role: "admin" },
  { key: "teacher", email: "teacher10@gmail.com", password: "123456", role: "teacher" },
  { key: "student", email: "student10@gmail.com", password: "123456", role: "student" },
];

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `Login failed for ${email}`);
  return json.data;
}

function buildSession(data, role) {
  const user = data.user ?? {};
  const name =
    user.fullName ||
    user.name ||
    [user.firstName, user.secondName, user.familyName].filter(Boolean).join(" ") ||
    user.email;

  const session = {
    userId: user._id || user.id || "",
    role,
    email: user.email || "",
    name: role === "teacher" && !String(name).startsWith("د.") ? `د. ${name}` : name,
    token: data.accessToken || data.token,
  };

  if (role === "student" && data.university) {
    session.universityId = data.university._id || data.university.id;
    session.universityName = data.university.name;
    session.metBalance = user.metBalance ?? user.metPoints;
  }

  return session;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const account of ACCOUNTS) {
    const data = await login(account.email, account.password);
    const session = buildSession(data, account.role);
    const filePath = path.join(OUT_DIR, `${account.key}.json`);
    await writeFile(filePath, JSON.stringify(session, null, 2), "utf8");
    console.log(`saved ${account.key} session -> ${path.relative(process.cwd(), filePath)}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
