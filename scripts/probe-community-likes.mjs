const BASE = "https://met-efgo.onrender.com/api/v1";
async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  return { token: json.data?.accessToken || json.data?.token, user: json.data?.user || json.data };
}
async function main() {
  const student = await login("student10@gmail.com", "123456");
  const create = await fetch(`${BASE}/community/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${student.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content: `like shape ${Date.now()}` }),
  }).then((r) => r.json());
  const id = create.data.post._id;
  await fetch(`${BASE}/community/posts/${id}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${student.token}` },
  });
  const list = await fetch(`${BASE}/community/posts?limit=5`, {
    headers: { Authorization: `Bearer ${student.token}` },
  }).then((r) => r.json());
  const post = (list.data || []).find((p) => p._id === id);
  console.log("user", student.user);
  console.log("likes array", post?.likes);
  console.log("authorId", post?.authorId);
  await fetch(`${BASE}/community/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${student.token}` },
  });
}
main().catch(console.error);
