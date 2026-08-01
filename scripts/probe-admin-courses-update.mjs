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

async function req(method, path, token, body) {
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, message: json.message, errors: json.errors };
}

async function main() {
  const token = await login();
  const created = await req("POST", "/admin/courses", token, {
    title: `EditProbe ${Date.now()}`,
    allowedUniversities: ["6a4c8d839e84a4b195b3f268"],
    metCost: 1,
  });
  // create returns nested, re-fetch list for id
  const listRes = await fetch(`${BASE}/admin/courses?page=1&limit=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const list = await listRes.json();
  const course = (list.data || []).find((c) => String(c.title).startsWith("EditProbe"));
  const id = course?._id;
  console.log("course", id, course?.title);

  const paths = [
    ["PUT", `/admin/courses/${id}/update`],
    ["PATCH", `/admin/courses/${id}/update`],
    ["PUT", "/admin/courses/update"],
    ["PATCH", "/admin/courses/update"],
    ["POST", "/admin/courses/update"],
    ["PUT", `/admin/course/${id}`],
    ["PATCH", `/admin/course/${id}`],
    ["PUT", `/admin/courses/${id}/edit`],
    ["PATCH", `/admin/courses/${id}/thumbnail`],
    ["PUT", `/admin/courses/${id}/thumbnail`],
    ["POST", `/admin/courses/${id}/thumbnail`],
    ["PATCH", `/admin/courses/${id}/publish`],
    ["PUT", `/admin/courses/${id}/publish`],
  ];

  for (const [method, path] of paths) {
    const body =
      path.includes("update") && !path.includes(id)
        ? { id, title: "x", allowedUniversities: ["6a4c8d839e84a4b195b3f268"] }
        : { title: "Updated", description: "d", thumbnail: "/images/web.jpg", allowedUniversities: ["6a4c8d839e84a4b195b3f268"], metCost: 5 };
    const r = await req(method, path, token, body);
    console.log(method, path, r.status, r.message);
  }

  if (id) {
    const del = await req("DELETE", `/admin/courses/${id}`, token);
    console.log("cleanup", del.status, del.message);
  }
}

main().catch(console.error);
