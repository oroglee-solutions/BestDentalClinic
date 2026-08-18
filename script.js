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
})();
