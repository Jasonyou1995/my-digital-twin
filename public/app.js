// Render untrusted model/data text with textContent only. Only locale is persisted.
(() => {
  'use strict';
  const LOCALES = ['en', 'zh-Hant', 'zh-Hans', 'es', 'pt-BR', 'fr', 'ru', 'ja', 'ar'];
  const $ = s => document.querySelector(s);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  // Complete offline fallback; keep synchronized with locales/en.json.
  const EN_FALLBACK = {
    "page.001": "Skip to chat",
    "page.002": "Work",
    "page.003": "Research",
    "page.004": "Talks",
    "page.006": "Making AI agents safe enough to touch money.",
    "page.007": "I'm a Computer Science PhD candidate at the University of Notre Dame, finishing in February 2027. My research covers blockchain trust, stablecoin risk, and the guardrails an AI agent needs before it signs a transaction. I'm based in Hong Kong and work on AI solutions engineering: private enterprise AI, reproducible evaluation, and automation a human approves.",
    "page.008": "Ask my digital twin",
    "page.009": "See the research",
    "page.010": "Papers out",
    "page.011": "published / accepted",
    "page.012": "Latest venue",
    "page.013": "IEEE ICBC",
    "page.014": "Shipped at",
    "page.015": "Hyperledger · GroAI · HKBU lecturer",
    "page.019": "clear",
    "page.020": "Hi, I’m Jason’s AI twin. Ask me about his work and research, or explore the ideas behind them. I can explain technical concepts and follow-up questions, with sources where available.",
    "page.021": "Try asking",
    "page.022": "PhD research, plainly",
    "page.023": "ICBC 2026 talk",
    "page.024": "Roles you want",
    "page.025": "GroAI and Hyperledger",
    "page.026": "Message the digital twin",
    "page.027": "Send",
    "page.028": "01 / Work",
    "page.029": "From ledgers to agents.",
    "page.030": "I started with blockchain infrastructure, moved into trust and risk research, and now build and evaluate AI agents for financial workflows.",
    "page.031": "Enterprise AI discovery and solution scoping",
    "page.032": "Independent project with a university research lab and business school",
    "page.033": "Scoping a private enterprise-data assistant for financial analysis and quoting: ERP data access, API write-back, and local deployment constraints.",
    "page.034": "Summer 2026",
    "page.035": "Agentic Engineering Intern",
    "page.036": "GroAI",
    "page.037": "Built ledger telemetry and pricing features for a sales AI agent with multi-agent orchestration, and wired search across several MCP servers.",
    "page.038": "2020 - now",
    "page.039": "Doctoral Research",
    "page.040": "University of Notre Dame",
    "page.041": "Trust-weighted stablecoin reserve controls and oracle reputation protocols. Oracle-manipulation studies on historical stress episodes and Foundry mainnet forks, with the limits written down.",
    "page.042": "Lecturer",
    "page.043": "Graduate-level Lecturer",
    "page.044": "Hong Kong Baptist University",
    "page.045": "Taught machine learning, deep learning and NLP to master's students.",
    "page.046": "Summer 2019",
    "page.047": "Software Engineering Intern",
    "page.048": "The Linux Foundation / Hyperledger",
    "page.049": "Built Caliper-GUI to configure and visualise blockchain benchmarks; benchmarked Hyperledger Fabric on AWS; presented at Hyperledger Global Forum 2020.",
    "page.050": "2018 - 2020",
    "page.051": "Graduate Student Researcher",
    "page.052": "Purdue University",
    "page.053": "Adversarial-ML simulations, a Go/ECDSA wallet, and a Hyperledger Fabric supply-chain prototype.",
    "page.054": "Education",
    "page.055": "PhD, Computer Science",
    "page.056": "Notre Dame · exp. Feb 2027",
    "page.057": "MS, CS (Information Security)",
    "page.058": "Purdue · 2019",
    "page.059": "BA, Mathematics",
    "page.060": "University of Washington · 2018",
    "page.061": "Stack",
    "page.062": "Python, Go, JavaScript, Solidity. AWS, Docker. LangChain, n8n. Multi-agent orchestration. ML/DL/NLP.",
    "page.063": "Languages",
    "page.064": "Mandarin (native)",
    "page.065": "English (professional)",
    "page.066": "Cantonese (learning)",
    "page.067": "02 / Research",
    "page.068": "Publications",
    "page.069": "Trust in blockchain systems, stablecoin stability, and how far an LLM agent can be trusted with on-chain value.",
    "page.070": "Couldn't load the publication list. Refresh to try again.",
    "page.071": "03 / Talks",
    "page.072": "On stage",
    "page.073": "©",
    "page.074": "Shengwei (Jason) You. The twin is an AI and can make mistakes.",
    "prompt.1": "What is your PhD research about, in plain words?",
    "prompt.2": "What did you present at IEEE ICBC 2026?",
    "prompt.3": "What kind of AI solutions roles are you looking for?",
    "prompt.4": "What did you build at GroAI and Hyperledger?",
    "language.label": "Language",
    "language.error": "This language could not be loaded. Please try again.",
    "chat.title": "A conversation with my twin",
    "chat.placeholder": "Ask about my work or research",
    "chat.sendLabel": "Send message",
    "chat.send": "Send",
    "chat.thinking": "Thinking…",
    "chat.twin": "Digital twin",
    "chat.sources": "Sources",
    "chat.privacy": "AI-generated answers. Chat stays in this page’s memory; messages are sent to the AI service to respond.",
    "nav.label": "Primary navigation",
    "research.filterLabel": "Filter publications",
    "filter.all": "All",
    "filter.published": "Published",
    "filter.accepted": "Accepted",
    "filter.review": "Under review",
    "status.published": "Published",
    "status.accepted": "Accepted",
    "status.in_review": "In review",
    "status.awaiting_review": "Awaiting review",
    "research.talk": "Talk",
    "research.pages": "pp.",
    "talk.watch": "Watch the talk",
    "error.generic": "Something went wrong. Please try again.",
    "error.network": "Could not connect. Check your connection and try again.",
    "error.rate_limited": "Too many requests. Please wait a moment and try again.",
    "error.unavailable": "The twin is temporarily unavailable. Please try again later.",
    "error.invalid_request": "Please enter a question of up to 1,000 characters.",
    "error.conversation_expired": "This conversation has expired. Clear the chat to start a new one.",
    "publication.1.title": "Trust in the Context of Blockchain Applications",
    "publication.2.title": "Mining User Behavior in Decentralized Applications for Blockchain Trust and Security Analytics",
    "publication.3.title": "Persona-Preserving Reputation Protocol (P2RP) for Enhanced Security, Privacy, and Trust in Blockchain Oracles",
    "publication.4.title": "Hybrid Stabilization Protocol for Cross-Chain Digital Assets Using Adaptor Signatures and AI-Driven Arbitrage",
    "publication.5.title": "MVF-Composer: Trust-Weighted Controller for Stress-Resilient Stablecoin Reserves",
    "publication.6.title": "ASAS-BridgeAMM: Pricing Latency Risk into a Three-State Bridge AMM",
    "publication.7.title": "Breaking the Peg, or Not: The Limited Power of Oracle Manipulation Against Early Stablecoin Depeg Prediction",
    "publication.8.title": "Three Facts at the Signing Prompt: What Compiled Financial Regulation Can Decide for AI-Agent Transactions",
    "publication.9.title": "DEFIHARM: Measuring Configuration-Conditional Harm of LLM Agents on Forked DeFi State",
    "publication.10.title": "Does the Judge Backend Matter? A Controlled Comparison of Decision-Native and Chat-Completion Verdict Mechanisms in a Formally-Verified Agent-Consensus Primitive for DeFi",
    "talk.0.title": "MVF-Composer: Trust-Weighted Controller for Stress-Resilient Stablecoin Reserves",
    "talk.0.location": "Brisbane, Australia",
    "talk.1.title": "Caliper-GUI for Hyperledger Caliper"
  };
  let locale = 'en', english = {...EN_FALLBACK}, dictionary = {}, publications = null, filter = 'all', languageVersion = 0;
  let refreshChat = () => {};
  const t = key => dictionary[key] || english[key] || key;
  const localized = key => { const n = el('span', '', t(key)); n.dataset.i18n = key; return n; };
  const safeUrl = u => { try { return typeof u === 'string' && ['https:', 'http:'].includes(new URL(u).protocol); } catch { return false; } };
  function link(url, label) { const n = el('a', 'text-link', label); n.href = url; n.target = '_blank'; n.rel = 'noopener noreferrer'; return n; }
  async function getDictionary(code) { const r = await fetch(`/locales/${code}.json`); if (!r.ok) throw new Error('locale'); return r.json(); }
  function translatePage() {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(n => n.textContent = t(n.dataset.i18n));
    document.querySelectorAll('[data-i18n-placeholder]').forEach(n => n.placeholder = t(n.dataset.i18nPlaceholder));
    document.querySelectorAll('[data-i18n-aria-label]').forEach(n => n.setAttribute('aria-label', t(n.dataset.i18nAriaLabel)));
    $('#language-select').value = locale;
    refreshChat();
    if (publications) renderPublications();
  }
  async function setLanguage(code, persist = true) {
    if (!LOCALES.includes(code)) code = 'en';
    const version = ++languageVersion;
    try {
      const next = code === 'en' ? english : await getDictionary(code);
      if (version !== languageVersion) return;
      dictionary = next; locale = code; translatePage(); $('#language-error').textContent = '';
      if (persist) { try { localStorage.setItem('twin.locale', code); } catch {} }
    } catch {
      if (version !== languageVersion) return;
      $('#language-select').value = locale;
      $('#language-error').textContent = t('language.error');
    }
  }
  document.addEventListener('DOMContentLoaded', async () => {
    $('#year').textContent = String(new Date().getFullYear());
    initChat();
    $('#language-select').addEventListener('change', e => setLanguage(e.target.value));
    try { english = await getDictionary('en'); } catch {}
    let selected = 'en';
    try { selected = localStorage.getItem('twin.locale') || 'en'; } catch {}
    await setLanguage(selected, false);
    loadPublications();
  });
  function initChat() {
    const form = $('#chat-form'), input = $('#chat-input'), send = $('#chat-send'), log = $('#chat-log'), empty = $('#chat-empty'), error = $('#chat-error');
    let history = [], conversationToken = null, busy = false, expired = false, controller = null, generation = 0, errorKey = '';
    const autosize = () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 160) + 'px'; $('#chat-count').textContent = String(input.value.length); };
    const scroll = () => log.scrollTop = log.scrollHeight;
    const setBusy = state => { busy = state; send.disabled = state || expired; input.setAttribute('aria-busy', String(state)); send.textContent = t(state ? 'chat.thinking' : 'chat.send'); };
    refreshChat = () => {
      setBusy(busy); if (errorKey) error.textContent = t(errorKey);
      // Empty state may be detached during a conversation.
      empty.querySelectorAll('[data-i18n]').forEach(n => n.textContent = t(n.dataset.i18n));
    };
    function addBubble(role, text, sources) {
      empty.remove();
      const row = el('div', `message message-${role}`), bubble = el('div', `bubble bubble-${role === 'user' ? 'user' : 'twin'}`);
      if (role === 'assistant') { const tag = localized('chat.twin'); tag.className = 'bubble-tag'; bubble.append(tag); }
      const p = el('p', 'message-text', text); p.dir = 'auto'; bubble.append(p);
      if (Array.isArray(sources) && sources.length) {
        const block = el('div', 'chat-sources'); block.append(localized('chat.sources'));
        const list = el('ul');
        for (const source of sources.slice(0, 8)) {
          if (!source || typeof source.title !== 'string') continue;
          const li = el('li');
          let url = source.url;
          if (typeof url === 'string' && /^\/#(?:work|research|talks)$/.test(url)) url = new URL(url, location.origin).href;
          li.append(safeUrl(url) ? link(url, source.title) : el('span', '', source.title)); list.append(li);
        }
        if (list.childElementCount) { block.append(list); bubble.append(block); }
      }
      row.append(bubble); log.append(row); scroll(); return row;
    }
    async function ask(text) {
      const content = text.trim().slice(0, 1000); if (!content || busy || expired) return;
      const current = ++generation; controller = new AbortController();
      errorKey = ''; error.textContent = '';
      const previous = history.slice();
      history = [...history, {role:'user', content}].slice(-12);
      const row = addBubble('user', content); input.value = ''; autosize(); setBusy(true);
      const typing = el('div', 'typing-indicator'); typing.append(localized('chat.thinking')); log.append(typing); scroll();
      const rollback = key => { history = previous; row.remove(); if (!log.querySelector('.bubble')) log.replaceChildren(empty); input.value = content; autosize(); errorKey = key; error.textContent = t(key); };
      try {
        const response = await fetch('/api/chat', {method:'POST', headers:{'Content-Type':'application/json'}, signal:controller.signal,
          body:JSON.stringify({messages:[{role:"user", content}], locale, ...(conversationToken ? {conversationToken} : {})})});
        const data = await response.json().catch(() => ({}));
        if (current !== generation) return;
        typing.remove();
        if (!response.ok || typeof data.reply !== 'string') {
          const code = typeof data.code === 'string' ? data.code.toLowerCase() : '';
          const errors = {busy:response.status === 429 ? 'rate_limited' : 'unavailable', offline:'unavailable', timeout:'unavailable', unreadable:'unavailable', invalid:'invalid_request', toolong:'invalid_request', sessionexpired:'conversation_expired', rate_limited:'rate_limited', unavailable:'unavailable', invalid_request:'invalid_request', conversation_expired:'conversation_expired'};
          if (code === 'sessionexpired' || response.status === 409) { conversationToken = null; expired = true; }
          rollback(errors[code] ? `error.${errors[code]}` : response.status === 429 ? 'error.rate_limited' : response.status >= 500 ? 'error.unavailable' : 'error.generic'); return;
        }
        history.push({role:'assistant', content:data.reply});
        conversationToken = typeof data.conversationToken === 'string' ? data.conversationToken : conversationToken;
        addBubble('assistant', data.reply, data.sources);
      } catch (e) {
        if (current !== generation || e.name === 'AbortError') return;
        typing.remove(); rollback('error.network');
      } finally { if (current === generation) { typing.remove(); controller = null; setBusy(false); input.focus(); } }
    }
    form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); });
    input.addEventListener('input', autosize);
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
    log.addEventListener('click', e => { const chip = e.target.closest('[data-prompt-key]'); if (chip) ask(t(chip.dataset.promptKey)); });
    $('#chat-reset').addEventListener('click', () => {
      generation++; controller?.abort(); controller = null; history = []; conversationToken = null; expired = false;
      log.replaceChildren(empty); errorKey = ''; error.textContent = ''; input.value = ''; autosize(); setBusy(false); input.focus();
    });
    document.querySelectorAll('[data-focus-chat]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault(); input.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto':'smooth', block:'center'}); input.focus({preventScroll:true});
    }));
  }
  async function loadPublications() {
    try { const r = await fetch('/data/publications.json'); if (!r.ok) throw new Error(); publications = await r.json(); renderPublications(); }
    catch { $('#pub-list').replaceChildren(); $('#pub-list').removeAttribute('aria-busy'); $('#pub-error').classList.remove('hidden'); }
  }
  function translatedTitle(body, key, original) {
    const title = dictionary[key] || english[key] || original;
    body.append(el('h3', 'publication-title', title));
    if (title !== original) { const n = el('p', 'original-title', original); n.lang = 'en'; n.dir = 'ltr'; body.append(n); }
  }
  function renderPublications() {
    const pubs = (publications.publications || []).filter(p => p.show !== false), order = ['published','accepted','in_review','awaiting_review'];
    const matches = (p, key) => key === 'all' || p.status === key || key === 'review' && p.status === 'in_review';
    $('#stat-papers').textContent = String(pubs.filter(p => ['published','accepted'].includes(p.status)).length);
    const filters = $('#pub-filters'); filters.replaceChildren();
    ['all','published','accepted','review','awaiting_review'].forEach(key => {
      const count = pubs.filter(p => matches(p,key)).length; if (!count) return;
      const button = el('button','chip',`${t((key === 'awaiting_review' ? 'status.' : 'filter.')+key)} · ${count}`); button.type = 'button'; button.setAttribute('aria-pressed', String(filter === key));
      button.addEventListener('click', () => { filter = key; renderPublications(); $('#pub-filters [aria-pressed="true"]')?.focus({preventScroll:true}); }); filters.append(button);
    });
    $('#pub-list').replaceChildren(...pubs.filter(p => matches(p,filter)).sort((a,b) => order.indexOf(a.status)-order.indexOf(b.status) || b.year-a.year || b.id-a.id).map(p => {
      const li = el('li','publication-row'), meta = el('div','publication-meta'), body = el('div');
      meta.append(el('span','timeline-date',String(p.year)),el('span',`status status-${p.status}`,t('status.'+p.status)));
      translatedTitle(body,`publication.${p.id}.title`,p.title);
      const authors = el('p','publication-detail',p.authors); authors.dir = 'ltr'; authors.lang = 'en'; body.append(authors);
      const venue = el('p','publication-venue',[p.venue,p.location,p.pages ? `${t('research.pages')} ${p.pages}`:null].filter(Boolean).join(' · ')); venue.dir = 'auto'; body.append(venue);
      const links = el('div','publication-links');
      if (p.doi) links.append(link(`https://doi.org/${encodeURIComponent(p.doi).replace(/%2F/g,'/')}`,'DOI'));
      if (p.arxiv) links.append(link(`https://arxiv.org/abs/${encodeURIComponent(p.arxiv)}`,'arXiv'));
      if (safeUrl(p.talk)) links.append(link(p.talk,t('research.talk')));
      body.append(links); li.append(meta,body); return li;
    }));
    $('#pub-list').removeAttribute('aria-busy');
    $('#talk-list').replaceChildren(...(publications.talks || []).map((talk,i) => {
      const li = el('li','timeline-row'), body = el('div'); li.append(el('span','timeline-date',String(talk.year)));
      translatedTitle(body,`talk.${i}.title`,talk.title);
      body.append(el('p','timeline-org',[talk.event,talk.location ? dictionary[`talk.${i}.location`] || talk.location : null].filter(Boolean).join(' · ')));
      if (safeUrl(talk.url)) body.append(link(talk.url,t('talk.watch'))); li.append(body); return li;
    }));
  }
})();
