"use strict";

// ===== 1. CONFIGURATION & CONSTANTS =====
const CONFIG = {
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    large: 1200,
  },
  animations: {
    duration: 300,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    stagger: 100,
  },
  scroll: {
    threshold: 50,
    debounceDelay: 10,
  },
  form: {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    loadingTimeout: 1500,
  },
};

const SELECTORS = {
  header: ".header",
  nav: ".nav",
  mobileToggle: ".mobile-menu-toggle",
  navLinks: ".navbar",
  sections: ".hero, .about, .experience, .projects, .services, .contact",
  animatedCards: ".proj-card, .service-card, .exp-card",
  contactForm: ".contact-form",
  submitBtn: ".btn.dark",
  formInputs: "input, textarea",
  images: "img",
};

// ===== 2. UTILITY FUNCTIONS =====
const Utils = {
  /**
   * Debounce function to limit function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Execute immediately
   * @returns {Function} Debounced function
   */
  debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  /**
   * Throttle function to limit function execution rate
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Check if element is in viewport
   * @param {Element} element - Element to check
   * @returns {boolean} Whether element is in viewport
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * Get current viewport width
   * @returns {number} Viewport width
   */
  getViewportWidth() {
    return Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
  },

  /**
   * Check if device is mobile
   * @returns {boolean} Whether device is mobile
   */
  isMobile() {
    return this.getViewportWidth() <= CONFIG.breakpoints.mobile;
  },

  /**
   * Check if device is tablet
   * @returns {boolean} Whether device is tablet
   */
  isTablet() {
    const width = this.getViewportWidth();
    return (
      width > CONFIG.breakpoints.mobile && width <= CONFIG.breakpoints.tablet
    );
  },

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} Whether email is valid
   */
  isValidEmail(email) {
    return CONFIG.form.emailRegex.test(email);
  },

  /**
   * Log error with context
   * @param {string} context - Error context
   * @param {Error} error - Error object
   */
  logError(context, error) {
    console.error(`[Foxesign Portfolio] ${context}:`, error);
  },

  /**
   * Safe querySelector
   * @param {string} selector - CSS selector
   * @param {Element} parent - Parent element
   * @returns {Element|null} Found element or null
   */
  $(selector, parent = document) {
    try {
      return parent.querySelector(selector);
    } catch (error) {
      this.logError("Selector error", error);
      return null;
    }
  },

  /**
   * Safe querySelectorAll
   * @param {string} selector - CSS selector
   * @param {Element} parent - Parent element
   * @returns {NodeList} Found elements
   */
  $$(selector, parent = document) {
    try {
      return parent.querySelectorAll(selector);
    } catch (error) {
      this.logError("Selector error", error);
      return [];
    }
  },
};

// ===== 3. DOM MANAGEMENT =====
const DOM = {
  elements: {},

  /**
   * Cache DOM elements for better performance
   */
  cacheElements() {
    this.elements = {
      header: Utils.$(SELECTORS.header),
      nav: Utils.$(SELECTORS.nav),
      mobileToggle: Utils.$(SELECTORS.mobileToggle),
      navLinks: Utils.$$(SELECTORS.navLinks),
      sections: Utils.$$(SELECTORS.sections),
      animatedCards: Utils.$$(SELECTORS.animatedCards),
      contactForm: Utils.$(SELECTORS.contactForm),
      submitBtn: Utils.$(SELECTORS.submitBtn),
      images: Utils.$$(SELECTORS.images),
      body: document.body,
    };
  },

  /**
   * Check if required elements exist
   * @returns {boolean} Whether all required elements exist
   */
  validateElements() {
    const required = ["header", "nav", "mobileToggle", "body"];
    return required.every((key) => this.elements[key] !== null);
  },
};

