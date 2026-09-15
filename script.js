// Unfractional — shared site behavior (nav toggle, terminal scan reveal, contact form, footer year)
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

  /* ---------- terminal scan: reveal diagnostic lines one at a time ---------- */
  function initTerminal() {
    var lines = document.querySelectorAll("[data-scan-line]");
    if (!lines.length) return;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      lines.forEach(function (l) { l.style.opacity = "1"; });
      return;
    }

    lines.forEach(function (l) { l.style.opacity = "0"; l.style.transition = "opacity 0.25s ease"; });

    var i = 0;
    function reveal() {
      if (i >= lines.length) return;
      lines[i].style.opacity = "1";
      i++;
      setTimeout(reveal, 320);
    }
    setTimeout(reveal, 300);
  }

  /* ---------- contact form: builds a prefilled mailto (no backend yet) ---------- */
  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    var status = document.querySelector("[data-form-status]");
    var toAddress = form.getAttribute("data-to") || "info@unfractional.com";

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
    initTerminal();
    initContactForm();
  });
})();
