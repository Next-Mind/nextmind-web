import assert from "node:assert/strict";
import { login } from "../services/auth";
import { clearAuthState, getAuthState } from "../stores/authStoreBase";

async function testLoginSuccess() {
  clearAuthState();
  const requests: Array<{ url: string; options?: RequestInit }> = [];

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    requests.push({ url, options: init });

    if (requests.length === 1) {
      assert.equal(url, "https://api.nextmind.sbs/sanctum/csrf-cookie");
      assert.equal(init?.method ?? "GET", "GET");
      assert.equal(init?.credentials, "include");
      return new Response(null, { status: 204 });
    }

    assert.equal(requests.length, 2);
    assert.equal(url, "https://api.nextmind.sbs/login");
    assert.equal(init?.method, "POST");
    assert.equal(init?.credentials, "include");
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    assert.deepEqual(body, { email: "user@example.com", password: "secret" });

    return new Response(JSON.stringify({ data: { id: 1 }, token: "abc" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const result = await login({ email: "user@example.com", password: "secret" });

  assert.deepEqual(result, { data: { id: 1 }, token: "abc" });
  assert.equal(requests.length, 2);
  assert.equal(getAuthState().token, null);
}

async function testLoginUnauthorized() {
  clearAuthState();
  const requests: Array<{ url: string; options?: RequestInit }> = [];

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    requests.push({ url, options: init });

    if (requests.length === 1) {
      return new Response(null, { status: 204 });
    }

    return new Response(JSON.stringify({ message: "Credenciais inválidas" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  };

  await assert.rejects(async () => login({ email: "user@example.com", password: "wrong" }), (error) => {
    assert.equal(typeof error, "object");
    assert.equal((error as { status?: number }).status, 401);
    assert.equal((error as { message?: string }).message, "Credenciais inválidas");
    return true;
  });

  assert.equal(requests.length, 2);
  assert.equal(getAuthState().token, null);
}

export async function runTests() {
  const tests: Array<[string, () => Promise<void>]> = [
    ["should perform login and return response", testLoginSuccess],
    ["should throw for unauthorized login", testLoginUnauthorized],
  ];

  let failures = 0;

  for (const [title, testFn] of tests) {
    try {
      await testFn();
      console.log(`✅ ${title}`);
    } catch (error) {
      failures += 1;
      console.error(`❌ ${title}`);
      console.error(error);
    }
  }

  if (failures > 0) {
    throw new Error(`${failures} test(s) failed`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