// ===== 4. NAVIGATION & MOBILE MENU =====
const Navigation = {
  isMenuOpen: false,

  /**
   * Initialize navigation functionality
   */
  init() {
    if (!DOM.elements.mobileToggle || !DOM.elements.nav) {
      Utils.logError(
        "Navigation init",
        new Error("Required navigation elements not found")
      );
      return;
    }

    this.bindEvents();
    this.setupSmoothScrolling();
  },

  /**
   * Bind navigation event listeners
   */
  bindEvents() {
    // Mobile menu toggle
    DOM.elements.mobileToggle.addEventListener(
      "click",
      this.toggleMobileMenu.bind(this)
    );

    // Close menu on nav link click
    DOM.elements.navLinks.forEach((link) => {
      link.addEventListener("click", this.closeMobileMenu.bind(this));
    });

    // Close menu on outside click
    document.addEventListener("click", this.handleOutsideClick.bind(this));

    // Handle escape key
    document.addEventListener("keydown", this.handleEscapeKey.bind(this));

    // Handle window resize
    window.addEventListener(
      "resize",
      Utils.debounce(this.handleResize.bind(this), 250)
    );
  },

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    this.isMenuOpen ? this.closeMobileMenu() : this.openMobileMenu();
  },

  /**
   * Open mobile menu
   */
  openMobileMenu() {
    if (this.isMenuOpen) return;

    this.isMenuOpen = true;
    DOM.elements.mobileToggle.classList.add("active");
    DOM.elements.nav.classList.add("mobile-menu-open");
    DOM.elements.body.style.overflow = "hidden";

    // Add aria attributes for accessibility
    DOM.elements.mobileToggle.setAttribute("aria-expanded", "true");
    DOM.elements.nav.setAttribute("aria-hidden", "false");
  },

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    if (!this.isMenuOpen) return;

    this.isMenuOpen = false;
    DOM.elements.mobileToggle.classList.remove("active");
    DOM.elements.nav.classList.remove("mobile-menu-open");
    DOM.elements.body.style.overflow = "";

    // Update aria attributes
    DOM.elements.mobileToggle.setAttribute("aria-expanded", "false");
    DOM.elements.nav.setAttribute("aria-hidden", "true");
  },

  /**
   * Handle outside click to close menu
   * @param {Event} event - Click event
   */
  handleOutsideClick(event) {
    if (!this.isMenuOpen) return;

    const isClickInsideNav = DOM.elements.nav.contains(event.target);
    const isClickOnToggle = DOM.elements.mobileToggle.contains(event.target);

    if (!isClickInsideNav && !isClickOnToggle) {
      this.closeMobileMenu();
    }
  },

  /**
   * Handle escape key to close menu
   * @param {Event} event - Keyboard event
   */
  handleEscapeKey(event) {
    if (event.key === "Escape" && this.isMenuOpen) {
      this.closeMobileMenu();
    }
  },

  /**
   * Handle window resize
   */
  handleResize() {
    // Close mobile menu if window becomes desktop size
    if (
      Utils.getViewportWidth() > CONFIG.breakpoints.tablet &&
      this.isMenuOpen
    ) {
      this.closeMobileMenu();
    }
  },

  /**
   * Setup smooth scrolling for navigation links
   */
  setupSmoothScrolling() {
    DOM.elements.navLinks.forEach((link) => {
      link.addEventListener("click", this.handleSmoothScroll.bind(this));
    });
  },

  /**
   * Handle smooth scroll navigation
   * @param {Event} event - Click event
   */
  handleSmoothScroll(event) {
    event.preventDefault();

    const targetId = event.target.getAttribute("href");
    const targetSection = Utils.$(targetId);

    if (!targetSection) return;

    const headerHeight = DOM.elements.header
      ? DOM.elements.header.offsetHeight
      : 0;
    const targetPosition = targetSection.offsetTop - headerHeight - 20;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  },
};

