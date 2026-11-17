const FAVORITES_KEY = "stoa.favorites";
const FONT_KEY = "stoa.font";
const FONT_SIZES = [
  { value: "small", label: "글자 작게" },
  { value: "medium", label: "글자 보통" },
  { value: "large", label: "글자 크게" },
];

const $ = (id) => document.getElementById(id);

// Private browsing can block storage, so the quote must still render without it.
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The change still applies until the page closes.
  }
}

// Uses the local calendar date so the quote changes at the rider's midnight, not UTC's.
function dayNumber(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

function quoteForDay(day) {
  return QUOTES[((day % QUOTES.length) + QUOTES.length) % QUOTES.length];
}

const stored = load(FAVORITES_KEY, []);
let favorites = Array.isArray(stored) ? stored : [];
let fontIndex = FONT_SIZES.findIndex((size) => size.value === load(FONT_KEY, "medium"));
if (fontIndex < 0) fontIndex = 1;
let todayDay = null;
let dayOffset = 0; // 0 is today, 1 is yesterday, and so on.
let current = null;
let view = "today";

function renderToday() {
  const now = new Date();
  todayDay = dayNumber(now);
  const shown = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset);
  current = quoteForDay(todayDay - dayOffset);
  $("today-date").textContent = shown.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  $("quote-text").textContent = current.text;
  $("quote-author").textContent = current.author;
  $("quote-source").textContent = current.source;
  $("quote-reflection").textContent = current.reflection;
  $("reflection-title").textContent = dayOffset === 0 ? "오늘의 생각거리" : "이날의 생각거리";
  $("next-day").disabled = dayOffset === 0;
  // Going back a full cycle would only repeat quotes already shown.
  $("prev-day").disabled = dayOffset >= QUOTES.length - 1;
  renderSaveButton();
}

function moveDay(step) {
  dayOffset = Math.min(Math.max(dayOffset + step, 0), QUOTES.length - 1);
  renderToday();
  $("scroller").scrollTop = 0;
}

function renderSaveButton() {
  const saved = favorites.includes(current.id);
  $("toggle-save").setAttribute("aria-pressed", String(saved));
  $("toggle-save-label").textContent = saved ? "저장됨" : "저장";
}

function renderSaved() {
  const list = $("saved-list");
  const items = favorites
    .map((id) => QUOTES.find((quote) => quote.id === id))
    .filter(Boolean)
    .reverse();
  list.replaceChildren(
    ...items.map((quote) => {
      const li = document.createElement("li");
      const text = document.createElement("p");
      text.textContent = quote.text;
      const meta = document.createElement("div");
      meta.className = "meta";
      const author = document.createElement("span");
      author.className = "author";
      author.textContent = quote.author;
      const source = document.createElement("span");
      source.className = "source";
      source.textContent = quote.source;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove";
      remove.textContent = "삭제";
      remove.setAttribute("aria-label", `${quote.source} 저장 삭제`);
      remove.addEventListener("click", () => toggleFavorite(quote.id));
      meta.append(author, source, remove);
      li.append(text, meta);
      return li;
    }),
  );
  $("saved-empty").hidden = items.length > 0;
}

function toggleFavorite(id) {
  favorites = favorites.includes(id)
    ? favorites.filter((favorite) => favorite !== id)
    : [...favorites, id];
  save(FAVORITES_KEY, favorites);
  renderSaveButton();
  if (view === "saved") renderSaved();
}

function showView(next) {
  view = next;
  $("today-view").hidden = next !== "today";
  $("saved-view").hidden = next !== "saved";
  $("toggle-save").hidden = next !== "today";
  for (const [id, name] of [["nav-today", "today"], ["nav-saved", "saved"]]) {
    if (name === next) $(id).setAttribute("aria-current", "page");
    else $(id).removeAttribute("aria-current");
  }
  if (next === "saved") renderSaved();
  $("scroller").scrollTop = 0;
}

function applyFont() {
  const size = FONT_SIZES[fontIndex];
  document.documentElement.dataset.font = size.value;
  $("font-size-label").textContent = size.label;
}

$("nav-today").addEventListener("click", () => {
  if (dayOffset !== 0) {
    dayOffset = 0;
    renderToday();
  }
  showView("today");
});
$("prev-day").addEventListener("click", () => moveDay(1));
$("next-day").addEventListener("click", () => moveDay(-1));
$("nav-saved").addEventListener("click", () => showView("saved"));
$("toggle-save").addEventListener("click", () => toggleFavorite(current.id));
$("font-size").addEventListener("click", () => {
  fontIndex = (fontIndex + 1) % FONT_SIZES.length;
  save(FONT_KEY, FONT_SIZES[fontIndex].value);
  applyFont();
});

// An installed app can stay suspended overnight, so recheck the date when it returns.
function refreshIfNewDay() {
  if (dayNumber(new Date()) !== todayDay) {
    dayOffset = 0;
    renderToday();
  }
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") refreshIfNewDay();
});
window.addEventListener("pageshow", refreshIfNewDay);

applyFont();
renderToday();
showView("today");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {
    // The app still works online without offline support.
  });
}
