// Cloudflare Workers entry (used by `wrangler deploy` / Workers Builds).
// Static files in ./public are served by the assets binding; only /api/* runs this code.
// The chat logic lives in functions/api/chat.js so the same file also works as a Pages Function.

import { onRequest as chat } from "../functions/api/chat.js";

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/chat") {
      return chat({ request, env, waitUntil: ctx.waitUntil.bind(ctx) });
    }
    if (pathname.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }
    return env.ASSETS.fetch(request);
  },
};