// ===== 5. SCROLL EFFECTS & ANIMATIONS =====
const ScrollEffects = {
  lastScrollY: 0,
  ticking: false,

  /**
   * Initialize scroll effects
   */
  init() {
    this.setupHeaderEffects();
    this.setupScrollAnimations();
    this.setupTouchHandlers();
  },

  /**
   * Setup header scroll effects
   */
  setupHeaderEffects() {
    if (!DOM.elements.header) return;

    window.addEventListener(
      "scroll",
      Utils.debounce(this.updateHeader.bind(this), CONFIG.scroll.debounceDelay),
      { passive: true }
    );
  },

  /**
   * Update header on scroll
   */
  updateHeader() {
    if (!DOM.elements.header) return;

    const scrollY = window.scrollY;

    // Add scrolled class for styling
    if (scrollY > CONFIG.scroll.threshold) {
      DOM.elements.header.classList.add("scrolled");
    } else {
      DOM.elements.header.classList.remove("scrolled");
    }

    this.lastScrollY = scrollY <= 0 ? 0 : scrollY;
  },

  /**
   * Setup scroll animations using Intersection Observer
   */
  setupScrollAnimations() {
    if (!window.IntersectionObserver) {
      // Fallback for browsers without IntersectionObserver
      this.fallbackAnimations();
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      observerOptions
    );

    // Observe sections
    DOM.elements.sections.forEach((section) => {
      this.prepareElementForAnimation(section);
      observer.observe(section);
    });

    // Observe cards
    DOM.elements.animatedCards.forEach((card, index) => {
      this.prepareElementForAnimation(card, index);
      observer.observe(card);
    });
  },

  /**
   * Handle intersection observer callback
   * @param {IntersectionObserverEntry[]} entries - Intersection entries
   */
  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.animateElement(entry.target);
        entry.target.intersectionObserver?.unobserve(entry.target);
      }
    });
  },

  /**
   * Prepare element for animation
   * @param {Element} element - Element to prepare
   * @param {number} index - Element index for stagger effect
   */
  prepareElementForAnimation(element, index = 0) {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";
    element.style.transition = `opacity ${CONFIG.animations.duration}ms ${CONFIG.animations.easing}, transform ${CONFIG.animations.duration}ms ${CONFIG.animations.easing}`;
    element.style.transitionDelay = `${index * CONFIG.animations.stagger}ms`;
  },

  /**
   * Animate element into view
   * @param {Element} element - Element to animate
   */
  animateElement(element) {
    element.style.opacity = "1";
    element.style.transform = "translateY(0)";
  },

  /**
   * Fallback animations for older browsers
   */
  fallbackAnimations() {
    const elements = [...DOM.elements.sections, ...DOM.elements.animatedCards];

    elements.forEach((element, index) => {
      setTimeout(() => {
        this.animateElement(element);
      }, index * CONFIG.animations.stagger);
    });
  },

  /**
   * Setup touch handlers for mobile interactions
   */
  setupTouchHandlers() {
    if (!Utils.isMobile()) return;

    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener(
      "touchstart",
      (event) => {
        touchStartY = event.changedTouches[0].screenY;
      },
      { passive: true }
    );

    document.addEventListener(
      "touchend",
      (event) => {
        touchEndY = event.changedTouches[0].screenY;
        this.handleSwipe(touchStartY, touchEndY);
      },
      { passive: true }
    );
  },

  /**
   * Handle swipe gestures
   * @param {number} startY - Touch start Y position
   * @param {number} endY - Touch end Y position
   */
  handleSwipe(startY, endY) {
    const swipeThreshold = 50;
    const diff = startY - endY;

    if (Math.abs(diff) > swipeThreshold && diff > 0) {
      // Swiped up - close mobile menu if open
      if (Navigation.isMenuOpen) {
        Navigation.closeMobileMenu();
      }
    }
  },
};

