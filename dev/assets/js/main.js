(function () {
  "use strict";

  /* ---- Footer year ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- Sticky header background on scroll ---- */
  var header = document.getElementById("header");
  function onScroll() {
    if (window.scrollY > 80) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav ---- */
  var toggle = document.getElementById("navToggle");
  var close = document.getElementById("navClose");
  var links = document.getElementById("navLinks");
  function openMenu() { links.classList.add("open"); toggle.setAttribute("aria-expanded", "true"); }
  function closeMenu() { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  if (toggle) toggle.addEventListener("click", openMenu);
  if (close) close.addEventListener("click", closeMenu);
  links.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });

  /* ---- Reveal on scroll ---- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Stat count-up ---- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var val = Math.round((1 - Math.pow(1 - p, 3)) * target);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var nums = document.querySelectorAll(".num[data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); io2.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io2.observe(n); });
  } else {
    nums.forEach(function (n) { n.textContent = n.getAttribute("data-count") + (n.getAttribute("data-suffix") || ""); });
  }

  /* ---- Lightbox gallery ---- */
  var gallery = document.getElementById("gallery");
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var items = gallery ? Array.prototype.slice.call(gallery.querySelectorAll("button")) : [];
  var idx = 0;
  function show(i) {
    idx = (i + items.length) % items.length;
    var img = items[idx].querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
  }
  function openLb(i) { show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeLb() { lb.classList.remove("open"); document.body.style.overflow = ""; }
  items.forEach(function (btn, i) { btn.addEventListener("click", function () { openLb(i); }); });
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  if (lbClose) lbClose.addEventListener("click", closeLb);
  if (lbPrev) lbPrev.addEventListener("click", function () { show(idx - 1); });
  if (lbNext) lbNext.addEventListener("click", function () { show(idx + 1); });
  if (lb) lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") show(idx - 1);
    else if (e.key === "ArrowRight") show(idx + 1);
  });

  /* ---- Contact form ---- */
  var form = document.getElementById("contactForm");
  if (form) {
    var status = document.getElementById("cf-status");
    var submit = document.getElementById("cf-submit");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "";
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form._gotcha && form._gotcha.value) return; // honeypot tripped
      submit.disabled = true;
      submit.textContent = "Sending…";
      var data = {
        name: form.name.value,
        email: form.email.value,
        company: form.company.value,
        message: form.message.value
      };
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error("Request failed");
        return r.json();
      }).then(function () {
        status.className = "form-status ok";
        status.textContent = "Thank you — your message has been sent. We'll be in touch shortly.";
        form.reset();
      }).catch(function () {
        status.className = "form-status err";
        status.textContent = "Sorry, something went wrong. Please email us directly at info@psggroup.net.";
      }).finally(function () {
        submit.disabled = false;
        submit.textContent = "Send Message";
      });
    });
  }
})();
