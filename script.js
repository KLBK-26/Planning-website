/* ==========================================
   NAVIGATION MENU
   ========================================== */
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".primary-nav a");

if (header && menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ==========================================
   FAQ ACCORDION
   ========================================== */
const faqItems = document.querySelectorAll(".faq-list details");

faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqItems.forEach((otherItem) => {
      if (otherItem !== item) otherItem.removeAttribute("open");
    });
  });
});

/* ==========================================
   MULTI-STEP FORMS
   Auto-converts every .enquiry-form into steps:
   Step 1 — Name, partner, email, phone
   Step 2 — Wedding date, location, guest count, budget
   Step 3 — Services + submit (or step 2 for simple forms)
   ========================================== */
document.querySelectorAll(".enquiry-form").forEach((form) => {
  const allChildren = Array.from(form.children).filter((el) => {
    if (el.classList.contains("hidden-field")) return false;
    if (el.tagName === "INPUT") return false;
    return true;
  });

  if (allChildren.length < 3) return;

  const hasCheckboxStep = !!form.querySelector(".checkbox-fieldset");

  let step1Els, step2Els, step3Els;

  if (hasCheckboxStep) {
    const firstFormRowIdx = allChildren.findIndex((el) =>
      el.classList.contains("form-row")
    );
    const fieldsetIdx = allChildren.findIndex((el) =>
      el.classList.contains("checkbox-fieldset")
    );
    step1Els = allChildren.slice(0, firstFormRowIdx);
    step2Els = allChildren.slice(firstFormRowIdx, fieldsetIdx);
    step3Els = allChildren.slice(fieldsetIdx);
  } else {
    const textareaIdx = allChildren.findIndex((el) => el.querySelector("textarea"));
    step1Els = allChildren.slice(0, textareaIdx);
    step2Els = allChildren.slice(textareaIdx);
    step3Els = [];
  }

  const stepGroups = [step1Els, step2Els, ...(step3Els.length ? [step3Els] : [])];
  const totalSteps = stepGroups.length;

  const stepTitles = totalSteps === 3
    ? ["Your details", "Wedding details", "Services"]
    : ["Your details", "Your message"];

  // Build step indicator dots
  const indicatorEl = document.createElement("div");
  indicatorEl.className = "step-indicators";
  const dotEls = stepGroups.map((_, i) => {
    const dot = document.createElement("span");
    dot.className = "step-dot";
    dot.textContent = i + 1;
    indicatorEl.appendChild(dot);
    if (i < totalSteps - 1) {
      const connector = document.createElement("span");
      connector.className = "step-connector";
      indicatorEl.appendChild(connector);
    }
    return dot;
  });

  form.insertBefore(indicatorEl, allChildren[0]);

  let currentStep = 0;

  const stepWrappers = stepGroups.map((groupEls, i) => {
    const wrapper = document.createElement("div");
    wrapper.className = "form-step";
    wrapper.hidden = true;

    const labelEl = document.createElement("p");
    labelEl.className = "step-label";
    labelEl.textContent = "Step " + (i + 1) + " of " + totalSteps + " \u2014 " + stepTitles[i];
    wrapper.appendChild(labelEl);

    groupEls.forEach((el) => wrapper.appendChild(el));

    const nav = document.createElement("div");
    nav.className = "step-nav";

    if (i > 0) {
      const prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "button button--secondary step-prev";
      prevBtn.textContent = "Back";
      nav.appendChild(prevBtn);
    }

    if (i < totalSteps - 1) {
      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "button step-next";
      nextBtn.textContent = "Next \u2192";
      nav.appendChild(nextBtn);
    }

    const existingSubmit = wrapper.querySelector("button[type='submit']");
    if (existingSubmit && i === totalSteps - 1) {
      nav.appendChild(existingSubmit);
    }

    wrapper.appendChild(nav);
    form.appendChild(wrapper);
    return wrapper;
  });

  function showStep(index) {
    stepWrappers.forEach((w, i) => { w.hidden = i !== index; });
    dotEls.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
      dot.classList.toggle("done", i < index);
    });
    currentStep = index;
    if (index > 0) { setTimeout(() => form.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50); }
  }

  function validateCurrentStep() {
    const wrapper = stepWrappers[currentStep];
    for (const input of wrapper.querySelectorAll("input, select, textarea")) {
      if (!input.checkValidity()) {
        input.reportValidity();
        return false;
      }
    }
    const checkboxGroup = wrapper.querySelector("[data-require-one]");
    if (checkboxGroup) {
      const checkboxes = checkboxGroup.querySelectorAll('input[type="checkbox"]');
      const hasSelection = Array.from(checkboxes).some((cb) => cb.checked);
      if (!hasSelection) {
        checkboxes[0].setCustomValidity("Please select at least one service.");
        checkboxes[0].reportValidity();
        return false;
      } else {
        checkboxes[0].setCustomValidity("");
      }
    }
    return true;
  }

  form.addEventListener("click", (e) => {
    if (e.target.classList.contains("step-next")) {
      if (validateCurrentStep()) showStep(currentStep + 1);
    }
    if (e.target.classList.contains("step-prev")) {
      showStep(currentStep - 1);
    }
  });

  showStep(0);
});

