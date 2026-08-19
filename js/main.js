// EdinCard Vending — progressive front-end behaviour.
// No build step, no framework. Everything degrades gracefully:
// with JS disabled, the page is still fully readable and usable
// (the FAQ accordion is native <details>, forms work by default).

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header scroll state + progress bar ---------- */
  var header = document.getElementById("site-header");
  var progressBar = document.getElementById("scroll-progress");

  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = pct + "%";
    }
    if (header) {
      header.classList.toggle("is-scrolled", scrollTop > 8);
    }
    toggleBackToTop(scrollTop);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------- Count-up stats ---------- */
  var statEls = document.querySelectorAll("[data-count-to]");

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count-to"), 10);
    var suffix = el.getAttribute("data-suffix") || "";

    if (reduceMotion || target === 0) {
      el.textContent = target + suffix;
      return;
    }

    var duration = 900;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }
    window.requestAnimationFrame(step);
  }

  if (statEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      statEls.forEach(function (el) {
        var target = parseInt(el.getAttribute("data-count-to"), 10);
        el.textContent = target + (el.getAttribute("data-suffix") || "");
      });
    } else {
      var statObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              statObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      statEls.forEach(function (el) {
        statObserver.observe(el);
      });
    }
  }

  /* ---------- Notify-me form ---------- */
  // No backend wired up yet: this confirms the input in place.
  // Swap the TODO below for a real endpoint (Formspree, a Google
  // Sheet via Apps Script, Mailchimp, etc.) when ready to collect
  // real signups.
  var form = document.getElementById("notify-form");
  var note = document.getElementById("notify-note");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var emailField = document.getElementById("notify-email");
      var email = emailField.value.trim();
      var submitBtn = form.querySelector("button[type=submit]");

      if (!email || !emailField.checkValidity()) {
        note.textContent = "That doesn't look like a valid email — check it and try again.";
        note.classList.add("is-error");
        return;
      }

      note.classList.remove("is-error");
      submitBtn.classList.add("is-loading");

      // TODO: replace with a real signup endpoint.
      window.setTimeout(function () {
        console.log("Notify signup captured:", email);
        submitBtn.classList.remove("is-loading");
        note.textContent = "You're on the list — we'll email you when a machine lands nearby.";
        form.reset();
      }, 500);
    });
  }

  /* ---------- Hero vending slots ---------- */
  var slots = document.querySelectorAll(".slot");
  var label = document.getElementById("machine-label");

  if (slots.length && label) {
    slots.forEach(function (slot) {
      slot.setAttribute("tabindex", "0");
      slot.setAttribute("role", "button");
      var code = slot.getAttribute("data-code") || "";
      slot.setAttribute("aria-label", "Slot " + code);

      function selectSlot() {
        label.textContent = "SELECT \u00B7 " + code;
      }
      slot.addEventListener("mouseenter", selectSlot);
      slot.addEventListener("focus", selectSlot);
    });
  }

  /* ---------- Drop card tilt (subtle, mouse-only) ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(600px) rotateX(" + (y * -6) + "deg) rotateY(" + (x * 6) + "deg) translateY(-2px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById("menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      var isOpen = menuToggle.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      mobileNav.hidden = !isOpen;
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menuToggle.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
        mobileNav.hidden = true;
      });
    });
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.getElementById("back-to-top");

  function toggleBackToTop(scrollTop) {
    if (!backToTop) return;
    backToTop.style.display = scrollTop > 600 ? "flex" : "none";
  }

  if (backToTop) {
    backToTop.style.display = "none";
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();
