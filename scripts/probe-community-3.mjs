const BASE = "https://met-efgo.onrender.com/api/v1";

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
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
  return { status: res.status, message: json.message, data: json.data };
}

async function main() {
  const student = await login("student10@gmail.com", "123456");
  const teacher = await login("teacher10@gmail.com", "123456");
  const admin = await login("admin1@edu.com", "123456789");

  const created = await req("POST", "/community/posts", student, {
    content: `Moderation probe ${Date.now()}`,
    attachments: ["/images/web.jpg"],
  });
  const id = created.data?.post?._id;
  console.log("created", created.status, id);

  console.log("teacher pin", await req("POST", `/community/posts/${id}/pin`, teacher));
  console.log("admin pin", await req("POST", `/community/posts/${id}/pin`, admin));
  console.log("admin pin again", await req("POST", `/community/posts/${id}/pin`, admin));
  console.log("teacher delete other", await req("DELETE", `/community/posts/${id}`, teacher));
  console.log("admin delete other", await req("DELETE", `/community/posts/${id}`, admin));

  // comment delete?
  const p2 = await req("POST", "/community/posts", student, { content: `cprobe ${Date.now()}` });
  const id2 = p2.data?.post?._id;
  const c = await req("POST", `/community/posts/${id2}/comments`, student, { content: "x" });
  const cid = c.data?.comment?._id;
  console.log("comment id", cid);
  for (const path of [
    `/community/posts/${id2}/comments/${cid}`,
    `/community/comments/${cid}`,
  ]) {
    console.log("delete comment", path, await req("DELETE", path, admin));
  }
  await req("DELETE", `/community/posts/${id2}`, admin);
}

main().catch(console.error);
