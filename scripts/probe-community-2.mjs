const BASE = "https://met-efgo.onrender.com/api/v1";
const fs = await import("node:fs");
const path = await import("node:path");

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  return json.data?.accessToken || json.data?.token;
}

async function req(method, pathName, token, body, isForm = false) {
  const headers = { Authorization: `Bearer ${token}` };
  let payload;
  if (body && isForm) payload = body;
  else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${pathName}`, { method, headers, body: payload });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function main() {
  const student = await login("student10@gmail.com", "123456");
  const teacher = await login("teacher10@gmail.com", "123456");
  const admin = await login("admin1@edu.com", "123456789");

  // create as teacher
  const tCreate = await req("POST", "/community/posts", teacher, {
    content: `Teacher post ${Date.now()}`,
  });
  console.log("teacher create", tCreate.status, tCreate.json?.message, tCreate.json?.data?.post?._id);

  // create as admin
  const aCreate = await req("POST", "/community/posts", admin, {
    content: `Admin post ${Date.now()}`,
  });
  console.log("admin create", aCreate.status, aCreate.json?.message, aCreate.json?.data?.post?._id);
  const adminPostId = aCreate.json?.data?.post?._id;

  // attachments as JSON array of urls
  const withAtt = await req("POST", "/community/posts", student, {
    content: `Attach url ${Date.now()}`,
    attachments: ["/images/programming.jpg"],
  });
  console.log("attachments urls", withAtt.status, withAtt.json?.data?.post);

  const withAttObj = await req("POST", "/community/posts", student, {
    content: `Attach obj ${Date.now()}`,
    attachments: [{ url: "/images/CyberSecurity.jpg", type: "image" }],
  });
  console.log("attachments obj", withAttObj.status, withAttObj.json?.data?.post);

  // multipart with content + attachments field name
  const imgPath = path.resolve("public/images/programming.jpg");
  const bytes = fs.readFileSync(imgPath);
  const fd = new FormData();
  fd.append("content", `Multipart real ${Date.now()}`);
  fd.append("attachments", new Blob([bytes], { type: "image/jpeg" }), "programming.jpg");
  const multi = await req("POST", "/community/posts", student, fd, true);
  console.log("multipart attachments", multi.status, multi.json?.message, multi.json?.data?.post);

  const fd2 = new FormData();
  fd2.append("content", `Multipart images ${Date.now()}`);
  fd2.append("images", new Blob([bytes], { type: "image/jpeg" }), "programming.jpg");
  const multi2 = await req("POST", "/community/posts", student, fd2, true);
  console.log("multipart images", multi2.status, multi2.json?.message, multi2.json?.data?.post);

  // data url attachment
  const dataUrl = `data:image/jpeg;base64,${bytes.subarray(0, 200).toString("base64")}`;
  const withData = await req("POST", "/community/posts", student, {
    content: `Dataurl ${Date.now()}`,
    attachments: [dataUrl],
  });
  console.log("dataurl attach", withData.status, withData.json?.data?.post?.attachments?.length, withData.json?.data?.post?.attachments?.[0]?.slice?.(0, 40));

  if (!adminPostId) return;

  // like toggle
  const like1 = await req("POST", `/community/posts/${adminPostId}/like`, student);
  console.log("like1", like1.status, like1.json?.message, like1.json?.data);
  const like2 = await req("POST", `/community/posts/${adminPostId}/like`, student);
  console.log("like2 (toggle?)", like2.status, like2.json?.message, like2.json?.data);

  // comments
  const c1 = await req("POST", `/community/posts/${adminPostId}/comments`, student, {
    content: "تعليق تجريبي",
  });
  console.log("comment create", c1.status, JSON.stringify(c1.json).slice(0, 400));
  const cList = await req("GET", `/community/posts/${adminPostId}/comments`, student);
  console.log("comment list", cList.status, JSON.stringify(cList.json).slice(0, 600));

  // pin as admin
  const pin = await req("POST", `/community/posts/${adminPostId}/pin`, admin);
  console.log("pin admin", pin.status, pin.json?.message, pin.json?.data?.post?.isPinned);

  // pin as student
  const pinStudent = await req("POST", `/community/posts/${adminPostId}/pin`, student);
  console.log("pin student", pinStudent.status, pinStudent.json?.message);

  // list one post details
  const list = await req("GET", "/community/posts?limit=5", admin);
  const found = (list.json?.data || []).find((p) => p._id === adminPostId);
  console.log("listed post", found);

  // delete as author (admin)
  const del = await req("DELETE", `/community/posts/${adminPostId}`, admin);
  console.log("delete author", del.status, del.json?.message);

  // cleanup teacher post
  const tid = tCreate.json?.data?.post?._id;
  if (tid) await req("DELETE", `/community/posts/${tid}`, teacher);

  // cleanup attachment posts
  for (const res of [withAtt, withAttObj, multi, multi2, withData]) {
    const id = res.json?.data?.post?._id;
    if (id) await req("DELETE", `/community/posts/${id}`, student);
  }
}

main().catch(console.error);
