
// ---- Your images -------------------------------------------------------
// Replace `src` with your own files, e.g. "images/mountain.jpg".
// `w` and `h` only set the placeholder shape from picsum.photos.
const IMAGES = [
  { id: 10,   title: "Forest path",     category: "Nature",  w: 800, h: 1000 },
  { id: 15,   title: "Waterfall",       category: "Nature",  w: 800, h: 600 },
  { id: 1015, title: "River valley",    category: "Nature",  w: 800, h: 560 },
  { id: 1018, title: "Mountain range",  category: "Nature",  w: 800, h: 1100 },
  { id: 1035, title: "Falls in spring", category: "Nature",  w: 800, h: 700 },
  { id: 1036, title: "Snow ridge",      category: "Nature",  w: 800, h: 520 },
  { id: 237,  title: "Black puppy",     category: "Animals", w: 800, h: 1050 },
  { id: 1024, title: "Bird portrait",   category: "Animals", w: 800, h: 640 },
  { id: 1025, title: "Pug on a rug",    category: "Animals", w: 800, h: 800 },
  { id: 1074, title: "Lion",            category: "Animals", w: 800, h: 560 },
  { id: 1020, title: "Brown bear",      category: "Animals", w: 800, h: 900 },
  { id: 1084, title: "Dog outdoors",    category: "Animals", w: 800, h: 720 },
  { id: 238,  title: "City lights",     category: "City",    w: 800, h: 620 },
  { id: 244,  title: "Downtown",        category: "City",    w: 800, h: 1000 },
  { id: 1040, title: "Old castle",      category: "City",    w: 800, h: 700 },
  { id: 164,  title: "Side street",     category: "City",    w: 800, h: 540 },
  { id: 122,  title: "Bridge crossing", category: "City",    w: 800, h: 880 },
  { id: 116,  title: "Market square",   category: "City",    w: 800, h: 600 },
].map((img) => ({
  ...img,
  thumb: `https://picsum.photos/id/${img.id}/${img.w}/${img.h}`,
  src: `https://picsum.photos/id/${img.id}/${img.w * 2}/${img.h * 2}`,
  fallback: `https://picsum.photos/seed/${img.title.replace(/\s/g, "")}/${img.w}/${img.h}`,
}));

// ---- Elements ----------------------------------------------------------
const grid = document.getElementById("grid");
const filtersEl = document.getElementById("filters");
const countEl = document.getElementById("count");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbTitle = document.getElementById("lbTitle");
const lbCounter = document.getElementById("lbCounter");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");

let activeCategory = "All";
let visible = [];
let current = 0;
let lastFocused = null;

// ---- Filters -----------------------------------------------------------
const categories = ["All", ...new Set(IMAGES.map((i) => i.category))];

categories.forEach((cat) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = cat;
  btn.setAttribute("aria-pressed", cat === activeCategory);
  btn.addEventListener("click", () => {
    activeCategory = cat;
    filtersEl.querySelectorAll("button").forEach((b) =>
      b.setAttribute("aria-pressed", b === btn)
    );
    render();
  });
  filtersEl.appendChild(btn);
});

// ---- Grid --------------------------------------------------------------
function render() {
  visible = IMAGES.filter((i) => activeCategory === "All" || i.category === activeCategory);
  grid.innerHTML = "";

  visible.forEach((img, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "item";
    item.setAttribute("aria-label", `Open ${img.title}`);
    item.style.animationDelay = `${Math.min(index * 30, 300)}ms`;

    const el = document.createElement("img");
    el.src = img.thumb;
    el.alt = img.title;
    el.loading = "lazy";
    el.addEventListener("error", () => { el.src = img.fallback; }, { once: true });

    const cap = document.createElement("span");
    cap.className = "cap";
    cap.textContent = img.title;

    item.append(el, cap);
    item.addEventListener("click", () => openLightbox(index, item));
    grid.appendChild(item);
  });

  countEl.textContent = `${visible.length} ${visible.length === 1 ? "image" : "images"}`;
}

// ---- Lightbox ----------------------------------------------------------
function show(index) {
  current = (index + visible.length) % visible.length;
  const img = visible[current];

  lbImg.classList.add("loading");
  lbImg.onload = () => lbImg.classList.remove("loading");
  lbImg.onerror = () => { lbImg.onerror = null; lbImg.src = img.fallback; };
  lbImg.src = img.src;
  lbImg.alt = img.title;
  lbTitle.textContent = img.title;
  lbCounter.textContent = `${current + 1} / ${visible.length}`;

  // Preload neighbours so next/prev feel instant
  [current + 1, current - 1].forEach((i) => {
    new Image().src = visible[(i + visible.length) % visible.length].src;
  });
}

function openLightbox(index, trigger) {
  lastFocused = trigger;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  show(index);
  lbClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

lbClose.addEventListener("click", closeLightbox);
lbPrev.addEventListener("click", () => show(current - 1));
lbNext.addEventListener("click", () => show(current + 1));

// Click on the dark backdrop closes the viewer
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard: arrows to navigate, Esc to close, Tab stays inside the viewer
document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowRight") show(current + 1);
  else if (e.key === "ArrowLeft") show(current - 1);
  else if (e.key === "Tab") {
    const btns = [lbClose, lbPrev, lbNext];
    const i = btns.indexOf(document.activeElement);
    e.preventDefault();
    btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
  }
});

// Swipe on touch screens
let touchX = null;
lightbox.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  touchX = null;
});

render();