/* ==========================================
   CHECKBOX VALIDATION
   ========================================== */
document.querySelectorAll("[data-require-one]").forEach((group) => {
  const checkboxes = group.querySelectorAll('input[type="checkbox"]');
  const firstCheckbox = checkboxes[0];
  if (!firstCheckbox) return;

  const updateValidity = () => {
    const hasSelection = Array.from(checkboxes).some((cb) => cb.checked);
    firstCheckbox.setCustomValidity(hasSelection ? "" : "Please select at least one service.");
  };

  checkboxes.forEach((cb) => cb.addEventListener("change", updateValidity));
  group.closest("form")?.addEventListener("submit", updateValidity);
  updateValidity();
});

/* ==========================================
   EXIT INTENT POPUP
   Desktop: mouse exits toward browser bar
   Mobile: page becomes hidden (tab close / home screen / app switch)
   Only shows once per session, min 20s on page
   ========================================== */
(function () {
  if (window.location.pathname.includes("thank-you")) return;
  if (sessionStorage.getItem("klbk_popup_shown")) return;

  var pageLoadTime = Date.now();
  var MIN_TIME_MS = 20000; // 20 seconds before mobile trigger fires

  var overlay = document.createElement("div");
  overlay.className = "exit-popup-overlay";
  overlay.hidden = true;
  document.body.appendChild(overlay);

  var popup = document.createElement("div");
  popup.className = "exit-popup";
  popup.hidden = true;
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.setAttribute("aria-labelledby", "exit-popup-title");
  popup.innerHTML = [
    '<button class="exit-popup-close" aria-label="Close">&times;</button>',
    '<p class="eyebrow">Before you go</p>',
    '<h2 id="exit-popup-title">Let&#39;s stay in touch.</h2>',
    '<p>Leave your details and Kara will reach out about availability and next steps — no pressure.</p>',
    '<form class="exit-popup-form" id="exit-popup-form" novalidate>',
    '<label>Name <input name="name" type="text" autocomplete="name" required placeholder="Your name"></label>',
    '<label>Email <input name="email" type="email" autocomplete="email" required placeholder="Your email"></label>',
    '<label>Phone <input name="phone" type="tel" autocomplete="tel" required placeholder="Your phone number"></label>',
    '<button type="submit" class="button">Send My Details</button>',
    '</form>',
    '<div class="exit-popup-success" hidden>',
    '<p class="exit-popup-success-msg">&#10084; Thanks! Kara will be in touch soon.</p>',
    '</div>',
    '<p class="exit-popup-note">Or <a href="https://calendar.app.google/yAL52dCuaiTCBsJk8" target="_blank" rel="noopener">book a free consultation call</a> directly.</p>'
  ].join("");
  document.body.appendChild(popup);

  var popupShown = false;

  function showPopup() {
    if (popupShown || sessionStorage.getItem("klbk_popup_shown")) return;
    popupShown = true;
    sessionStorage.setItem("klbk_popup_shown", "1");
    popup.hidden = false;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () { popup.querySelector("input").focus(); }, 120);
  }

  function closePopup() {
    popup.hidden = true;
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  popup.querySelector(".exit-popup-close").addEventListener("click", closePopup);
  overlay.addEventListener("click", closePopup);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !popup.hidden) closePopup();
  });

  // Form submission via fetch so page doesn't navigate away
  popup.querySelector("#exit-popup-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var form = e.target;
    var inputs = form.querySelectorAll("input");
    var valid = true;
    inputs.forEach(function (input) {
      if (!input.checkValidity()) { input.reportValidity(); valid = false; }
    });
    if (!valid) return;

    var data = new URLSearchParams({
      "form-name": "popup-enquiry",
      name: form.querySelector("[name=name]").value,
      email: form.querySelector("[name=email]").value,
      phone: form.querySelector("[name=phone]").value
    });

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: data.toString()
    }).then(function () {
      form.hidden = true;
      popup.querySelector(".exit-popup-success").hidden = false;
      // Auto close after 3 seconds
      setTimeout(closePopup, 3000);
    }).catch(function () {
      // Fallback — just close gracefully
      closePopup();
    });
  });

  // Desktop: mouse exits toward browser bar / close button
  var hasScrolled = false;
  window.addEventListener("scroll", function () { hasScrolled = true; }, { once: true, passive: true });
  document.addEventListener("mouseleave", function (e) {
    if (e.clientY <= 5 && hasScrolled) setTimeout(showPopup, 300);
  });

  // Mobile / tablet: fires when user goes to home screen, switches apps, or closes tab
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      var timeOnPage = Date.now() - pageLoadTime;
      if (timeOnPage >= MIN_TIME_MS) showPopup();
    }
  });
})();