// ===== 6. FORM HANDLING =====
const FormHandler = {
  /**
   * Initialize form handling
   */
  init() {
    if (!DOM.elements.contactForm || !DOM.elements.submitBtn) {
      Utils.logError("Form init", new Error("Contact form elements not found"));
      return;
    }

    this.bindEvents();
  },

  /**
   * Bind form event listeners
   */
  bindEvents() {
    DOM.elements.submitBtn.addEventListener(
      "click",
      this.handleSubmit.bind(this)
    );

    // Real-time validation
    const inputs = Utils.$$(SELECTORS.formInputs, DOM.elements.contactForm);
    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => this.clearFieldError(input));
    });
  },

  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  async handleSubmit(event) {
    event.preventDefault();

    const formData = this.getFormData();

    if (!this.validateForm(formData)) {
      return;
    }

    try {
      this.setLoadingState(true);
      await this.submitForm(formData);
      this.showMessage(
        "Thank you for your message! I will get back to you soon.",
        "success"
      );
      this.resetForm();
    } catch (error) {
      Utils.logError("Form submission", error);
      this.showMessage(
        "There was an error sending your message. Please try again.",
        "error"
      );
    } finally {
      this.setLoadingState(false);
    }
  },

  /**
   * Get form data
   * @returns {Object} Form data object
   */
  getFormData() {
    const inputs = Utils.$$(SELECTORS.formInputs, DOM.elements.contactForm);
    const data = {};

    inputs.forEach((input) => {
      const name = input.name || input.type;
      data[name] = input.value.trim();
    });

    return data;
  },

  /**
   * Validate entire form
   * @param {Object} formData - Form data to validate
   * @returns {boolean} Whether form is valid
   */
  validateForm(formData) {
    const errors = [];
    const inputs = Utils.$$(SELECTORS.formInputs, DOM.elements.contactForm);

    // Reset previous errors
    inputs.forEach((input) => this.clearFieldError(input));

    // Validation rules
    const nameInput = Utils.$('input[type="text"]', DOM.elements.contactForm);
    const emailInput = Utils.$('input[type="email"]', DOM.elements.contactForm);
    const messageInput = Utils.$("textarea", DOM.elements.contactForm);

    if (!formData.text || formData.text.length === 0) {
      errors.push("Name is required");
      this.setFieldError(nameInput);
    }

    if (!formData.email || formData.email.length === 0) {
      errors.push("Email is required");
      this.setFieldError(emailInput);
    } else if (!Utils.isValidEmail(formData.email)) {
      errors.push("Please enter a valid email address");
      this.setFieldError(emailInput);
    }

    if (!formData.textarea || formData.textarea.length === 0) {
      errors.push("Message is required");
      this.setFieldError(messageInput);
    }

    if (errors.length > 0) {
      this.showMessage(errors.join("\n"), "error");
      return false;
    }

    return true;
  },

  /**
   * Validate individual field
   * @param {Element} field - Field to validate
   * @returns {boolean} Whether field is valid
   */
  validateField(field) {
    const value = field.value.trim();
    let isValid = true;

    if (field.hasAttribute("required") && !value) {
      isValid = false;
    } else if (field.type === "email" && value && !Utils.isValidEmail(value)) {
      isValid = false;
    }

    if (isValid) {
      this.clearFieldError(field);
    } else {
      this.setFieldError(field);
    }

    return isValid;
  },

  /**
   * Set field error state
   * @param {Element} field - Field element
   */
  setFieldError(field) {
    if (field) {
      field.style.borderColor = "#ef4444";
      field.setAttribute("aria-invalid", "true");
    }
  },

  /**
   * Clear field error state
   * @param {Element} field - Field element
   */
  clearFieldError(field) {
    if (field) {
      field.style.borderColor = "";
      field.removeAttribute("aria-invalid");
    }
  },

  /**
   * Set loading state
   * @param {boolean} isLoading - Whether form is loading
   */
  setLoadingState(isLoading) {
    if (!DOM.elements.submitBtn) return;

    DOM.elements.submitBtn.style.opacity = isLoading ? "0.6" : "1";
    DOM.elements.submitBtn.style.pointerEvents = isLoading ? "none" : "auto";
    DOM.elements.submitBtn.textContent = isLoading
      ? "Sending..."
      : "Get In Touch";
    DOM.elements.submitBtn.setAttribute("aria-busy", isLoading.toString());
  },

  /**
   * Submit form (mock implementation)
   * @param {Object} formData - Form data to submit
   * @returns {Promise} Submission promise
   */
  async submitForm(formData) {
    // Mock API call - replace with actual endpoint
    return new Promise((resolve) => {
      setTimeout(resolve, CONFIG.form.loadingTimeout);
    });
  },

  /**
   * Show form message
   * @param {string} message - Message to show
   * @param {string} type - Message type (success, error, info)
   */
  showMessage(message, type = "info") {
    // Remove existing message
    const existingMessage = Utils.$(".form-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create message element
    const messageEl = document.createElement("div");
    messageEl.className = `form-message form-message--${type}`;
    messageEl.textContent = message;
    messageEl.setAttribute("role", type === "error" ? "alert" : "status");

    // Style message
    Object.assign(messageEl.style, {
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "16px",
      fontSize: "14px",
      lineHeight: "1.4",
      backgroundColor: type === "error" ? "#fef2f2" : "#f0fdf4",
      color: type === "error" ? "#dc2626" : "#16a34a",
      border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`,
    });

    // Insert message
    DOM.elements.contactForm.insertBefore(
      messageEl,
      DOM.elements.contactForm.firstChild
    );

    // Auto-remove success messages
    if (type === "success") {
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.remove();
        }
      }, 5000);
    }
  },

  /**
   * Reset form
   */
  resetForm() {
    if (DOM.elements.contactForm.reset) {
      DOM.elements.contactForm.reset();
    } else {
      const inputs = Utils.$$(SELECTORS.formInputs, DOM.elements.contactForm);
      inputs.forEach((input) => {
        input.value = "";
        this.clearFieldError(input);
      });
    }
  },
};

// ===== 7. PERFORMANCE OPTIMIZATIONS =====
const Performance = {
  /**
   * Initialize performance optimizations
   */
  init() {
    this.setupImageOptimization();
    this.setupVisibilityHandling();
  },

  /**
   * Setup image optimization and lazy loading
   */
  setupImageOptimization() {
    // Native lazy loading support
    if ("loading" in HTMLImageElement.prototype) {
      DOM.elements.images.forEach((img) => {
        if (!img.hasAttribute("loading") && !Utils.isInViewport(img)) {
          img.loading = "lazy";
        }
      });
    } else {
      // Fallback: Intersection Observer for lazy loading
      this.setupLazyLoading();
    }

    // Handle image load errors
    DOM.elements.images.forEach((img) => {
      img.addEventListener("error", this.handleImageError.bind(this));
      img.addEventListener("load", this.handleImageLoad.bind(this));
    });
  },

  /**
   * Setup lazy loading fallback
   */
  setupLazyLoading() {
    if (!window.IntersectionObserver) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          }
          imageObserver.unobserve(img);
        }
      });
    });

    DOM.elements.images.forEach((img) => {
      if (img.dataset.src) {
        imageObserver.observe(img);
      }
    });
  },

  /**
   * Handle image load errors
   * @param {Event} event - Error event
   */
  handleImageError(event) {
    const img = event.target;
    img.style.opacity = "0.3";
    img.style.filter = "grayscale(100%)";
    Utils.logError(
      "Image load failed",
      new Error(`Failed to load: ${img.src}`)
    );
  },

  /**
   * Handle successful image load
   * @param {Event} event - Load event
   */
  handleImageLoad(event) {
    const img = event.target;
    img.style.opacity = "1";
    img.style.filter = "none";
  },

  /**
   * Setup visibility change handling
   */
  setupVisibilityHandling() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        DOM.elements.body.classList.add("page-hidden");
      } else {
        DOM.elements.body.classList.remove("page-hidden");
      }
    });
  },
};

// ===== 8. ERROR HANDLING =====
const ErrorHandler = {
  /**
   * Initialize error handling
   */
  init() {
    window.addEventListener("error", this.handleGlobalError.bind(this));
    window.addEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection.bind(this)
    );
  },

  /**
   * Handle global JavaScript errors
   * @param {ErrorEvent} event - Error event
   */
  handleGlobalError(event) {
    Utils.logError("Global error", event.error);
    // Could implement error reporting here
  },

  /**
   * Handle unhandled promise rejections
   * @param {PromiseRejectionEvent} event - Promise rejection event
   */
  handleUnhandledRejection(event) {
    Utils.logError("Unhandled promise rejection", event.reason);
    // Could implement error reporting here
  },
};

// ===== 9. INITIALIZATION =====
const App = {
  /**
   * Initialize the application
   */
  init() {
    // Check for required APIs
    if (!this.checkBrowserSupport()) {
      console.warn(
        "[Foxesign Portfolio] Some features may not work in this browser"
      );
    }

    // Cache DOM elements
    DOM.cacheElements();

    // Validate required elements
    if (!DOM.validateElements()) {
      Utils.logError("App init", new Error("Required DOM elements not found"));
      return;
    }

    // Initialize modules
    try {
      Navigation.init();
      ScrollEffects.init();
      FormHandler.init();
      Performance.init();
      ErrorHandler.init();

      console.log("[Foxesign Portfolio] Application initialized successfully");
    } catch (error) {
      Utils.logError("App initialization", error);
    }
  },

  /**
   * Check browser support for required features
   * @returns {boolean} Whether browser is supported
   */
  checkBrowserSupport() {
    const requiredFeatures = ["addEventListener", "querySelector", "classList"];

    return requiredFeatures.every(
      (feature) =>
        typeof window[feature] !== "undefined" ||
        typeof document[feature] !== "undefined"
    );
  },
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", App.init.bind(App));
} else {
  App.init();
}

// Export for potential module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { App, Utils, Navigation, ScrollEffects, FormHandler };
}
