/* FROST-HVACR — interactions */
(() => {
  "use strict";

  const WA_NUMBER = "16468126369";
  const STORAGE_THEME = "frost-theme";
  const STORAGE_LANG  = "frost-lang";
  const DEFAULT_LANG  = "en";

  const safeStorage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch { /* private mode */ } }
  };

  /* ---------- Year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 5-star generation (avoid HTML duplication) ---------- */
  const starsEl = document.querySelector(".stars");
  if (starsEl) {
    const STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z"/></svg>';
    starsEl.innerHTML = STAR.repeat(5);
  }

  /* ---------- Theme ---------- */
  const themeToggle = document.getElementById("themeToggle");
  const getTheme = () => document.documentElement.getAttribute("data-theme") || "light";
  const setTheme = (t) => {
    document.documentElement.setAttribute("data-theme", t);
    safeStorage.set(STORAGE_THEME, t);
  };
  themeToggle?.addEventListener("click", () => setTheme(getTheme() === "dark" ? "light" : "dark"));

  /* ---------- Language (i18n via data-en / data-es / data-en-html / data-es-html) ---------- */
  const langToggle = document.getElementById("langToggle");
  const getLang = () => document.documentElement.getAttribute("lang") || DEFAULT_LANG;

  function applyLang(lang) {
    document.documentElement.setAttribute("lang", lang);

    // textContent (safe by default)
    document.querySelectorAll("[data-en]").forEach((el) => {
      const val = el.getAttribute(`data-${lang}`);
      if (val !== null) el.textContent = val;
    });

    // explicit HTML opt-in (controlled by author)
    document.querySelectorAll("[data-en-html]").forEach((el) => {
      const val = el.getAttribute(`data-${lang}-html`);
      if (val !== null) el.innerHTML = val;
    });

    // placeholders
    document.querySelectorAll("[data-en-placeholder]").forEach((el) => {
      const val = el.getAttribute(`data-${lang}-placeholder`);
      if (val !== null) el.setAttribute("placeholder", val);
    });

    // aria-labels (e.g. theme toggle)
    document.querySelectorAll("[data-en-label]").forEach((el) => {
      const val = el.getAttribute(`data-${lang}-label`);
      if (val !== null) el.setAttribute("aria-label", val);
    });

    if (langToggle) {
      const active   = langToggle.querySelector(".lang-active");
      const inactive = langToggle.querySelector(".lang-inactive");
      if (active && inactive) {
        active.textContent   = lang === "es" ? "ES" : "EN";
        inactive.textContent = lang === "es" ? "EN" : "ES";
      }
    }
  }

  applyLang(getLang());

  langToggle?.addEventListener("click", () => {
    const next = getLang() === "en" ? "es" : "en";
    safeStorage.set(STORAGE_LANG, next);
    applyLang(next);
  });

  /* ---------- Form -> WhatsApp ---------- */
  const form = document.getElementById("contactForm");
  if (!form) return;

  const t = {
    en: {
      title: "*New Service Request — FROST-HVACR*",
      labels: { name: "Name", phone: "Phone", addr: "Address/Zip", svc: "Service", msg: "Message" },
      errors: {
        name:    "Please enter your full name.",
        phone:   "Please enter a valid phone number.",
        service: "Select a service.",
        message: "Tell us briefly what's happening."
      }
    },
    es: {
      title: "*Nueva Solicitud — FROST-HVACR*",
      labels: { name: "Nombre", phone: "Teléfono", addr: "Dirección/Zip", svc: "Servicio", msg: "Mensaje" },
      errors: {
        name:    "Escribe tu nombre completo.",
        phone:   "Escribe un teléfono válido.",
        service: "Selecciona un servicio.",
        message: "Cuéntanos qué está pasando."
      }
    }
  };

  function showError(field, msg) {
    const input = form.elements[field];
    const errEl = document.getElementById(`${field}-error`);
    if (input) input.setAttribute("aria-invalid", "true");
    if (errEl) { errEl.textContent = msg; errEl.hidden = false; }
  }
  function clearError(field) {
    const input = form.elements[field];
    const errEl = document.getElementById(`${field}-error`);
    if (input) input.removeAttribute("aria-invalid");
    if (errEl) { errEl.textContent = ""; errEl.hidden = true; }
  }
  function clearAllErrors() { ["name", "phone", "service", "message"].forEach(clearError); }

  // Clear error on user input
  ["name", "phone", "service", "message"].forEach((f) => {
    form.elements[f]?.addEventListener("input", () => clearError(f));
    form.elements[f]?.addEventListener("change", () => clearError(f));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearAllErrors();

    const data = Object.fromEntries(new FormData(form));
    const name    = (data.name    || "").trim();
    const phone   = (data.phone   || "").trim();
    const address = (data.address || "").trim();
    const service = (data.service || "").trim();
    const message = (data.message || "").trim();
    const lang    = getLang() === "es" ? "es" : "en";
    const dict    = t[lang];

    const phoneDigits = phone.replace(/\D/g, "");
    let hasError = false;
    if (!name)                       { showError("name",    dict.errors.name);    hasError = true; }
    if (phoneDigits.length < 7)      { showError("phone",   dict.errors.phone);   hasError = true; }
    if (!service)                    { showError("service", dict.errors.service); hasError = true; }
    if (!message)                    { showError("message", dict.errors.message); hasError = true; }
    if (hasError) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const lines = [
      dict.title,
      "",
      `👤 *${dict.labels.name}:* ${name}`,
      `📞 *${dict.labels.phone}:* ${phone}`,
      address ? `📍 *${dict.labels.addr}:* ${address}` : null,
      `🛠️ *${dict.labels.svc}:* ${service}`,
      "",
      `📝 *${dict.labels.msg}:*`,
      message
    ].filter(Boolean);

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
  });
})();
