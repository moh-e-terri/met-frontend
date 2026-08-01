const BASE = "https://met-efgo.onrender.com";

const js = await (await fetch(`${BASE}/api-docs/swagger-ui-init.js`)).text();
console.log("len", js.length);

const urls = [...js.matchAll(/url:\s*["']([^"']+)["']/g)].map((m) => m[1]);
console.log("urls", [...new Set(urls)]);

// Nest swagger embeds config with swaggerDoc
const start = js.indexOf('"paths"');
console.log("paths idx", start);

// Try parse options object
const optionsMatch = js.match(/let options\s*=\s*(\{[\s\S]*?\});\s*url\s*=/);
if (optionsMatch) {
  try {
    const options = eval(`(${optionsMatch[1]})`);
    const spec = options.swaggerDoc || options.spec || options;
    const paths = Object.keys(spec.paths || {});
    console.log("TOTAL", paths.length);
    const interesting = paths
      .filter((p) => /profile|student|avatar|user|admin|instructor|auth/i.test(p))
      .sort();
    console.log(interesting.join("\n"));

    // Print methods for profile-related
    for (const p of interesting) {
      if (!/profile|students\/\{|users\/\{|avatar/i.test(p)) continue;
      console.log(p, Object.keys(spec.paths[p]).join(","));
    }
  } catch (e) {
    console.log("eval fail", e.message);
  }
} else {
  // Fallback: extract path strings near put/patch
  const pathLikes = [
    ...js.matchAll(/"(\/(?:api\/v1\/)?[^"]*(?:profile|student|avatar|admin)[^"]*)"/gi),
  ].map((m) => m[1]);
  console.log("pathlikes", [...new Set(pathLikes)].sort().join("\n"));
}
