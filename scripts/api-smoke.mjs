const baseUrl = process.env.HUNASUNA_API_URL ?? "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Accept: "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  const body = await response.json();

  return {
    status: response.status,
    body
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const checks = [
  async () => {
    const response = await request("/api/auth");
    assert(response.status === 200, "/api/auth must return 200");
    assert(response.body.ok === true, "/api/auth must return ok=true");
  },
  async () => {
    const response = await request("/api/users/me");
    assert(response.status === 401, "/api/users/me must reject anonymous requests");
    assert(response.body.ok === false, "/api/users/me must return ok=false for anonymous requests");
  },
  async () => {
    const response = await request("/api/contacts");
    assert(response.status === 401, "/api/contacts must reject anonymous requests");
    assert(response.body.ok === false, "/api/contacts must return ok=false for anonymous requests");
  }
];

for (const check of checks) {
  await check();
}

console.log(`API smoke checks passed for ${baseUrl}`);
