/* ==============================================================
   Best Dental Clinic — shared site script
   One file for all 14 pages. Every block guards on the elements
   it needs, so pages that don't have a slider/FAQ/form just skip
   that section instead of throwing.
   ============================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     Clinic constants — used to build WhatsApp deep links.
     Keep in sync with the numbers printed in the markup.
     ------------------------------------------------------------ */
  var WHATSAPP_NUMBER = "919030271023";

  /* ------------------------------------------------------------
     1. MOBILE MENU
     ------------------------------------------------------------ */
  var menuButton = document.getElementById("mobile-menu-button");
  var mobileMenu = document.getElementById("mobile-menu");

  function closeMobileMenu() {
    if (!mobileMenu || mobileMenu.classList.contains("hidden")) return;
    mobileMenu.classList.add("hidden");
    if (menuButton) menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("overflow-hidden");
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      var isHidden = mobileMenu.classList.toggle("hidden");
      menuButton.setAttribute("aria-expanded", String(!isHidden));

      var icon = menuButton.querySelector("i");
      if (icon) {
        icon.className = isHidden ? "fas fa-bars text-xl" : "fas fa-xmark text-xl";
      }
    });

    // Tapping any link inside the panel navigates, so drop the panel first
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMobileMenu();
    });
  }

  /* ------------------------------------------------------------
     2. MOBILE "SERVICES" SUB-MENU
     The desktop dropdown is pure CSS hover; on touch we need a
     real toggle instead.
     ------------------------------------------------------------ */
  var subToggle = document.getElementById("mobile-services-toggle");
  var subMenu = document.getElementById("mobile-services-menu");

  if (subToggle && subMenu) {
    subToggle.addEventListener("click", function () {
      var isHidden = subMenu.classList.toggle("hidden");
      subToggle.setAttribute("aria-expanded", String(!isHidden));

      var chevron = subToggle.querySelector(".sub-chevron");
      if (chevron) {
        chevron.style.transform = isHidden ? "rotate(0deg)" : "rotate(180deg)";
      }
    });
  }

  /* ------------------------------------------------------------
     3. STICKY NAVBAR SHADOW
     ------------------------------------------------------------ */
  var siteNav = document.querySelector(".site-nav");

  if (siteNav) {
    var applyNavShadow = function () {
      siteNav.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    applyNavShadow();
    window.addEventListener("scroll", applyNavShadow, { passive: true });
  }

  /* ------------------------------------------------------------
     4. SCROLL REVEAL
     Falls back to "everything visible" where IntersectionObserver
     is missing, so content is never trapped at opacity 0.
     ------------------------------------------------------------ */
  var revealItems = document.querySelectorAll(".reveal");

  if (revealItems.length) {
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
      );

      revealItems.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      revealItems.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  /* ------------------------------------------------------------
     5. FAQ ACCORDION
     Single-open behaviour: opening one closes its siblings.
     ------------------------------------------------------------ */
  var faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(function (item) {
    var trigger = item.querySelector(".faq-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");

      faqItems.forEach(function (other) {
        other.classList.remove("is-open");
        var otherTrigger = other.querySelector(".faq-trigger");
        if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
      });

      if (willOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ------------------------------------------------------------
     6. TESTIMONIALS SLIDER
     Cards-per-view changes at the same breakpoints as the CSS,
     so the track always lands on a card boundary.
     ------------------------------------------------------------ */
  var track = document.getElementById("testimonialTrack");
  var prevBtn = document.getElementById("prevTestimonial");
  var nextBtn = document.getElementById("nextTestimonial");
  var dotsWrap = document.getElementById("testimonialDots");

  if (track && track.children.length) {
    var totalCards = track.children.length;
    var index = 0;
    var autoplayTimer = null;

    var perView = function () {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    };

    var maxIndex = function () {
      return Math.max(0, totalCards - perView());
    };

    var renderDots = function () {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";

      for (var i = 0; i <= maxIndex(); i++) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "slider-dot" + (i === index ? " is-active" : "");
        dot.setAttribute("aria-label", "Go to review " + (i + 1));
        dot.dataset.index = String(i);
        dotsWrap.appendChild(dot);
      }
    };

    var update = function () {
      var first = track.children[0];
      if (!first) return;

      var gap = parseFloat(getComputedStyle(track).columnGap || "24") || 24;
      var step = first.getBoundingClientRect().width + gap;

      track.style.transform = "translateX(" + -(index * step) + "px)";
      renderDots();
    };

    var goTo = function (next) {
      var limit = maxIndex();
      index = next < 0 ? limit : next > limit ? 0 : next;
      update();
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goTo(index - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goTo(index + 1);
      });
    }

    if (dotsWrap) {
      dotsWrap.addEventListener("click", function (e) {
        var dot = e.target.closest(".slider-dot");
        if (dot) goTo(Number(dot.dataset.index));
      });
    }

    // Autoplay, paused while the pointer is over the slider
    var startAutoplay = function () {
      stopAutoplay();
      autoplayTimer = window.setInterval(function () {
        goTo(index + 1);
      }, 5500);
    };

    var stopAutoplay = function () {
      if (autoplayTimer) window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    };

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!reduceMotion.matches) {
      startAutoplay();
      track.parentElement.addEventListener("mouseenter", stopAutoplay);
      track.parentElement.addEventListener("mouseleave", startAutoplay);
    }

    // Touch swipe
    var touchStartX = 0;

    track.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
      },
      { passive: true }
    );

    track.addEventListener(
      "touchend",
      function (e) {
        var delta = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(delta) > 50) goTo(delta < 0 ? index + 1 : index - 1);
        if (!reduceMotion.matches) startAutoplay();
      },
      { passive: true }
    );

    var resizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        if (index > maxIndex()) index = maxIndex();
        update();
      }, 150);
    });

    update();
  }

  /* ------------------------------------------------------------
     7. STAT COUNTERS
     Counts up once, the first time the block scrolls into view.
     ------------------------------------------------------------ */
  var counters = document.querySelectorAll("[data-count-to]");

  if (counters.length && "IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var el = entry.target;
          var target = parseFloat(el.dataset.countTo);
          var decimals = (el.dataset.countTo.split(".")[1] || "").length;
          var duration = 1400;
          var startedAt = null;

          var tick = function (now) {
            if (startedAt === null) startedAt = now;
            var progress = Math.min((now - startedAt) / duration, 1);
            // easeOutCubic
            var eased = 1 - Math.pow(1 - progress, 3);

            el.textContent = (target * eased).toFixed(decimals);
            if (progress < 1) window.requestAnimationFrame(tick);
          };

          window.requestAnimationFrame(tick);
          countObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) {
      countObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------
     8. APPOINTMENT FORM → WHATSAPP
     No backend on this site, so the form composes a pre-filled
     WhatsApp message. The "Book on WhatsApp" button and a normal
     submit both route here.
     ------------------------------------------------------------ */
  var appointmentForm = document.getElementById("appointmentForm");

  if (appointmentForm) {
    var buildMessage = function () {
      var value = function (name) {
        var field = appointmentForm.elements[name];
        return field && field.value ? field.value.trim() : "";
      };

      var lines = [
        "*New Appointment Request — Best Dental Clinic*",
        "",
        "Name: " + (value("name") || "-"),
        "Phone: " + (value("phone") || "-"),
        "Service: " + (value("service") || "-"),
        "Preferred date: " + (value("date") || "-"),
        "Preferred time: " + (value("time") || "-"),
      ];

      if (value("message")) lines.push("Message: " + value("message"));

      return lines.join("\n");
    };

    var sendToWhatsApp = function () {
      var url =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(buildMessage());

      window.open(url, "_blank", "noopener");
    };

    appointmentForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // The form carries novalidate so the browser does not block
      // submission, which means the required/pattern rules only apply
      // if we ask for them. Without this an empty form still opened
      // WhatsApp with every field filled in as "-".
      if (!appointmentForm.reportValidity()) return;

      sendToWhatsApp();
      showFormNotice(
        appointmentForm,
        "Opening WhatsApp with your request. Prefer to talk? Call +91 90302 71023."
      );
    });

    var whatsappBtn = document.getElementById("whatsappBookBtn");

    if (whatsappBtn) {
      whatsappBtn.addEventListener("click", function () {
        if (!appointmentForm.reportValidity()) return;
        sendToWhatsApp();
      });
    }

    // Can't book a date in the past
    var dateInput = appointmentForm.elements["date"];

    if (dateInput && dateInput.type === "date") {
      var today = new Date();
      var iso =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

      dateInput.min = iso;
    }
  }

  /* ------------------------------------------------------------
     9. CONTACT / ENQUIRY FORM
     ------------------------------------------------------------ */
  var contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      showFormNotice(
        contactForm,
        "Thanks — your message is ready to send. We reply within one working day, or call +91 90302 71023 for anything urgent."
      );

      contactForm.reset();
    });
  }

  /* Renders an inline confirmation under a form (no alert popups) */
  function showFormNotice(form, text) {
    var notice = form.querySelector(".form-notice");

    if (!notice) {
      notice = document.createElement("p");
      notice.className =
        "form-notice mt-4 rounded-xl bg-surface px-4 py-3 text-sm font-medium text-brand";
      notice.setAttribute("role", "status");
      form.appendChild(notice);
    }

    notice.textContent = text;
  }

  /* ------------------------------------------------------------
     10. BACK TO TOP
     ------------------------------------------------------------ */
  var backToTop = document.getElementById("backToTop");

  if (backToTop) {
    var toggleBackToTop = function () {
      var show = window.scrollY > 600;
      backToTop.classList.toggle("opacity-0", !show);
      backToTop.classList.toggle("pointer-events-none", !show);
    };

    toggleBackToTop();
    window.addEventListener("scroll", toggleBackToTop, { passive: true });

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------------------------------------------------
     11. IN-PAGE ANCHOR SCROLLING
     Only intercepts anchors that resolve to a node on this page —
     cross-page links such as ../index.html#services fall through
     to the browser.
     ------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = anchor.getAttribute("href");
      if (href === "#" || href === "#!") return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMobileMenu();

      if (history.replaceState) history.replaceState(null, "", href);
    });
  });

  /* ------------------------------------------------------------
     12. CURRENT YEAR IN FOOTER
     ------------------------------------------------------------ */
  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ------------------------------------------------------------
     13. BOOKING MODAL
     Injected here rather than into every page's markup, so all
     pages share one copy. Opens 3s after load on every visit and
     refresh, and can be reopened by any [data-open-booking]
     element. Skipped on the booking page itself, where the same
     form is already the main content.
     ------------------------------------------------------------ */
  (function () {
    /* Match the booking page by URL — the home page also carries an
       #appointmentForm, so the element alone is not a reliable test. */
    var onBookingPage = /\/book-appointment(\/|\/index\.html)?$/.test(
      window.location.pathname
    );

    var SERVICES = [
      "Regular Check-up",
      "Teeth Cleaning & Whitening",
      "Invisible Aligners & Braces",
      "Dental Implants",
      "Crowns & Bridges",
      "Pediatric Dentistry",
      "Emergency Dental Care",
      "Cosmetic Dentistry",
      "Root Canal Treatment",
      "Other",
    ];

    var SLOTS = [
      "10:00 AM – 11:00 AM",
      "11:00 AM – 12:00 PM",
      "12:00 PM – 2:00 PM",
      "4:00 PM – 5:00 PM",
      "5:00 PM – 6:00 PM",
      "6:00 PM – 8:00 PM",
    ];

    var options = function (list, placeholder) {
      return (
        '<option value="">' +
        placeholder +
        "</option>" +
        list
          .map(function (o) {
            return "<option>" + o + "</option>";
          })
          .join("")
      );
    };

    var LABEL =
      "flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400";
    var FIELD =
      "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-ink outline-none transition-all placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20";
    var SELECT = FIELD + " appearance-none cursor-pointer";

    var overlay = document.createElement("div");
    overlay.id = "bookingModal";
    overlay.className =
      "fixed inset-0 z-[120] items-center justify-center bg-ink/50 p-4 backdrop-blur-sm";
    /* Display is driven inline rather than by .hidden/.flex, so the
       modal still opens if output.css is stale or cached. */
    overlay.style.display = "none";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "bookingModalTitle");

    overlay.innerHTML =
      '<div class="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl sm:grid-cols-[0.8fr_1.2fr]" data-modal-card>' +
      /* ---- Left panel ---- */
      '<div class="relative hidden flex-col justify-between p-8 text-white sm:flex lg:p-10" style="background-image: linear-gradient(160deg, #1A4996 0%, #14387a 100%);">' +
      '<div>' +
      '<span class="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">' +
      '<i class="fas fa-calendar-check" aria-hidden="true"></i></span>' +
      '<h2 id="bookingModalTitle" class="font-display text-3xl font-bold leading-tight lg:text-4xl">Book Your<br><span class="italic">Visit</span></h2>' +
      '<p class="mt-5 text-base leading-relaxed text-white/85">Join <span class="font-bold text-white">10k+</span> happy patients who trust our care.</p>' +
      "</div>" +
      '<ul class="mt-10 space-y-4 text-sm font-bold">' +
      '<li class="flex items-center gap-3"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/15"><i class="fas fa-circle-check" aria-hidden="true"></i></span> Modern Clinic</li>' +
      '<li class="flex items-center gap-3"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/15"><i class="fas fa-circle-check" aria-hidden="true"></i></span> Expert Doctors</li>' +
      "</ul>" +
      "</div>" +
      /* ---- Right panel ---- */
      '<div class="relative p-6 sm:p-8 lg:p-10">' +
      '<button type="button" data-close-booking aria-label="Close booking form" ' +
      'class="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-ink shadow-md transition hover:bg-slate-100">' +
      '<i class="fas fa-xmark" aria-hidden="true"></i></button>' +
      '<span class="text-xs font-bold uppercase tracking-[0.2em] text-brand">Reservation</span>' +
      '<h3 class="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">Request a Visit</h3>' +
      '<form id="bookingModalForm" class="mt-6 space-y-5" novalidate>' +
      '<div class="grid gap-5 sm:grid-cols-2">' +
      '<div class="space-y-2">' +
      '<label for="bmName" class="' + LABEL + '"><i class="fas fa-user text-[11px] text-brand" aria-hidden="true"></i> Full Name</label>' +
      '<input id="bmName" name="name" type="text" required placeholder="Your Name" class="' + FIELD + '">' +
      "</div>" +
      '<div class="space-y-2">' +
      '<label for="bmPhone" class="' + LABEL + '"><i class="fas fa-mobile-screen text-[11px] text-brand" aria-hidden="true"></i> Phone</label>' +
      '<input id="bmPhone" name="phone" type="tel" required pattern="[0-9+\\s-]{10,15}" placeholder="10-digit Number" class="' + FIELD + '">' +
      "</div>" +
      '<div class="space-y-2">' +
      '<label for="bmDate" class="' + LABEL + '"><i class="fas fa-calendar text-[11px] text-brand" aria-hidden="true"></i> Date</label>' +
      '<input id="bmDate" name="date" type="date" required class="' + FIELD + '">' +
      "</div>" +
      '<div class="space-y-2">' +
      '<label for="bmTime" class="' + LABEL + '"><i class="fas fa-clock text-[11px] text-brand" aria-hidden="true"></i> Time Slot</label>' +
      '<div class="relative">' +
      '<select id="bmTime" name="time" required class="' + SELECT + '">' + options(SLOTS, "Select Slot") + "</select>" +
      '<i class="fas fa-chevron-down pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" aria-hidden="true"></i>' +
      "</div></div>" +
      "</div>" +
      '<div class="space-y-2">' +
      '<label for="bmService" class="' + LABEL + '"><i class="fas fa-stethoscope text-[11px] text-brand" aria-hidden="true"></i> Treatment Type</label>' +
      '<div class="relative">' +
      '<select id="bmService" name="service" required class="' + SELECT + '">' + options(SERVICES, "Select treatment") + "</select>" +
      '<i class="fas fa-chevron-down pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" aria-hidden="true"></i>' +
      "</div></div>" +
      '<button type="submit" class="flex w-full items-center justify-center gap-3 rounded-xl bg-brand-deep py-4 text-base font-bold text-white shadow-lg transition duration-300 hover:bg-brand active:scale-[0.99]">' +
      'Book on WhatsApp <i class="fas fa-arrow-right text-sm" aria-hidden="true"></i></button>' +
      "</form>" +
      '<div class="mt-6 flex items-center gap-4 border-t border-slate-100 pt-5">' +
      '<span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-brand"><i class="fas fa-phone" aria-hidden="true"></i></span>' +
      "<div>" +
      '<p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Direct help</p>' +
      '<p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-ink">' +
      '<a href="tel:+919030271023" class="transition hover:text-brand">+91 90302 71023</a>' +
      '<span aria-hidden="true" class="text-slate-300">&bull;</span>' +
      '<a href="tel:+917416860888" class="transition hover:text-brand">+91 74168 60888</a>' +
      "</p></div></div>" +
      "</div></div>";

    document.body.appendChild(overlay);

    var form = overlay.querySelector("#bookingModalForm");
    var dateInput = overlay.querySelector("#bmDate");
    var lastFocused = null;
    var openTimer = null;

    /* No dates in the past */
    var today = new Date();
    dateInput.min =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    var openModal = function () {
      if (overlay.style.display === "flex") return;
      lastFocused = document.activeElement;
      overlay.style.display = "flex";
      document.body.style.overflow = "hidden";
      overlay.querySelector("#bmName").focus();
    };

    var closeModal = function () {
      if (openTimer) window.clearTimeout(openTimer);
      overlay.style.display = "none";
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    /* Close: X button, backdrop click, Escape */
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.closest("[data-close-booking]")) closeModal();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });

    /* Any element can reopen it */
    document.querySelectorAll("[data-open-booking]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var value = function (name) {
        var field = form.elements[name];
        return field && field.value ? field.value.trim() : "-";
      };

      var text = [
        "*New Appointment Request — Best Dental Clinic*",
        "",
        "Name: " + value("name"),
        "Phone: " + value("phone"),
        "Service: " + value("service"),
        "Preferred date: " + value("date"),
        "Preferred time: " + value("time"),
      ].join("\n");

      window.open(
        "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text),
        "_blank",
        "noopener"
      );

      form.reset();
      closeModal();
    });

    /* Auto-open 3s after every load / refresh */
    if (!onBookingPage) openTimer = window.setTimeout(openModal, 3000);
  })();
})();
