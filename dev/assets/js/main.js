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
  var scrollDriven = !reduce && window.CSS && CSS.supports && CSS.supports("animation-timeline: view()");
  var revealEls = document.querySelectorAll(".reveal");
  if (reduce) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else if (scrollDriven) {
    /* CSS scroll-linked animation drives the reveal — nothing to do here */
  } else if (!("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    // Reversible fade in/out for browsers without scroll-linked animations
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle("in", e.isIntersecting); });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Momentum smooth scrolling (Lenis) ---- */
  if (!reduce && window.Lenis) {
    var lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id === "#" || id === "#top") { e.preventDefault(); lenis.scrollTo(0); }
        else if (id.length > 1) {
          var target = document.querySelector(id);
          if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -80 }); closeMenu(); }
        }
      });
    });
  }

  /* ---- Hero headline typewriter ---- */
  var heroH1 = document.querySelector(".hero h1");
  if (heroH1 && !reduce) {
    var full = heroH1.textContent;
    heroH1.style.minHeight = heroH1.offsetHeight + "px";   // reserve space, no reflow
    heroH1.textContent = "";
    var caret = document.createElement("span");
    caret.className = "type-caret";
    caret.setAttribute("aria-hidden", "true");
    caret.textContent = "|";
    heroH1.appendChild(caret);
    var ci = 0;
    (function typeNext() {
      if (ci < full.length) {
        var ch = full.charAt(ci++);
        caret.insertAdjacentText("beforebegin", ch);
        setTimeout(typeNext, ch === " " ? 78 : 60);
      } else {
        setTimeout(function () { caret.remove(); }, 1500);
      }
    })();
  }

  /* ---- Map: data-flow packets travelling Asia -> U.S. ---- */
  var flowPaths = document.querySelectorAll(".global-flow path");
  if (!reduce && flowPaths.length && flowPaths[0].getTotalLength) {
    flowPaths.forEach(function (p, idx) {
      var L = p.getTotalLength();
      p.style.strokeDasharray = "6 " + L;
      if (p.animate) {
        p.animate(
          [{ strokeDashoffset: 0 }, { strokeDashoffset: -(L + 6) }],
          { duration: 3400 + idx * 130, iterations: Infinity, delay: idx * 360, easing: "linear" }
        );
      }
    });
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
      fetch(form.action, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      }).then(function (r) {
        return r.json().then(function (data) { return { ok: r.ok, data: data }; });
      }).then(function (res) {
        if (res.ok) {
          status.className = "form-status ok";
          status.textContent = "Thank you — your message has been sent. We'll be in touch shortly.";
          form.reset();
        } else {
          var msg = res.data && res.data.errors && res.data.errors.length
            ? res.data.errors.map(function (x) { return x.message; }).join(" ")
            : "Something went wrong. Please email us directly at info@psggroup.net.";
          status.className = "form-status err";
          status.textContent = msg;
        }
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
