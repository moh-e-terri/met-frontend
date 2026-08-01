const BASE = "https://met-efgo.onrender.com";
const html = await (await fetch(`${BASE}/api-docs/`)).text();
console.log(html.slice(0, 2000));
const matches = [...html.matchAll(/["'](\/[^"']*(?:swagger|openapi|api-docs)[^"']*)["']/gi)].map(
  (m) => m[1],
);
console.log("matches", [...new Set(matches)]);
for (const p of [
  "/api-docs/swagger-ui-init.js",
  "/swagger-ui-init.js",
  "/api/v1/docs-json",
  "/api/v1/swagger.json",
]) {
  const r = await fetch(BASE + p);
  const t = await r.text();
  console.log(r.status, p, t.slice(0, 150).replace(/\n/g, " "));
}
