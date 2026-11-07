# Shengwei (Jason) You · Digital Twin

A calm, multilingual professional profile and research guide. Static HTML and Tailwind CSS on Cloudflare Workers, with a server-side OpenRouter chat endpoint.

## Structure

- `public/index.html`, `app.js`, `styles.css`: accessible responsive frontend, publication filters, and conversation UI.
- `public/locales/*.json`: complete UI and publication-title translations in English, Traditional Chinese, Simplified Chinese, Spanish, Brazilian Portuguese, French, Russian, Japanese, and Arabic. Original bibliographic titles remain visible alongside translations.
- `public/data/publications.json`: public publication and talk metadata, shared by the page and chat.
- `functions/api/profile.js`: curated public professional facts.
- `functions/api/knowledge.js`: small, auditable lexical retrieval index plus complete bibliographic catalogue, including multilingual topic aliases.
- `functions/api/chat.js`: safe domain Q&A, signed conversation history, input limits, and OpenRouter proxy.
- `src/worker.js`, `wrangler.toml`: Worker routing, assets, and edge rate limit.
- `tests/`: Node-native security, conversation, retrieval, and translation checks.

## Local development and checks

Requires Node 22 or newer.

```sh
npm ci
cp .dev.vars.example .dev.vars
# Set OPENROUTER_API_KEY in .dev.vars. Never commit it.
npm run dev
npm run check
npx wrangler deploy --dry-run
```

`npm run check` runs tests, JavaScript syntax checks, and the CSS build. Commit built `public/styles.css`: the connected Cloudflare build currently deploys using `npx wrangler deploy`, so committed assets must be current.

## Deployment

The existing Cloudflare Workers Builds connection deploys pushes to `main`. Worker name: `my-digital-twin`. Manual deployment: `npm run deploy` with an authorized Cloudflare login.

The existing `OPENROUTER_API_KEY` secret remains server-side. No new API credentials, database, vector index, or paid service is required. The configured model is preserved in `wrangler.toml`; change `OPENROUTER_MODEL` there or in Cloudflare if desired.

An optional `CHAT_SESSION_SECRET` can be set as a Cloudflare secret. Without it, a domain-separated signing key is derived from the existing OpenRouter secret. Rotating either signing secret invalidates current conversations. Never put secrets in source, frontend assets, or logs.

After a push, check the exact remote commit and Cloudflare build, then confirm deployed assets and `/api/chat`. API replies include `X-Twin-Version: 2026-11-07-multilingual` to distinguish this release from the previous handler. A successful Git push alone is not proof of deployment.

## Chat behavior and evidence

The twin answers safe follow-up questions about Jason's work and related technical concepts, including explanations, comparisons, analogies, and small illustrative code examples. It distinguishes general educational explanations from verified facts about Jason. It has no execution tools, wallet access, external browsing, or private documents.

The retrieval corpus includes only curated public facts and bibliographic metadata. It is deliberately lightweight, not a full-text paper RAG system. The model must not invent paper findings, unpublished methods, quantitative results, or biography. Under-review work is restricted to its public title, topic, and exact status. Source cards are drawn from allowlisted records cited by the answer.

For richer paper-specific answers, add reviewed public abstracts or excerpts with provenance to `knowledge.js`; do not ingest private manuscripts or arbitrary visitor URLs. Every source should state what it actually supports.

## Security and privacy

- Same-origin POST requests only, with exact scheme/host/port matching.
- Streaming request body limit of 64 KB, 1,000-character user messages, bounded output and history, and a 25-second upstream timeout.
- Only the newest client user turn is accepted. Earlier client `system`, `assistant`, and other turns are ignored. Prior conversation context comes from a verified, expiring HMAC token issued by the server.
- Tokens are signed, **not encrypted**, and contain conversation text. The client keeps them in page memory only; clearing or reloading discards them. Tokens expire after 30 minutes and preserve at most four recent question/answer pairs, fewer for large Unicode conversations. Do not share them.
- Only selected language is stored in localStorage. Messages are sent through Cloudflare to OpenRouter and its configured model provider to generate answers; their retention policies apply. The site does not log conversation contents.
- All dynamic output uses `textContent`, never model-supplied HTML. CSP, safe source links, and existing security headers remain enabled.
- The model prompt enforces scope, privacy, and injection resistance. An output guard blocks the prompt marker or configured secret literals without banning harmless technical code. Prompt defenses are best-effort, not a guarantee; never add secrets or private facts to the corpus.
- A Cloudflare native rate limiter allows 20 requests/minute/IP per Cloudflare location. This is not a global billing cap or bot authentication. Keep an OpenRouter credit limit and consider a WAF rule for stronger abuse control. Origin checks stop other websites, not scripts.

## Updating content and translations

Edit `public/data/publications.json` for papers/talks and `profile.js` for biographical facts. `show: false` hides a paper from the page and retrieval, but the JSON file is public: remove private information entirely. Publication statuses are `published`, `accepted`, `in_review`, and `awaiting_review` and must not be conflated.

For UI text, update English and all eight translated dictionaries together. Tests require exact key parity, nonempty strings, and distinct publication-status labels. Arabic sets `dir="rtl"`; citation titles retain their original English text and direction. Run mobile and desktop checks after translation/layout changes, especially with long Russian/French strings and CJK/Arabic scripts.
