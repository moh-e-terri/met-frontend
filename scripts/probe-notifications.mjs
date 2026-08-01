/**
 * Probe notification payload shape for deep-link fields.
 * Run: node scripts/probe-notifications.mjs
 */
const BASE = process.env.API_URL || "https://met-efgo.onrender.com/api/v1";

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || email);
  return json.data.accessToken;
}

async function main() {
  for (const [label, email, password] of [
    ["student", "student10@gmail.com", "123456"],
    ["teacher", "teacher10@gmail.com", "123456"],
    ["admin", "admin1@edu.com", "123456789"],
  ]) {
    try {
      const token = await login(email, password);
      const res = await fetch(`${BASE}/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      console.log(`\n=== ${label} [${res.status}] ===`);
      const list =
        json?.data?.notifications ||
        json?.data?.items ||
        (Array.isArray(json?.data) ? json.data : []) ||
        [];
      console.log("count", list.length);
      for (const item of list.slice(0, 5)) {
        console.log(JSON.stringify(item, null, 2));
      }
    } catch (error) {
      console.log(`\n=== ${label} FAIL ===`, error.message);
    }
  }
}

main();
