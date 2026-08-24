"use strict";

document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopNavigation = window.matchMedia("(min-width: 60rem)");

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const mobileSchedule = document.querySelector(".mobile-schedule");

function setNavigation(open) {
  if (!nav || !navToggle) return;

  nav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));

  const accessibleLabel = navToggle.querySelector(".sr-only");
  if (accessibleLabel) {
    accessibleLabel.textContent = open ? "Fechar menu" : "Abrir menu";
  }
}

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const shouldOpen = navToggle.getAttribute("aria-expanded") !== "true";
    setNavigation(shouldOpen);
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNavigation = nav.contains(event.target) || navToggle.contains(event.target);
    if (!clickedInsideNavigation && nav.classList.contains("is-open")) {
      setNavigation(false);
    }
  });

  desktopNavigation.addEventListener("change", (event) => {
    if (event.matches) setNavigation(false);
  });
}

function updateHeaderState() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    setNavigation(false);

    target.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });

    if (link.classList.contains("skip-link")) {
      target.focus({ preventScroll: true });
    }

    window.history.replaceState(null, "", targetId);
  });
});

const revealElements = document.querySelectorAll(".reveal");

if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.08
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

const faqItems = document.querySelectorAll(".faq-list details");

faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;

    faqItems.forEach((otherItem) => {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});

const unitDialog = document.querySelector("[data-unit-dialog]");
const openDialogButtons = document.querySelectorAll("[data-open-unit-dialog]");
const closeDialogButton = document.querySelector("[data-close-dialog]");

function openUnitDialog() {
  if (!unitDialog) return;

  if (typeof unitDialog.showModal === "function") {
    unitDialog.showModal();
  } else {
    unitDialog.setAttribute("open", "");
  }

  document.body.classList.add("dialog-open");
}

function closeUnitDialog() {
  if (!unitDialog) return;

  if (typeof unitDialog.close === "function" && unitDialog.open) {
    unitDialog.close();
  } else {
    unitDialog.removeAttribute("open");
  }

  document.body.classList.remove("dialog-open");
}

openDialogButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    openUnitDialog();
  });
});

if (closeDialogButton) {
  closeDialogButton.addEventListener("click", closeUnitDialog);
}

if (unitDialog) {
  unitDialog.addEventListener("click", (event) => {
    if (event.target === unitDialog) closeUnitDialog();
  });

  unitDialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
  });

  unitDialog.querySelectorAll("[data-whatsapp]").forEach((link) => {
    link.addEventListener("click", closeUnitDialog);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  const navigationWasOpen = nav?.classList.contains("is-open") || false;
  setNavigation(false);

  if (navigationWasOpen) navToggle?.focus();
  if (unitDialog?.open) closeUnitDialog();
});

const unitsSection = document.querySelector("#unidades");

if (mobileSchedule && unitsSection && "IntersectionObserver" in window) {
  const unitsObserver = new IntersectionObserver(
    ([entry]) => {
      mobileSchedule.classList.toggle("is-hidden", entry.isIntersecting);
    },
    { threshold: 0.15 }
  );

  unitsObserver.observe(unitsSection);
}

document.querySelectorAll("[data-current-year]").forEach((yearElement) => {
  yearElement.textContent = String(new Date().getFullYear());
});

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.addEventListener("click", () => {
    const selectedUnit = link.dataset.unit || "nao-identificada";
    document.dispatchEvent(
      new CustomEvent("venhaSorrir:whatsappClick", {
        detail: { unit: selectedUnit }
      })
    );
  });
});
