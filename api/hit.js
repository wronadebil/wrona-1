export const config = { runtime: "edge" };

export default async function handler(request) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const ns = process.env.COUNTER_NAMESPACE || "wrona-lol";
  const key = process.env.COUNTER_KEY || "profile";
  const upstream = `https://api.counterapi.dev/v1/${encodeURIComponent(ns)}/${encodeURIComponent(key)}/up`;

  try {
    const r = await fetch(upstream, {
      headers: { Accept: "application/json" },
    });
    const text = await r.text();
    return new Response(text, {
      status: r.status,
      headers: {
        ...cors,
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "proxy_failed" }), {
      status: 502,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
}
