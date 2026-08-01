const BASE = "https://met-efgo.onrender.com";
const js = await (await fetch(`${BASE}/api-docs/swagger-ui-init.js`)).text();

// swagger-ui-init typically: var __webpack... or window.ui = SwaggerUIBundle({spec: ...})
const markers = ["swaggerDoc:", "spec:", '"openapi":', '"swagger":'];
for (const m of markers) {
  console.log(m, js.indexOf(m));
}

// Dump a window around paths for admin/students
const needle = '"/admin/students/{id}"';
const i = js.indexOf(needle);
console.log("students/{id} at", i);
if (i >= 0) {
  console.log(js.slice(i, i + 800));
}

const needle2 = '"/admin/profile"';
const j = js.indexOf(needle2);
console.log("admin/profile at", j);
if (j >= 0) console.log(js.slice(j, j + 600));

const needle3 = '"/student/profile"';
const k = js.indexOf(needle3);
console.log("student/profile at", k);
if (k >= 0) console.log(js.slice(k, k + 900));

const needle4 = '"/instructor/profile"';
const l = js.indexOf(needle4);
console.log("instructor/profile at", l);
if (l >= 0) console.log(js.slice(l, l + 900));

// Extract all path keys with their HTTP methods via regex
const pathBlock = [...js.matchAll(/"(\/[^"]+)"\s*:\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g)];
console.log("pathBlock matches", pathBlock.length);
const rows = [];
for (const m of pathBlock) {
  const path = m[1];
  const body = m[2];
  const methods = [...body.matchAll(/"(get|put|post|patch|delete)"\s*:/gi)].map((x) =>
    x[1].toUpperCase(),
  );
  if (methods.length) rows.push(`${methods.join("|")} ${path}`);
}
console.log(rows.filter((r) => /profile|students|instructors\/\{|avatar|admin\/profile/i.test(r)).join("\n"));
console.log("--- ALL admin/student/instructor profile-ish ---");
console.log(rows.filter((r) => /\/admin\/|\/student\/|\/instructor\//i.test(r)).join("\n"));
