// FROST-HVACR — form -> WhatsApp + theme + language
const WA_NUMBER = "16468126369"; // (646) 812-6369

document.getElementById("year").textContent = new Date().getFullYear();

/* ===== THEME (light / dark) ===== */
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("frost-theme") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
document.documentElement.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("frost-theme", next);
});

/* ===== LANGUAGE (EN / ES) ===== */
const langToggle = document.getElementById("langToggle");
const savedLang = localStorage.getItem("frost-lang") ||
  (navigator.language && navigator.language.toLowerCase().startsWith("es") ? "es" : "en");

function applyLang(lang){
  document.documentElement.setAttribute("lang", lang);

  document.querySelectorAll("[data-en]").forEach(el => {
    const val = el.getAttribute(`data-${lang}`);
    if (val !== null) el.innerHTML = val;
  });

  document.querySelectorAll("[data-en-placeholder]").forEach(el => {
    const val = el.getAttribute(`data-${lang}-placeholder`);
    if (val !== null) el.setAttribute("placeholder", val);
  });

  const active = langToggle.querySelector(".lang-active");
  const inactive = langToggle.querySelector(".lang-inactive");
  if (lang === "es"){ active.textContent = "ES"; inactive.textContent = "EN"; }
  else { active.textContent = "EN"; inactive.textContent = "ES"; }
}

applyLang(savedLang);

langToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("lang") || "en";
  const next = current === "en" ? "es" : "en";
  localStorage.setItem("frost-lang", next);
  applyLang(next);
});

/* ===== FORM -> WhatsApp ===== */
const form = document.getElementById("contactForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name    = form.name.value.trim();
  const phone   = form.phone.value.trim();
  const address = form.address.value.trim();
  const service = form.service.value.trim();
  const message = form.message.value.trim();
  const lang    = document.documentElement.getAttribute("lang") || "en";

  if (!name || !phone || !service || !message) {
    alert(lang === "es"
      ? "Por favor completa nombre, teléfono, servicio y mensaje."
      : "Please fill in name, phone, service and message.");
    return;
  }

  const labels = lang === "es"
    ? { title:"*Nueva Solicitud — FROST-HVACR*", name:"Nombre", phone:"Teléfono", addr:"Dirección/Zip", svc:"Servicio", msg:"Mensaje" }
    : { title:"*New Service Request — FROST-HVACR*", name:"Name", phone:"Phone", addr:"Address/Zip", svc:"Service", msg:"Message" };

  const text =
    `${labels.title}%0A` +
    `%0A👤 *${labels.name}:* ${encodeURIComponent(name)}` +
    `%0A📞 *${labels.phone}:* ${encodeURIComponent(phone)}` +
    (address ? `%0A📍 *${labels.addr}:* ${encodeURIComponent(address)}` : ``) +
    `%0A🛠️ *${labels.svc}:* ${encodeURIComponent(service)}` +
    `%0A%0A📝 *${labels.msg}:*%0A${encodeURIComponent(message)}`;

  const url = `https://wa.me/${WA_NUMBER}?text=${text}`;
  window.open(url, "_blank");
});
