// EdinCard Vending — minimal front-end behaviour, no build step required.

(function () {
  "use strict";

  // Notify-me form: no backend wired up yet, so this simply confirms
  // the input in place. Swap the TODO below for a real endpoint
  // (Mailchimp, a Google Sheet via Apps Script, Formspree, etc.)
  // when ready to collect real signups.
  var form = document.getElementById("notify-form");
  var note = document.getElementById("notify-note");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var emailField = document.getElementById("notify-email");
      var email = emailField.value.trim();

      if (!email) {
        return;
      }

      // TODO: replace with a real signup endpoint.
      console.log("Notify signup captured:", email);

      note.textContent = "You're on the list — we'll email you when a machine lands nearby.";
      form.reset();
    });
  }

  // Let each vending slot briefly become the "featured" one on hover,
  // echoing the machine-base label so the whole hero feels responsive.
  var slots = document.querySelectorAll(".slot");
  var label = document.querySelector(".machine-label");

  if (slots.length && label) {
    slots.forEach(function (slot) {
      slot.addEventListener("mouseenter", function () {
        var code = slot.querySelector(".slot-code");
        if (code) {
          label.textContent = "SELECT · " + code.textContent;
        }
      });
    });
  }
})();
