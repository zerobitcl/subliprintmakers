/**
 * SubliPrint Makers — filtros, lightbox, menú y cotizador.
 * Sin librerías. El número principal vive en una sola constante.
 *
 * WhatsApp principal: +56971021394
 * Los href estáticos del HTML usan el mismo número.
 * Si hay que cambiarlo, actualiza esta constante y los enlaces wa.me.
 * Respaldo: +56961357946
 */
const WHATSAPP_NUMBER = "56971021394";
// const WHATSAPP_NUMBER_SECUNDARIO = "56961357946";

const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();

const initHeader = () => {
  const header = document.querySelector(".header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
};

const initNav = () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#nav-menu");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only").textContent = open ? "Cerrar menú" : "Abrir menú";
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1040) setOpen(false);
  });
};

const initScrollSpy = () => {
  const links = [...document.querySelectorAll(".nav__list a[href^='#']")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const setCurrent = (id) => {
    links.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-current", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setCurrent(visible.target.id);
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: [0.15, 0.4] }
  );

  sections.forEach((section) => observer.observe(section));
};

const initCatalog = () => {
  const count = document.querySelector("#catalog-count");
  const inputs = [...document.querySelectorAll("input[name='catalogo']")];
  const products = [...document.querySelectorAll(".product")];
  if (!count || !inputs.length) return;

  const supportsHas = window.CSS?.supports?.("selector(:has(*))") ?? false;
  const labels = {
    todos: "todas las líneas",
    "3d": "Figuras y Mundo 3D",
    sublimacion: "Tazones y Sublimación",
    papeleria: "Papelería y Llaveros"
  };

  const render = () => {
    const selected = inputs.find((input) => input.checked);
    const key = selected ? selected.value : "todos";
    let visible = 0;
    products.forEach((product) => {
      const show = key === "todos" || product.dataset.category === key;
      if (!supportsHas) product.hidden = !show;
      if (show) visible += 1;
    });
    const noun = visible === 1 ? "creación" : "creaciones";
    count.textContent = `Mostrando ${visible} ${noun} en ${labels[key] || "el catálogo"}.`;
  };

  inputs.forEach((input) => input.addEventListener("change", render));
  render();
};

const initLightbox = () => {
  const dialog = document.querySelector("#lightbox");
  const image = dialog?.querySelector(".lightbox__img");
  const caption = dialog?.querySelector("#lightbox-caption");
  if (!dialog || !image || !caption || typeof dialog.showModal !== "function") return;

  let lastTrigger = null;

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-lightbox]");
    if (!trigger) return;
    const source = trigger.querySelector("img");
    if (!source) return;
    lastTrigger = trigger;
    image.src = source.currentSrc || source.getAttribute("src");
    image.alt = source.alt;
    caption.textContent = trigger.getAttribute("data-caption") || source.alt;
    dialog.showModal();
  });

  dialog.querySelector("[data-close]")?.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    lastTrigger?.focus();
  });
};

const initQuote = () => {
  const form = document.querySelector("#cotizador");
  if (!form) return;
  const status = form.querySelector("[data-status]");
  const fallback = form.querySelector("[data-fallback]");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const nombre = clean(data.get("nombre"));
    const linea = clean(data.get("linea"));
    const idea = clean(data.get("idea"));
    const message = [
      `Hola SubliPrint Makers, soy ${nombre}.`,
      `Quiero cotizar: ${linea}.`,
      `Mi idea: ${idea}`,
      "¿Me ayudan a pasarla de la imaginación a la realidad, capa por capa?"
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    if (fallback) {
      fallback.href = url;
      fallback.hidden = false;
    }
    if (status) status.textContent = "Listo. Se está abriendo WhatsApp con tu idea.";

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  });
};

initHeader();
initNav();
initScrollSpy();
initCatalog();
initLightbox();
initQuote();
