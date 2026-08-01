const res = await fetch("https://met-efgo.onrender.com/api-docs/swagger-ui-init.js");
const t = await res.text();
console.log("len", t.length);

const urlMatch = t.match(/url:\s*["']([^"']+)["']/);
console.log("config url", urlMatch?.[1]);

// Extract swaggerDoc if embedded
const docIdx = t.indexOf("swaggerDoc");
console.log("swaggerDoc idx", docIdx);
if (docIdx >= 0) {
  console.log(t.slice(docIdx, docIdx + 200));
}

// Find all path-like strings under /api or route names
const pathMatches = t.match(/"\/[a-zA-Z][^"]{0,80}"/g) || [];
const interesting = [...new Set(pathMatches)].filter((p) =>
  /auth|student|instructor|admin|profile|user|upload|avatar|image/i.test(p),
);
console.log("interesting paths:\n" + interesting.join("\n"));

// Try swagger.json next to api-docs
for (const p of [
  "/api-docs/swagger.json",
  "/api-docs/openapi.json",
  "/api-docs/spec",
  "/api-docs.yaml",
]) {
  const r = await fetch("https://met-efgo.onrender.com" + p);
  const body = await r.text();
  console.log(r.status, p, body.slice(0, 120).replace(/\n/g, " "));
}