/* ==========================================
   COOKIE / CLARITY NOTICE BANNER
   ========================================== */
(function () {
  if (localStorage.getItem("klbk_cookie_notice")) return;

  var banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", "Cookie notice");
  banner.innerHTML = [
    '<div class="cookie-banner-inner">',
    '<p>This site uses cookies to improve your experience. <a href="/privacy.html">Read our privacy policy</a></p>',
    '<div class="cookie-banner-actions">',
    '<button class="button cookie-accept">Got it</button>',
    '<button class="button button--secondary cookie-decline">Decline</button>',
    '</div>',
    '</div>'
  ].join("");
  document.body.appendChild(banner);

  var autoDismissTimer = setTimeout(function () {
    dismissBanner(true);
  }, 6000);

  function dismissBanner(loadClarity) {
    clearTimeout(autoDismissTimer);
    localStorage.setItem("klbk_cookie_notice", loadClarity ? "accepted" : "declined");
    banner.classList.add("cookie-banner--hiding");
    setTimeout(function () { banner.remove(); }, 400);
  }

  banner.querySelector(".cookie-accept").addEventListener("click", function () {
    dismissBanner(true);
  });

  banner.querySelector(".cookie-decline").addEventListener("click", function () {
    dismissBanner(false);
    // Disable Clarity for this session if already loaded
    if (window.clarity) window.clarity("stop");
  });
})();

/* ==========================================
   BOOKING MODAL
   Opens the Google Calendar scheduling page for a
   given service in a lazy-loaded overlay, so nothing
   loads until the couple actually clicks "Book".
   ========================================== */
(function () {
  var modal, iframe, closeBtn, lastFocused;

  function buildModal() {
    modal = document.createElement("div");
    modal.className = "booking-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Book a free chat");
    modal.innerHTML = [
      '<div class="booking-modal-backdrop" data-booking-close></div>',
      '<div class="booking-modal-panel">',
      '<button type="button" class="booking-modal-close" data-booking-close aria-label="Close booking window">&times;</button>',
      '<div class="booking-modal-body"><iframe title="Book a free chat" loading="lazy"></iframe></div>',
      '</div>'
    ].join("");
    document.body.appendChild(modal);
    iframe = modal.querySelector("iframe");
    modal.querySelectorAll("[data-booking-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

  function openModal(url) {
    if (!modal) buildModal();
    lastFocused = document.activeElement;
    iframe.src = url;
    modal.classList.add("is-open");
    document.body.classList.add("booking-modal-open");
    closeBtn = modal.querySelector(".booking-modal-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.classList.remove("booking-modal-open");
    iframe.src = "about:blank";
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll("[data-booking-url]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var url = btn.getAttribute("data-booking-url");
      if (!url) return;
      openModal(url);
    });
  });
})();
