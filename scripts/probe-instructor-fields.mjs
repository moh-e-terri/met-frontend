/**
 * Check which fields PUT /instructor/profile actually updates (names + avatar URL).
 */
const BASE = "https://met-efgo.onrender.com/api/v1";

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data.accessToken;
}

async function req(method, path, token, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  console.log(`[${res.status}] ${method} ${path}`, json.message || "");
  return json;
}

const token = await login("teacher10@gmail.com", "123456");

const before = await req("GET", "/instructor/profile", token);
console.log("BEFORE names", {
  first: before.data?.user?.firstName,
  second: before.data?.user?.secondName,
  family: before.data?.user?.familyName,
});

const marker = `T${Date.now().toString().slice(-4)}`;
await req("PUT", "/instructor/profile", token, {
  firstName: `Teacher${marker}`,
  secondName: `Mid${marker}`,
  familyName: `Fam${marker}`,
  phoneNumber: "0588888888",
  bio: `updated-${marker}`,
  paypalAccount: "pay@test.com",
  dateOfBirth: "1990-01-15",
  profileImage: "https://met-efgo.onrender.com/uploads/test-avatar.png",
});

const after = await req("GET", "/instructor/profile", token);
console.log("AFTER", {
  first: after.data?.user?.firstName,
  second: after.data?.user?.secondName,
  family: after.data?.user?.familyName,
  full: after.data?.user?.fullName,
  profileImage: after.data?.user?.profileImage,
  phone: after.data?.instructor?.phoneNumber,
  bio: after.data?.instructor?.bio,
  paypal: after.data?.instructor?.paypalAccount,
  dob: after.data?.instructor?.dateOfBirth,
});

// restore original names
await req("PUT", "/instructor/profile", token, {
  firstName: "Teacher10",
  secondName: "Bla",
  familyName: "Bla",
  phoneNumber: null,
  bio: "",
  paypalAccount: null,
});
