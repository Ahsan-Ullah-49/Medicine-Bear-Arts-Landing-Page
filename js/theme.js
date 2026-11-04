/* Apply the saved theme before styles are painted; no customer data is stored. */
(() => {
  "use strict";
  const storageKey = "medicine-bear-theme";
  let theme = "light";
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "light" || saved === "dark") theme = saved;
  } catch (_) { /* Theme still works for this page when storage is unavailable. */ }
  document.documentElement.dataset.theme = theme;

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;
    const moon = toggle.querySelector(".theme-toggle__icon--moon");
    const sun = toggle.querySelector(".theme-toggle__icon--sun");
    const themeColor = document.querySelector('meta[name="theme-color"]');
    function update() {
      const dark = theme === "dark";
      document.documentElement.dataset.theme = theme;
      const label = dark ? "Switch to light theme" : "Switch to dark theme";
      toggle.setAttribute("aria-label", label);
      toggle.setAttribute("aria-pressed", String(dark));
      toggle.title = label;
      if (moon) moon.toggleAttribute("hidden", dark);
      if (sun) sun.toggleAttribute("hidden", !dark);
      if (themeColor) themeColor.content = dark ? "#000000" : "#f5f2ea";
    }
    toggle.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      try { localStorage.setItem(storageKey, theme); } catch (_) { /* In-memory choice remains active. */ }
      update();
    });
    update();
    toggle.hidden = false;
  });
})();
