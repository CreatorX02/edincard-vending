// EdinCard Vending — progressive front-end behaviour.
// No build step, no framework. Everything degrades gracefully:
// with JS disabled the pages are still fully readable and navigable
// (the FAQ accordions are native <details>, nav is plain links, and
// every form has a mailto route in the copy beside it).

(function () {
  "use strict";

  /* =========================================================
     CONFIG
     ---------------------------------------------------------
     FORM_ENDPOINT: where the contact / venue / notify forms POST.
     Leave it empty and the forms fall back to opening the visitor's
     email client with the message pre-filled — which works today,
     with no backend, and loses nothing.

     To collect submissions properly, paste a form endpoint here
     (Formspree, Basin, Netlify Forms, a Google Apps Script webhook,
     etc.). It must accept a POST of JSON and allow CORS from this
     domain. Nothing else needs to change.
     ========================================================= */
  var FORM_ENDPOINT = "";
  var CONTACT_EMAIL = "info@edincardvending.com";

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

  /* ---------- Email alert form (home + locations) ---------- */
  var notifyForm = document.getElementById("notify-form");
  var notifyNote = document.getElementById("notify-note");

  if (notifyForm && notifyNote) {
    notifyForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var emailField = document.getElementById("notify-email");
      var email = emailField.value.trim();
      var submitBtn = notifyForm.querySelector("button[type=submit]");

      if (!email || !emailField.checkValidity()) {
        notifyNote.textContent = "That doesn't look like a valid email — check it and try again.";
        notifyNote.classList.add("is-error");
        return;
      }

      notifyNote.classList.remove("is-error");
      submitBtn.classList.add("is-loading");

      send({ Email: email, List: "Machine alerts" }, "Machine alert sign-up")
        .then(function (result) {
          submitBtn.classList.remove("is-loading");
          if (result === "mailto") {
            notifyNote.textContent = "Your email app should open — send that message and you're on the list.";
          } else {
            notifyNote.textContent = "You're on the list — we'll email you when a machine lands nearby.";
          }
          notifyForm.reset();
        })
        .catch(function () {
          submitBtn.classList.remove("is-loading");
          notifyNote.textContent = "Something went wrong. Email " + CONTACT_EMAIL + " and we'll add you by hand.";
          notifyNote.classList.add("is-error");
        });
    });
  }

  /* ---------- Contact + venue enquiry forms ---------- */
  // Both forms share this handler. Each field's `name` becomes a labelled
  // line in the message, so adding a field to the HTML needs no JS change.
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var status = form.querySelector("[data-form-status]");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Honeypot: a bot fills every field it finds, a person can't see this one.
      var honeypot = form.querySelector('input[name="_hp"]');
      if (honeypot && honeypot.value) return;

      if (!validate(form, status)) return;

      var submitBtn = form.querySelector("button[type=submit]");
      submitBtn.classList.add("is-loading");
      setStatus(status, "", false);

      var subjectField = form.querySelector("[data-subject-field]");
      var subject = form.getAttribute("data-subject") || "Website enquiry";
      if (subjectField && subjectField.value) {
        subject = subject + " — " + subjectField.value;
      }

      send(collect(form), subject)
        .then(function (result) {
          submitBtn.classList.remove("is-loading");
          if (result === "mailto") {
            setStatus(status, "Your email app should open with the message ready — hit send.", false);
          } else {
            setStatus(status, "Sent. We'll get back to you within two working days.", false);
            form.reset();
          }
        })
        .catch(function () {
          submitBtn.classList.remove("is-loading");
          setStatus(status, "Couldn't send that. Please email " + CONTACT_EMAIL + " directly.", true);
        });
    });

    // Clear a field's error as soon as the visitor fixes it.
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") {
          field.removeAttribute("aria-invalid");
          var msg = form.querySelector('[data-error-for="' + field.id + '"]');
          if (msg) msg.textContent = "";
        }
      });
    });
  });

  function collect(form) {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      if (key === "_hp") return;
      value = String(value).trim();
      if (value) data[key] = value;
    });
    return data;
  }

  function validate(form, status) {
    var firstInvalid = null;

    form.querySelectorAll("[required]").forEach(function (field) {
      var msg = form.querySelector('[data-error-for="' + field.id + '"]');
      var ok = field.value.trim() !== "" && field.checkValidity();

      if (ok) {
        field.removeAttribute("aria-invalid");
        if (msg) msg.textContent = "";
      } else {
        field.setAttribute("aria-invalid", "true");
        if (msg) {
          msg.textContent =
            field.value.trim() === ""
              ? "This one's needed."
              : field.type === "email"
              ? "That doesn't look like a valid email."
              : "Have another look at this.";
        }
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (firstInvalid) {
      setStatus(status, "A few fields need fixing.", true);
      firstInvalid.focus();
      return false;
    }
    return true;
  }

  function setStatus(el, text, isError) {
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("is-error", Boolean(isError));
  }

  // Posts to FORM_ENDPOINT when one is configured; otherwise composes a
  // mailto: so the enquiry still reaches us. Resolves with "posted" or
  // "mailto" so callers can word the confirmation accordingly.
  function send(data, subject) {
    if (!FORM_ENDPOINT) {
      var body = Object.keys(data)
        .map(function (key) {
          return key + ": " + data[key];
        })
        .join("\n\n");
      window.location.href =
        "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      return Promise.resolve("mailto");
    }

    return fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.assign({ _subject: subject }, data)),
    }).then(function (response) {
      if (!response.ok) throw new Error("Bad response: " + response.status);
      return "posted";
    });
  }

  /* ---------- Contact form: reveal machine-detail field ---------- */
  // Only asked for when it's actually relevant, so the form stays short.
  var topicField = document.getElementById("c-topic");
  var topicExtra = document.querySelector("[data-topic-extra]");

  if (topicField && topicExtra) {
    topicField.addEventListener("change", function () {
      topicExtra.hidden = topicField.value !== "Machine issue or refund";
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
        label.textContent = "SELECT · " + code;
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
    function closeMenu() {
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
      mobileNav.hidden = true;
    }

    menuToggle.addEventListener("click", function () {
      var isOpen = menuToggle.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      mobileNav.hidden = !isOpen;
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Escape closes it, and focus goes back to the button that opened it.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !mobileNav.hidden) {
        closeMenu();
        menuToggle.focus();
      }
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
