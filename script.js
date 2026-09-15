// Unfractional — shared site behavior (nav toggle, pixel-field visual, contact form, footer year)
(function () {
  "use strict";

  /* ---------- mobile nav toggle ---------- */
  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-nav]");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        panel.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- footer year ---------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- pixel field: scattered squares resolving into a grid ---------- */
  // Visual echo of the mark: fragments becoming one aligned system.
  function initPixelField() {
    var canvas = document.querySelector("[data-pixel-field]");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var cols = 9, rows = 9;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cells = [];
    var t0 = null;
    var DURATION = 2200;

    function seed() {
      cells = [];
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var keep = Math.random() > 0.32; // some cells stay empty -> "gaps" in the system
          if (!keep) continue;
          cells.push({
            col: c, row: r,
            fromX: (Math.random() - 0.5) * 1.6,
            fromY: (Math.random() - 0.5) * 1.6,
            fromA: 0.15 + Math.random() * 0.2,
            toA: 0.18 + Math.random() * 0.55,
            delay: Math.random() * 500,
            phase: Math.random() * Math.PI * 2,
            core: (c + r) % 5 === 0 // occasional accent squares
          });
        }
      }
    }

    function size() {
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

    function draw(now) {
      if (t0 === null) t0 = now;
      var elapsed = now - t0;
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      var pad = w * 0.08;
      var gridW = w - pad * 2, gridH = h - pad * 2;
      var cellW = gridW / cols, cellH = gridH / rows;
      var sq = Math.min(cellW, cellH) * 0.56;

      var styles = getComputedStyle(document.documentElement);
      var blue = styles.getPropertyValue("--blue-600").trim() || "#2b5cff";
      var line = styles.getPropertyValue("--line-strong").trim() || "#c3c9e0";

      cells.forEach(function (cell) {
        var cellElapsed = reduceMotion ? DURATION : Math.max(0, elapsed - cell.delay);
        var p = reduceMotion ? 1 : Math.min(1, cellElapsed / DURATION);
        var eased = easeOutCubic(p);

        var settleX = pad + cell.col * cellW + cellW / 2;
        var settleY = pad + cell.row * cellH + cellH / 2;

        var drift = reduceMotion ? 0 : Math.sin(now / 1600 + cell.phase) * cellW * 0.045 * (p >= 1 ? 1 : 0);
        var x = settleX + (1 - eased) * cell.fromX * gridW * 0.5;
        var y = settleY + (1 - eased) * cell.fromY * gridH * 0.5 + drift;
        var alpha = cell.fromA + (cell.toA - cell.fromA) * eased;

        ctx.fillStyle = cell.core ? blue : line;
        ctx.globalAlpha = cell.core ? Math.min(1, alpha + 0.15) : alpha;
        var s = sq * (0.7 + 0.3 * eased);
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      });
      ctx.globalAlpha = 1;

      if (!reduceMotion) requestAnimationFrame(draw);
    }

    seed();
    size();
    window.addEventListener("resize", function () {
      size();
    });

    if (reduceMotion) {
      draw(0);
    } else {
      requestAnimationFrame(draw);
    }
  }

  /* ---------- contact form: builds a prefilled mailto (no backend yet) ---------- */
  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    var status = document.querySelector("[data-form-status]");
    var toAddress = form.getAttribute("data-to") || "hello@unfractional.com";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var company = (data.get("company") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var topic = (data.get("topic") || "").toString().trim();
      var message = (data.get("message") || "").toString().trim();

      if (!name || !email || !message) {
        if (status) {
          status.textContent = "Please add your name, email, and a short note before sending.";
          status.classList.add("show");
        }
        return;
      }

      var subject = "Introduction: " + name + (company ? " (" + company + ")" : "");
      var bodyLines = [
        "Name: " + name,
        company ? "Company: " + company : null,
        email ? "Email: " + email : null,
        topic ? "Area of interest: " + topic : null,
        "",
        message
      ].filter(Boolean);

      var mailto = "mailto:" + encodeURIComponent(toAddress) +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));

      window.location.href = mailto;

      if (status) {
        status.textContent = "Opening your email client with this note pre-filled — send it whenever you're ready.";
        status.classList.add("show");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initYear();
    initPixelField();
    initContactForm();
  });
})();
