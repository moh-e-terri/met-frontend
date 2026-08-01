const BASE = "https://met-efgo.onrender.com/api/v1";

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin1@edu.com", password: "123456789" }),
  });
  const json = await res.json();
  return json.data?.accessToken || json.data?.token;
}

async function req(method, path, token, body, isForm = false) {
  const headers = { Authorization: `Bearer ${token}` };
  let payload;
  if (body && isForm) {
    payload = body;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

async function main() {
  const token = await login();
  console.log("logged in");

  // create with relative thumbnail
  const created = await req("POST", "/admin/courses", token, {
    title: `Probe ${Date.now()}`,
    allowedUniversities: ["6a4c8d839e84a4b195b3f268"],
    metCost: 1,
    level: "beginner",
    thumbnail: "/images/CyberSecurity.jpg",
    description: "probe desc",
  });
  console.log("CREATE", created.status, JSON.stringify(created.json?.data?.course || created.json, null, 2));
  const id = created.json?.data?.course?._id;
  console.log("ID", id);

  // try update routes
  for (const [method, path, body] of [
    ["PATCH", `/admin/courses/${id}`, { title: "Updated Title", description: "new", thumbnail: "/images/web.jpg", metCost: 2 }],
    ["PUT", `/admin/courses/${id}`, { title: "Updated Title", description: "new", allowedUniversities: ["6a4c8d839e84a4b195b3f268"], thumbnail: "/images/web.jpg" }],
    ["POST", `/admin/courses/${id}`, { title: "Updated Title" }],
    ["PATCH", `/courses/${id}`, { title: "Updated Title" }],
    ["PUT", `/courses/${id}`, { title: "Updated Title", allowedUniversities: ["6a4c8d839e84a4b195b3f268"] }],
  ]) {
    const r = await req(method, path, token, body);
    console.log(method, path, r.status, typeof r.json === "string" ? r.json.slice(0, 120) : r.json?.message || r.json?.status);
  }

  // multipart create
  const fd = new FormData();
  fd.append("title", `Multi ${Date.now()}`);
  fd.append("allowedUniversities", "6a4c8d839e84a4b195b3f268");
  fd.append("metCost", "1");
  fd.append("level", "beginner");
  const blob = new Blob(["fake"], { type: "image/jpeg" });
  fd.append("thumbnail", blob, "t.jpg");
  const multi = await req("POST", "/admin/courses", token, fd, true);
  console.log("MULTIPART", multi.status, multi.json?.message || multi.json);

  // delete
  if (id) {
    const del = await req("DELETE", `/admin/courses/${id}`, token);
    console.log("DELETE", del.status, del.json?.message || del.json);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
