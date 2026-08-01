const BASE = "https://met-efgo.onrender.com";
const js = await (await fetch(`${BASE}/api-docs/swagger-ui-init.js`)).text();

// Extract every path + methods roughly
const re = /"(\/[^"]+)"\s*:\s*\{/g;
const paths = [];
let m;
while ((m = re.exec(js))) paths.push({ path: m[1], at: m.index });

for (const { path, at } of paths) {
  const chunk = js.slice(at, at + 400);
  const methods = [...chunk.matchAll(/"(get|put|post|patch|delete)"\s*:/gi)].map((x) =>
    x[1].toLowerCase(),
  );
  if (methods.some((x) => x === "put" || x === "patch")) {
    console.log([...new Set(methods)].join("|"), path);
  }
}
