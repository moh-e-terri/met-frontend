import { writeFileSync } from "node:fs";

const res = await fetch("https://met-efgo.onrender.com/api-docs/swagger-ui-init.js");
const t = await res.text();
const start = t.indexOf('"swaggerDoc"');
if (start < 0) {
  console.error("swaggerDoc not found");
  process.exit(1);
}
// Find the object after swaggerDoc":
const braceStart = t.indexOf("{", start);
let depth = 0;
let end = braceStart;
for (let i = braceStart; i < t.length; i++) {
  const ch = t[i];
  if (ch === "{") depth++;
  else if (ch === "}") {
    depth--;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
const jsonText = t.slice(braceStart, end);
const doc = JSON.parse(jsonText);
writeFileSync("scripts/openapi-extracted.json", JSON.stringify(doc, null, 2));
const paths = Object.keys(doc.paths || {});
console.log("path count", paths.length);
console.log(paths.join("\n"));
const profileRelated = paths.filter((p) =>
  /profile|avatar|upload|image|user|student|instructor/i.test(p),
);
console.log("\nprofile-related:\n" + profileRelated.join("\n"));
