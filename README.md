# my-digital-twin

Personal intro site for Shengwei (Jason) You with an AI "digital twin" chat. Static HTML + Tailwind on Cloudflare Workers (static assets); one API route proxies chat to OpenRouter so the API key never reaches the browser.

```
public/                     <- the ONLY folder Cloudflare serves (static assets)
  index.html                hero, work, research, talks, chat UI
  app.js                    chat client + publication renderer (textContent only)
  styles.css                built from src/input.css (commit it; no build on Pages)
  data/publications.json    single source of truth for papers + talks
  _headers                  CSP and security headers
functions/api/chat.js       POST /api/chat -> OpenRouter, hardcoded system prompt (Pages-Function compatible)
src/worker.js               Worker entry: /api/chat -> chat.js, everything else -> static assets
wrangler.toml               Workers config + non-secret vars (model id)
src/input.css               Tailwind v4 source
```

## Run locally

```bash
npm install
cp .dev.vars.example .dev.vars   # put your OpenRouter key here; file is gitignored
npm run dev                      # http://localhost:8788
```

## Deploy (Cloudflare Workers Builds, connected to GitHub)

Every push to `main` deploys with `npx wrangler deploy`. The Worker name in the dashboard must match `name` in `wrangler.toml`.

One-time: add the key as a **Secret** in Dashboard > Workers & Pages > my-digital-twin > Settings > Variables and Secrets, or:

```bash
npx wrangler secret put OPENROUTER_API_KEY
```

Manual deploy from your machine: `npm run deploy`.

## Update publications

Edit `public/data/publications.json`. Status is one of `published`, `accepted`, `in_review`, `awaiting_review`. Add `"show": false` to hide an entry from the page and the twin. The JSON file itself is public, so delete an entry entirely if it must stay private. The chat function imports the same file, so the twin's knowledge updates on the next deploy.

## Security model

- Key lives only in Cloudflare env (`env.OPENROUTER_API_KEY`).
- System prompt is hardcoded in `functions/api/chat.js`; client `system` turns are dropped.
- Input: 16 KB body cap, 1,000 chars per message, last 6 user turns only (client-sent assistant turns are dropped), Origin required and same-origin.
- Output guard (best-effort): replies with code fences, code-like lines, JSON, or the prompt canary are replaced with a refusal.
- No phone, email or resume file in the repo. Contact details are deliberately absent from the prompt.
- Required before launch: a Cloudflare WAF rate-limiting rule on `/api/chat` (about 20 requests/min per IP) and a credit limit on the OpenRouter key. The Origin check stops other websites, not scripts.
