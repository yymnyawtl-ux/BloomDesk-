(() => {
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  const updateHeader = () => {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }
  };

  const closeMenu = () => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Открыть меню");
    mobileNav.hidden = true;
    document.body.classList.remove("menu-open");
  };

  const openMenu = () => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Закрыть меню");
    mobileNav.hidden = false;
    document.body.classList.add("menu-open");
    mobileNav.querySelector("a")?.focus();
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    if (isOpen) closeMenu();
    else openMenu();
  });

  mobileNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const calculator = document.querySelector("[data-calculator]");
  if (!calculator) return;

  const HOURLY_RATE = 380;
  const WEEKS_PER_YEAR = 52;
  const MONTHS_PER_YEAR = 12;

  const hoursSelect = calculator.querySelector("#hours");
  const daysSelect = calculator.querySelector("#days");
  const monthlyOutput = calculator.querySelector("[data-monthly-income]");
  const shiftOutput = calculator.querySelector("[data-shift-income]");
  const weeklyOutput = calculator.querySelector("[data-weekly-hours]");
  const formulaOutput = calculator.querySelector("[data-formula]");
  const incomeNote = calculator.querySelector("[data-income-note]");

  const formatRubles = (value) =>
    Math.round(value).toLocaleString("ru-RU") + " ₽";

  const calculateIncome = () => {
    const hours = Number(hoursSelect.value);
    const days = Number(daysSelect.value);
    const shiftIncome = hours * HOURLY_RATE;
    const weeklyHours = hours * days;
    const monthlyIncome =
      hours * days * HOURLY_RATE * (WEEKS_PER_YEAR / MONTHS_PER_YEAR);

    monthlyOutput.textContent = formatRubles(monthlyIncome);
    shiftOutput.textContent = formatRubles(shiftIncome);
    weeklyOutput.textContent = weeklyHours + " ч";
    formulaOutput.textContent =
      hours + " ч × " + days + " дн. × " + HOURLY_RATE + " ₽ × 52 / 12";

    const isMainLoad = monthlyIncome >= 55000;
    incomeNote.classList.toggle("is-main-load", isMainLoad);
    incomeNote.textContent = isMainLoad
      ? "Выбранный график соответствует ориентиру дохода от 55 000 ₽."
      : "Это неполная загрузка: итог ниже ориентира 55 000 ₽ и рассчитывается пропорционально часам.";
  };

  hoursSelect.addEventListener("change", calculateIncome);
  daysSelect.addEventListener("change", calculateIncome);
  calculateIncome();
})();
