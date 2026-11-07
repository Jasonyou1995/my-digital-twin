// Frontend for the intro site + digital twin chat.
// Security notes:
//   - No API keys here. All model calls go through same-origin POST /api/chat.
//   - All dynamic text is rendered with textContent (never innerHTML) to block XSS
//     from model output or the data file.
//   - Chat history lives in memory only; nothing is stored in the browser.

(() => {
  "use strict";

  const MAX_CHARS = 1000;
  const MAX_HISTORY = 12; // mirrors the server cap

  const $ = (sel) => document.querySelector(sel);
  const el = (tag, className, text) => {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  };

  document.addEventListener("DOMContentLoaded", () => {
    $("#year").textContent = String(new Date().getFullYear());
    initChat();
    loadPublications();
  });

  // ---------------------------------------------------------------- chat ---
  function initChat() {
    const form = $("#chat-form");
    const input = $("#chat-input");
    const send = $("#chat-send");
    const log = $("#chat-log");
    const empty = $("#chat-empty");
    const count = $("#chat-count");
    const errorEl = $("#chat-error");
    const reset = $("#chat-reset");

    /** @type {{role: "user"|"assistant", content: string}[]} */
    let history = [];
    let busy = false;

    const autosize = () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 160) + "px";
      count.textContent = String(input.value.length);
    };

    const scrollToEnd = () => {
      log.scrollTop = log.scrollHeight;
    };

    const addBubble = (role, text) => {
      if (empty.isConnected) empty.remove();
      const row = el("div", role === "user" ? "flex justify-end" : "flex justify-start");
      const bubble = el("div", role === "user" ? "bubble bubble-user" : "bubble bubble-twin");
      if (role !== "user") bubble.appendChild(el("span", "bubble-tag", "twin"));
      bubble.appendChild(el("p", "whitespace-pre-wrap break-words", text));
      row.appendChild(bubble);
      log.appendChild(row);
      scrollToEnd();
      return row;
    };

    const addTyping = () => {
      const row = el("div", "flex justify-start");
      row.setAttribute("aria-label", "Twin is typing");
      const bubble = el("div", "bubble bubble-twin flex items-center gap-1.5");
      for (let i = 0; i < 3; i++) bubble.appendChild(el("span", "typing-dot"));
      row.appendChild(bubble);
      log.appendChild(row);
      scrollToEnd();
      return row;
    };

    const setBusy = (state) => {
      busy = state;
      send.disabled = state;
      input.setAttribute("aria-busy", String(state));
      send.textContent = state ? "..." : "Send";
    };

    // On failure: drop the unanswered turn and put the text back so a retry is clean.
    const rollback = (row, content, message) => {
      history.pop();
      row.remove();
      if (!log.querySelector(".bubble")) log.replaceChildren(empty);
      input.value = content;
      autosize();
      errorEl.textContent = message;
    };

    const ask = async (text) => {
      const content = text.trim().slice(0, MAX_CHARS);
      if (!content || busy) return;
      errorEl.textContent = "";

      history.push({ role: "user", content });
      history = history.slice(-MAX_HISTORY);
      const userRow = addBubble("user", content);
      input.value = "";
      autosize();
      setBusy(true);
      const typing = addTyping();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        const data = await res.json().catch(() => ({}));
        typing.remove();

        if (!res.ok || typeof data.reply !== "string") {
          rollback(userRow, content, (data && data.error) || "Something went wrong. Try again.");
          return;
        }

        history.push({ role: "assistant", content: data.reply });
        addBubble("assistant", data.reply);
      } catch {
        typing.remove();
        rollback(userRow, content, "Network error. Check your connection and try again.");
      } finally {
        setBusy(false);
        input.focus();
      }
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      ask(input.value);
    });

    input.addEventListener("input", autosize);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        form.requestSubmit();
      }
    });

    log.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-prompt]");
      if (chip) ask(chip.getAttribute("data-prompt"));
    });

    reset.addEventListener("click", () => {
      history = [];
      log.replaceChildren(empty);
      errorEl.textContent = "";
      input.focus();
    });

    document.querySelectorAll("[data-focus-chat]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        input.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
        input.focus({ preventScroll: true });
      })
    );
  }

  // -------------------------------------------------------- publications ---
  async function loadPublications() {
    const list = $("#pub-list");
    const filters = $("#pub-filters");
    const talks = $("#talk-list");

    let data;
    try {
      const res = await fetch("/data/publications.json", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      data = await res.json();
    } catch {
      list.replaceChildren();
      list.removeAttribute("aria-busy");
      $("#pub-error").classList.remove("hidden");
      return;
    }

    const pubs = (data.publications || []).filter((p) => p.show !== false);
    const labels = data.statusLabels || {};
    const order = ["published", "accepted", "in_review", "awaiting_review"];

    $("#stat-papers").textContent = String(pubs.filter((p) => p.status === "published" || p.status === "accepted").length);

    const render = (status) => {
      const rows = pubs
        .filter((p) => status === "all" || p.status === status || (status === "review" && /review/.test(p.status)))
        .sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || b.year - a.year || b.id - a.id);
      list.replaceChildren(...rows.map((p) => pubRow(p, labels)));
      list.removeAttribute("aria-busy");
    };

    const groups = [
      ["all", "All"],
      ["published", "Published"],
      ["accepted", "Accepted"],
      ["review", "Under review"],
    ];
    groups.forEach(([key, label], i) => {
      const n = key === "all" ? pubs.length : pubs.filter((p) => (key === "review" ? /review/.test(p.status) : p.status === key)).length;
      if (n === 0) return;
      const b = el("button", "chip", `${label} · ${n}`);
      b.type = "button";
      b.setAttribute("aria-pressed", String(i === 0));
      b.addEventListener("click", () => {
        filters.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        render(key);
      });
      filters.appendChild(b);
    });
    render("all");

    talks.replaceChildren(
      ...(data.talks || []).map((t) => {
        const li = el("li", "timeline-row");
        li.appendChild(el("span", "timeline-date", String(t.year)));
        const body = el("div");
        body.appendChild(el("h3", "font-medium", t.title));
        body.appendChild(el("p", "timeline-org", [t.event, t.location].filter(Boolean).join(" · ")));
        if (isSafeUrl(t.url)) body.appendChild(link(t.url, "Watch the talk"));
        li.appendChild(body);
        return li;
      })
    );
  }

  function pubRow(p, labels) {
    const li = el("li", "grid gap-2 py-5 sm:grid-cols-[7rem_1fr] sm:gap-6");
    const meta = el("div", "flex items-start gap-2 sm:flex-col sm:gap-1");
    meta.appendChild(el("span", "font-mono text-xs text-mute", String(p.year)));
    meta.appendChild(el("span", `status status-${p.status}`, labels[p.status] || p.status));
    li.appendChild(meta);

    const body = el("div");
    body.appendChild(el("h3", "font-medium leading-snug", p.title));
    body.appendChild(el("p", "mt-1 text-sm text-mute", p.authors));
    const venue = [p.venue, p.location, p.pages ? `pp. ${p.pages}` : null].filter(Boolean).join(" · ");
    body.appendChild(el("p", "mt-1 text-sm text-mute/80 italic", venue));

    const links = el("div", "mt-2 flex flex-wrap gap-4");
    if (p.doi) links.appendChild(link(`https://doi.org/${encodeURIComponent(p.doi).replace(/%2F/g, "/")}`, "DOI"));
    if (p.arxiv) links.appendChild(link(`https://arxiv.org/abs/${encodeURIComponent(p.arxiv)}`, "arXiv"));
    if (isSafeUrl(p.talk)) links.appendChild(link(p.talk, "Talk"));
    if (links.childElementCount) body.appendChild(links);

    li.appendChild(body);
    return li;
  }

  function link(href, text) {
    const a = el("a", "text-link", text);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  }

  function isSafeUrl(u) {
    try {
      return typeof u === "string" && new URL(u).protocol === "https:";
    } catch {
      return false;
    }
  }
})();
