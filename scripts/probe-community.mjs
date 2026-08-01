const BASE = "https://met-efgo.onrender.com/api/v1";

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  return {
    token: json.data?.accessToken || json.data?.token,
    role: json.data?.user?.role || json.data?.role,
    raw: json,
  };
}

async function req(method, path, token, body, isForm = false) {
  const headers = { Authorization: `Bearer ${token}` };
  let payload;
  if (body && isForm) payload = body;
  else if (body) {
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

function summarizePosts(json) {
  const data = json?.data;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.posts)
      ? data.posts
      : Array.isArray(data?.items)
        ? data.items
        : [];
  return list.slice(0, 2).map((p) => ({
    id: p._id || p.id,
    keys: Object.keys(p),
    content: String(p.content || "").slice(0, 60),
    likes: p.likes ?? p.likesCount,
    comments: p.comments ?? p.commentsCount,
    image: p.image || p.mediaUrl || p.thumbnail,
    author: p.author || p.user || p.createdBy,
  }));
}

async function main() {
  const student = await login("student10@gmail.com", "123456");
  const teacher = await login("teacher10@gmail.com", "123456");
  const admin = await login("admin1@edu.com", "123456789");
  console.log("roles", {
    student: student.role || student.raw?.data?.user?.role,
    teacher: teacher.role || teacher.raw?.data?.user?.role,
    admin: admin.role || admin.raw?.data?.user?.role,
  });

  for (const [name, token] of [
    ["student", student.token],
    ["teacher", teacher.token],
    ["admin", admin.token],
  ]) {
    const list = await req("GET", "/community/posts?page=1&limit=5", token);
    console.log(`\n=== GET as ${name} ===`, list.status, list.json?.message);
    console.log(summarizePosts(list.json));
  }

  // create text post as student
  const created = await req("POST", "/community/posts", student.token, {
    content: `QA community probe ${Date.now()}`,
  });
  console.log("\n=== CREATE text student ===", created.status, created.json?.message);
  console.log(JSON.stringify(created.json?.data || created.json, null, 2).slice(0, 800));
  const post =
    created.json?.data?.post ||
    created.json?.data ||
    (Array.isArray(created.json?.data) ? created.json.data[0] : null);
  const postId = post?._id || post?.id;
  console.log("POST_ID", postId);

  // multipart create with image
  const fd = new FormData();
  fd.append("content", `QA image post ${Date.now()}`);
  fd.append(
    "image",
    new Blob(["fakepng"], { type: "image/png" }),
    "probe.png",
  );
  const multi = await req("POST", "/community/posts", student.token, fd, true);
  console.log("\n=== CREATE multipart image ===", multi.status, multi.json?.message || multi.json);

  // try alternate field names
  for (const field of ["media", "photo", "file", "attachment", "thumbnail"]) {
    const f = new FormData();
    f.append("content", `QA ${field} ${Date.now()}`);
    f.append(field, new Blob(["x"], { type: "image/jpeg" }), "a.jpg");
    const r = await req("POST", "/community/posts", student.token, f, true);
    console.log(`multipart field=${field}`, r.status, r.json?.message || r.json?.status);
  }

  // try JSON with image url
  const withUrl = await req("POST", "/community/posts", student.token, {
    content: `QA url image ${Date.now()}`,
    image: "/images/programming.jpg",
  });
  console.log("\n=== CREATE with image url ===", withUrl.status, withUrl.json?.message);
  console.log(JSON.stringify(withUrl.json?.data || {}, null, 2).slice(0, 500));

  if (!postId) return;

  // like / comment / delete / pin routes
  const paths = [
    ["POST", `/community/posts/${postId}/like`],
    ["POST", `/community/posts/${postId}/likes`],
    ["POST", `/community/posts/${postId}/react`],
    ["POST", `/community/posts/${postId}/reactions`],
    ["DELETE", `/community/posts/${postId}/like`],
    ["POST", `/community/posts/${postId}/unlike`],
    ["GET", `/community/posts/${postId}/comments`],
    ["POST", `/community/posts/${postId}/comments`, { content: "nice" }],
    ["POST", `/community/posts/${postId}/comment`, { content: "nice" }],
    ["POST", `/community/comments`, { postId, content: "nice" }],
    ["DELETE", `/community/posts/${postId}`],
    ["PATCH", `/community/posts/${postId}`, { content: "edited" }],
    ["POST", `/community/posts/${postId}/pin`],
    ["POST", `/community/posts/${postId}/unpin`],
    ["DELETE", `/admin/community/posts/${postId}`],
    ["DELETE", `/admin/posts/${postId}`],
  ];

  for (const [method, path, body] of paths) {
    const r = await req(method, path, admin.token, body);
    console.log(method, path, r.status, r.json?.message || r.json?.status || "");
  }

  // also try like as student
  for (const [method, path, body] of [
    ["POST", `/community/posts/${postId}/like`],
    ["POST", `/community/posts/${postId}/comments`, { content: "student comment" }],
  ]) {
    const r = await req(method, path, student.token, body);
    console.log("student", method, path, r.status, r.json?.message || "");
  }

  // cleanup delete as admin and student
  for (const token of [student.token, admin.token]) {
    const del = await req("DELETE", `/community/posts/${postId}`, token);
    console.log("cleanup delete", del.status, del.json?.message || "");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
