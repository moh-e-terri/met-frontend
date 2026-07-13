const BASE = 'https://met-efgo.onrender.com/api/v1';

const accounts = {
  admin: { email: 'admin1@edu.com', password: '123456789', role: 'admin' },
  teacher: { email: 'teacher10@gmail.com', password: '123456', role: 'teacher' },
  student: { email: 'student10@gmail.com', password: '123456', role: 'student' },
};

async function buildSession(roleKey) {
  const account = accounts[roleKey];
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: account.email, password: account.password }),
  });
  const login = await loginRes.json();
  const token = login.data?.accessToken;
  const user = login.data?.user ?? {};

  const meRes = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const me = await meRes.json();
  const profile = me.data?.user ?? me.data ?? user;

  const name =
    profile.fullName ||
    profile.name ||
    [profile.firstName, profile.secondName, profile.familyName].filter(Boolean).join(' ') ||
    account.email;

  const session = {
    userId: profile._id || profile.id || user._id || user.id || '',
    role: roleKey === 'teacher' ? 'teacher' : roleKey,
    email: profile.email || account.email,
    name: roleKey === 'teacher' && !name.startsWith('د.') ? `د. ${name}` : name,
    token,
  };

  if (roleKey === 'student') {
    const uni = profile.university ?? me.data?.university;
    session.universityId = uni?._id || uni?.id;
    session.universityName = uni?.name;
    session.metBalance = profile.metBalance ?? profile.metPoints ?? me.data?.metBalance;
  }

  return session;
}

const role = process.argv[2] || 'admin';
buildSession(role)
  .then((session) => console.log(JSON.stringify(session)))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
