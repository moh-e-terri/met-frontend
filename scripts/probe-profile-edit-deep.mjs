/**
 * Deeper hunt: swagger + more profile paths + admin profile avatar.
 */
const BASE = "https://met-efgo.onrender.com/api/v1";
const ROOT = "https://met-efgo.onrender.com";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

async function req(method, path, { token, body, formData, base = BASE } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !formData) headers["Content-Type"] = "application/json";
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: formData || (body ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  let json = {};
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  const interesting = res.status !== 404;
  if (interesting || path.includes("swagger") || path.includes("docs")) {
    console.log(`[${res.status}] ${method} ${path} :: ${json.message || ""} :: ${JSON.stringify(json).slice(0, 220)}`);
  } else {
    process.stdout.write(".");
  }
  return { ok: res.ok, status: res.status, json };
}

async function main() {
  for (const url of [
    "/api-json",
    "/api/v1/api-json",
    "/docs-json",
    "/api/docs-json",
    "/swagger/v1/swagger.json",
    "/v3/api-docs",
    "/openapi.json",
    "/api/v1/openapi.json",
    "/documentation-json",
    "/api/swagger.json",
  ]) {
    const r = await fetch(ROOT + url);
    console.log("doc", url, r.status, r.headers.get("content-type"));
    if (r.ok) {
      const spec = await r.json();
      const paths = Object.keys(spec.paths || {});
      console.log("TOTAL PATHS", paths.length);
      console.log(
        paths
          .filter((p) => /profile|student|avatar|user|admin/i.test(p))
          .sort()
          .join("\n"),
      );
    }
  }

  // HTML docs page might list routes
  for (const url of ["/api/docs", "/docs", "/swagger", "/api/v1/docs"]) {
    const r = await fetch(ROOT + url);
    console.log("html", url, r.status, (await r.text()).slice(0, 120).replace(/\s+/g, " "));
  }

  const student = await login("student10@gmail.com", "123456");
  const admin = await login("admin1@edu.com", "123456789");
  const teacher = await login("teacher10@gmail.com", "123456");

  console.log("\n=== Extra student paths ===");
  const body = { firstName: "Mohammed", secondName: "E.", familyName: "Alterri" };
  for (const [method, path] of [
    ["PUT", "/student"],
    ["PATCH", "/student"],
    ["POST", "/student/profile"],
    ["PUT", "/student/account"],
    ["PATCH", "/student/account"],
    ["PUT", "/student/me"],
    ["PATCH", "/student/me"],
    ["PUT", "/student/update-profile"],
    ["PUT", "/student/updateProfile"],
    ["PATCH", "/student/update-profile"],
    ["PUT", "/users/profile"],
    ["PATCH", "/users/profile"],
    ["PUT", "/user/profile"],
    ["PATCH", "/user/profile"],
    ["PUT", "/auth/update-profile"],
    ["PUT", "/auth/updateProfile"],
    ["POST", "/auth/update-profile"],
    ["PUT", "/student/profile/update"],
  ]) {
    await req(method, path, { token: student, body });
    await sleep(120);
  }
  console.log("");

  console.log("\n=== Admin GET/PUT profile + avatar ===");
  await req("GET", "/admin/profile", { token: admin });
  await req("PUT", "/admin/profile", {
    token: admin,
    body: {
      firstName: "Admin",
      secondName: "System",
      familyName: "One",
      profileImage:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    },
  });
  await req("GET", "/auth/me", { token: admin });

  console.log("\n=== Admin student edit more paths ===");
  const sid = "6a65f6082f256d3388604b22";
  const uid = "6a65f6062f256d3388604b20";
  for (const [method, path] of [
    ["PUT", `/admin/student/${sid}`],
    ["PATCH", `/admin/student/${sid}`],
    ["PUT", `/admin/student/${uid}`],
    ["PUT", `/admin/students/${sid}/info`],
    ["PUT", `/admin/students/${sid}/details`],
    ["PUT", `/admin/students/${sid}/account`],
    ["PATCH", `/admin/students/${sid}/account`],
    ["PUT", `/admin/students/${sid}/user`],
    ["PUT", `/admin/update-student/${sid}`],
    ["PUT", `/admin/updateStudent/${sid}`],
    ["POST", `/admin/students/${sid}/update`],
    ["PUT", `/admin/users/${uid}/update`],
    ["PATCH", `/admin/users/${uid}/update`],
    ["PUT", `/admin/profile/students/${sid}`],
    ["PUT", `/admin/profiles/students/${sid}`],
    ["PUT", `/admin/manage/students/${sid}`],
    // maybe update nested user fields via MET-like pattern
    ["PUT", `/admin/students/${sid}/name`],
    ["PATCH", `/admin/students/${sid}/name`],
    ["PUT", `/admin/students/${uid}`], // user id on students path
    ["PATCH", `/admin/students/${uid}`],
  ]) {
    await req(method, path, {
      token: admin,
      body: { firstName: "abd", secondName: "Probe", familyName: "Edit" },
    });
    await sleep(100);
  }
  console.log("");

  console.log("\n=== Teacher student edit more ===");
  const tSid = "6a4e516a4d71aabcc385eaa4";
  const tUid = "6a4e51684d71aabcc385eaa2";
  for (const [method, path] of [
    ["PUT", `/instructor/student/${tSid}`],
    ["PUT", `/instructor/student/${tUid}`],
    ["PUT", `/instructor/profile/students/${tSid}`],
    ["PUT", `/instructor/profiles/students/${tSid}`],
    ["PATCH", `/instructor/profile/students/${tSid}`],
    ["PUT", `/instructor/manage/students/${tSid}`],
    ["PUT", `/instructor/students/${tSid}/info`],
    ["PUT", `/instructor/students/${tSid}/account`],
    ["POST", `/instructor/students/${tSid}/update`],
  ]) {
    await req(method, path, {
      token: teacher,
      body: { firstName: "Mohammed", secondName: "E.", familyName: "Alterri" },
    });
    await sleep(100);
  }
  console.log("");

  // List all non-404 from a broader OPTIONS? Unlikely.
  // Try GET routes that might reveal sibling update routes
  console.log("\n=== GET siblings ===");
  for (const path of [
    "/admin/profile",
    "/student/profile",
    "/instructor/profile",
    "/admin/students",
  ]) {
    await req("GET", path, { token: path.startsWith("/admin") ? admin : path.startsWith("/instructor") ? teacher : student });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
