// Talking to the Northvale Learn server. Every call carries X-Northvale: 1
// (the server refuses requests without it, so other websites can't drive
// it). Errors come back as Error with .status and .code.
export async function api(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(path, { method, headers: { "X-Northvale": "1", ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw Object.assign(new Error("offline"), { status: 0, code: "OFFLINE" });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error((data.error && data.error.message) || `HTTP ${res.status}`), { status: res.status, code: data.error && data.error.code });
  return data;
}

// A streamed reply (Server-Sent Events): onText gets each piece as it's
// written; resolves with the "done" payload.
export async function stream(path, body, onText) {
  let res;
  try {
    res = await fetch(path, { method: "POST", headers: { "X-Northvale": "1", "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw Object.assign(new Error("offline"), { status: 0, code: "OFFLINE" });
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw Object.assign(new Error((data.error && data.error.message) || `HTTP ${res.status}`), { status: res.status, code: data.error && data.error.code });
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = null;
  for (;;) {
    const { value, done: ended } = await reader.read().catch(() => {
      throw Object.assign(new Error("offline"), { status: 0, code: "OFFLINE" });
    });
    if (ended) break;
    buffer += decoder.decode(value, { stream: true });
    let cut;
    while ((cut = buffer.indexOf("\n\n")) >= 0) {
      const chunk = buffer.slice(0, cut);
      buffer = buffer.slice(cut + 2);
      const event = (/^event: (.*)$/m.exec(chunk) || [])[1];
      const data = JSON.parse((/^data: (.*)$/m.exec(chunk) || [])[1] || "null");
      if (event === "text") onText(data.text);
      else if (event === "done") done = data;
      else if (event === "error") throw Object.assign(new Error(data.message || "error"), { status: 502, code: data.code });
    }
  }
  if (!done) throw Object.assign(new Error("cut off"), { status: 0, code: "CUT_OFF" });
  return done;
}
