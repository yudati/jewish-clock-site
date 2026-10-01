/* שעון יהודי — סקריפט משותף: סרגל נגישות + תצוגת תמונה מוגדלת. עברית/אנגלית לפי <html lang>. */
(function () {
  var he = (document.documentElement.lang || "he").indexOf("he") === 0;
  var T = he ? {
    open: "תפריט נגישות", title: "נגישות", close: "סגירה", size: "גודל טקסט",
    smaller: "הקטנת טקסט", bigger: "הגדלת טקסט", contrast: "ניגודיות גבוהה", gray: "גווני אפור",
    links: "הדגשת קישורים", font: "גופן קריא", still: "עצירת אנימציות", cursor: "סמן גדול",
    reset: "איפוס", statement: "הצהרת נגישות", statementUrl: "accessibility.html"
  } : {
    open: "Accessibility menu", title: "Accessibility", close: "Close", size: "Text size",
    smaller: "Decrease text", bigger: "Increase text", contrast: "High contrast", gray: "Grayscale",
    links: "Highlight links", font: "Readable font", still: "Stop animations", cursor: "Large cursor",
    reset: "Reset", statement: "Accessibility statement", statementUrl: "accessibility.html"
  };
  var KEY = "jc_a11y_v1";
  var OPTS = [
    ["contrast", "◐"], ["gray", "▦"], ["links", "🔗"], ["font", "Aa"], ["still", "⏸"], ["cursor", "➤"]
  ];
  var SIZES = [100, 115, 130, 150, 175];
  var state = { size: 0 };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || "{}"); if (saved && typeof saved === "object") state = Object.assign(state, saved); } catch (e) {}

  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function apply() {
    var root = document.documentElement;
    root.style.fontSize = SIZES[state.size || 0] + "%";
    OPTS.forEach(function (o) { root.classList.toggle("a11y-" + o[0], !!state[o[0]]); });
    var p = document.getElementById("a11y-panel");
    if (p) {
      OPTS.forEach(function (o) { var b = p.querySelector('[data-k="' + o[0] + '"]'); if (b) b.setAttribute("aria-pressed", state[o[0]] ? "true" : "false"); });
      var lbl = p.querySelector(".size span"); if (lbl) lbl.textContent = T.size + ": " + SIZES[state.size || 0] + "%";
    }
  }
  apply();

  function build() {
    var fab = document.createElement("button");
    fab.className = "a11y-fab"; fab.type = "button";
    fab.setAttribute("aria-label", T.open); fab.setAttribute("aria-expanded", "false"); fab.setAttribute("aria-controls", "a11y-panel");
    fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4" r="2" fill="currentColor"/><path fill="currentColor" d="M21 9h-6v12h-2v-6h-2v6H9V9H3V7h18z"/></svg>';

    var p = document.createElement("div");
    p.id = "a11y-panel"; p.className = "a11y-panel"; p.hidden = true;
    p.setAttribute("role", "dialog"); p.setAttribute("aria-label", T.title);
    var html = '<h2>' + T.title + '<button class="x" type="button" aria-label="' + T.close + '">✕</button></h2>' +
      '<div class="size"><span></span>' +
      '<button type="button" data-s="-1" aria-label="' + T.smaller + '">A−</button>' +
      '<button type="button" data-s="1" aria-label="' + T.bigger + '">A+</button></div><div class="grid2">';
    OPTS.forEach(function (o) {
      html += '<button class="opt" type="button" data-k="' + o[0] + '" aria-pressed="false"><span class="i" aria-hidden="true">' + o[1] + '</span>' + T[o[0]] + '</button>';
    });
    html += '</div><div class="foot"><button type="button" class="reset">' + T.reset + '</button>' +
      '<a href="' + T.statementUrl + '">' + T.statement + '</a></div>';
    p.innerHTML = html;
    document.body.appendChild(p); document.body.appendChild(fab);

    function toggle(show) {
      p.hidden = !show; fab.setAttribute("aria-expanded", show ? "true" : "false");
      if (show) { var f = p.querySelector("button.opt, .size button"); if (f) f.focus(); } else fab.focus();
    }
    fab.addEventListener("click", function () { toggle(p.hidden); });
    p.querySelector(".x").addEventListener("click", function () { toggle(false); });
    p.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });
    p.querySelectorAll(".size button").forEach(function (b) {
      b.addEventListener("click", function () {
        state.size = Math.max(0, Math.min(SIZES.length - 1, (state.size || 0) + parseInt(b.getAttribute("data-s"), 10)));
        save(); apply();
      });
    });
    p.querySelectorAll("button.opt").forEach(function (b) {
      b.addEventListener("click", function () { var k = b.getAttribute("data-k"); state[k] = !state[k]; save(); apply(); });
    });
    p.querySelector(".reset").addEventListener("click", function () { state = { size: 0 }; save(); apply(); });
    apply();
  }

  /* תצוגה מוגדלת לצילומי מסך (רק בדפים שיש בהם img.zoom) */
  function lightbox() {
    var imgs = Array.prototype.slice.call(document.querySelectorAll("img.zoom"));
    if (!imgs.length) return;
    var dlg = document.createElement("dialog");
    dlg.className = "lightbox"; dlg.setAttribute("aria-label", he ? "תצוגה מוגדלת" : "Enlarged view");
    dlg.innerHTML = '<button class="lb-close" type="button" aria-label="' + T.close + '">✕</button>' +
      '<button class="lb-nav lb-prev" type="button" aria-label="' + (he ? "התמונה הקודמת" : "Previous image") + '">' + (he ? "›" : "‹") + '</button>' +
      '<img alt="">' +
      '<button class="lb-nav lb-next" type="button" aria-label="' + (he ? "התמונה הבאה" : "Next image") + '">' + (he ? "‹" : "›") + '</button>';
    document.body.appendChild(dlg);
    var big = dlg.querySelector("img"), cur = 0;
    function show(i) { cur = (i + imgs.length) % imgs.length; big.src = imgs[cur].currentSrc || imgs[cur].src; big.alt = imgs[cur].alt; }
    function open(i) { show(i); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); }
    imgs.forEach(function (im, i) {
      im.tabIndex = 0; im.setAttribute("role", "button");
      im.addEventListener("click", function () { open(i); });
      im.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } });
    });
    dlg.querySelector(".lb-close").onclick = function () { dlg.close(); };
    dlg.querySelector(".lb-prev").onclick = function () { show(cur - 1); };
    dlg.querySelector(".lb-next").onclick = function () { show(cur + 1); };
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    document.addEventListener("keydown", function (e) {
      if (!dlg.open) return;
      var fwd = he ? "ArrowLeft" : "ArrowRight", back = he ? "ArrowRight" : "ArrowLeft";
      if (e.key === fwd) show(cur + 1);
      if (e.key === back) show(cur - 1);
    });
    var x0 = null;
    big.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    big.addEventListener("touchend", function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) show((dx < 0) === he ? cur - 1 : cur + 1);
    });
  }

  function init() { build(); lightbox(); var y = document.getElementById("y"); if (y) y.textContent = new Date().getFullYear(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
