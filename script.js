(() => {
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  const updateHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
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
    if (menuButton.getAttribute("aria-expanded") === "true") closeMenu();
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

  const formatRubles = (value) =>
    Math.round(value).toLocaleString("ru-RU") + " ₽";

  const setupSupportCalculator = () => {
    const calculator = document.querySelector("[data-support-calculator]");
    if (!calculator) return;

    const hourlyRate = 380;
    const hoursSelect = calculator.querySelector("[data-support-hours]");
    const daysSelect = calculator.querySelector("[data-support-days]");
    const monthlyOutput = calculator.querySelector("[data-support-monthly]");
    const shiftOutput = calculator.querySelector("[data-support-shift]");
    const weeklyOutput = calculator.querySelector("[data-support-weekly]");
    const weeklyHoursOutput = calculator.querySelector("[data-support-weekly-hours]");
    const formulaOutput = calculator.querySelector("[data-support-formula]");
    const incomeNote = calculator.querySelector("[data-support-note]");

    const calculate = () => {
      const hours = Number(hoursSelect.value);
      const days = Number(daysSelect.value);
      const shiftIncome = hours * hourlyRate;
      const weeklyHours = hours * days;
      const weeklyIncome = weeklyHours * hourlyRate;
      const monthlyIncome = weeklyIncome * 52 / 12;

      monthlyOutput.textContent = formatRubles(monthlyIncome);
      shiftOutput.textContent = formatRubles(shiftIncome);
      weeklyOutput.textContent = formatRubles(weeklyIncome);
      weeklyHoursOutput.textContent = weeklyHours + " ч";
      formulaOutput.textContent = `${hours} ч × ${days} дн. × ${hourlyRate} ₽ × 52 / 12`;

      const isMainLoad = monthlyIncome >= 55000;
      incomeNote.classList.toggle("is-main-load", isMainLoad);
      incomeNote.textContent = isMainLoad
        ? "Выбранный график соответствует ориентиру дохода от 55 000 ₽."
        : "При небольшой загрузке итог может быть ниже 55 000 ₽ и рассчитывается пропорционально часам.";
    };

    hoursSelect.addEventListener("change", calculate);
    daysSelect.addEventListener("change", calculate);
    calculate();
  };

  const setupOrdersCalculator = () => {
    const calculator = document.querySelector("[data-orders-calculator]");
    if (!calculator) return;

    const dayRate = 430;
    const nightRate = 450;
    const daysSelect = calculator.querySelector("[data-orders-days]");
    const dayHoursContainer = calculator.querySelector("[data-day-hours]");
    const selectedDay = calculator.querySelector("[data-selected-day]");
    const error = calculator.querySelector("[data-orders-error]");
    const weeklyHoursOutput = calculator.querySelector("[data-orders-weekly-hours]");
    const weeklyIncomeOutput = calculator.querySelector("[data-orders-weekly-income]");
    const dayIncomeOutput = calculator.querySelector("[data-orders-day-income]");
    const monthlyOutput = calculator.querySelector("[data-orders-monthly]");
    const formulaOutput = calculator.querySelector("[data-orders-formula]");
    const incomeNote = calculator.querySelector("[data-orders-note]");
    const presetButtons = [...calculator.querySelectorAll("[data-weekly-preset]")];

    const presets = {
      10: [5, 5],
      20: [5, 5, 5, 5],
      25: [5, 5, 5, 5, 5],
      26: [6, 5, 5, 5, 5],
      30: [6, 6, 6, 6, 6],
      40: [8, 8, 8, 8, 8]
    };

    const getRows = () => [...dayHoursContainer.querySelectorAll("[data-day-hours-row]")];
    const readRows = () => getRows().map((row) => ({
      day: Number(row.querySelector("[data-day-hours-day]").value) || 0,
      night: Number(row.querySelector("[data-day-hours-night]").value) || 0
    }));

    const updateSelectedDayOptions = (days, preferredIndex = 0) => {
      selectedDay.replaceChildren();
      for (let index = 0; index < days; index += 1) {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = `День ${index + 1}`;
        selectedDay.append(option);
      }
      selectedDay.value = String(Math.min(preferredIndex, days - 1));
    };

    const calculate = () => {
      const rows = readRows();
      const dayHours = rows.reduce((sum, value) => sum + value.day, 0);
      const nightHours = rows.reduce((sum, value) => sum + value.night, 0);
      const weeklyHours = dayHours + nightHours;
      const hasTooLongDay = rows.some((value) => value.day + value.night > 12);
      const hasNegativeDay = rows.some((value) => value.day < 0 || value.night < 0);

      getRows().forEach((row, index) => {
        const invalid = rows[index].day + rows[index].night > 12 || rows[index].day < 0 || rows[index].night < 0;
        row.querySelectorAll("input").forEach((input) => input.setAttribute("aria-invalid", String(invalid)));
      });

      if (hasTooLongDay) {
        error.textContent = "Продолжительность работы не может превышать 12 часов в сутки.";
        error.hidden = false;
      } else if (hasNegativeDay) {
        error.textContent = "Количество часов не может быть отрицательным.";
        error.hidden = false;
      } else if (weeklyHours < 10) {
        error.textContent = "Минимальная загрузка для этой вакансии — 10 часов в неделю.";
        error.hidden = false;
      } else {
        error.hidden = true;
        error.textContent = "";
      }

      const weeklyIncome = dayHours * dayRate + nightHours * nightRate;
      const monthlyIncome = weeklyIncome * 52 / 12;
      const selectedIndex = Number(selectedDay.value) || 0;
      const chosenDay = rows[selectedIndex] || { day: 0, night: 0 };

      weeklyHoursOutput.textContent = `${weeklyHours.toLocaleString("ru-RU")} ч`;
      weeklyIncomeOutput.textContent = formatRubles(weeklyIncome);
      dayIncomeOutput.textContent = formatRubles(chosenDay.day * dayRate + chosenDay.night * nightRate);
      monthlyOutput.textContent = formatRubles(monthlyIncome);
      formulaOutput.textContent = `${dayHours.toLocaleString("ru-RU")} ч × ${dayRate} ₽ + ${nightHours.toLocaleString("ru-RU")} ч × ${nightRate} ₽; недельный доход × 52 / 12`;

      const reachesReference = monthlyIncome >= 55000;
      const nearReference = monthlyIncome >= 50000 && monthlyIncome < 55000;
      incomeNote.classList.toggle("is-main-load", reachesReference || nearReference);
      incomeNote.textContent = reachesReference
        ? "Выбранная загрузка достигает или превышает ориентир около 55 000 ₽ в месяц."
        : nearReference
          ? "Загрузка близка к ориентиру около 55 000 ₽ в месяц."
          : "Доход рассчитывается пропорционально выбранному количеству часов.";
    };

    const renderDays = (days, values = []) => {
      const previousIndex = Number(selectedDay.value) || 0;
      dayHoursContainer.replaceChildren();

      for (let index = 0; index < days; index += 1) {
        const label = document.createElement("label");
        label.className = "day-hour-row";
        const value = values[index] ?? { day: 0, night: 0 };
        label.setAttribute("data-day-hours-row", "");
        label.innerHTML = `<span>День ${index + 1}</span><span class="day-hour-pair"><span class="day-hour-input"><small>День</small><input type="number" min="0" max="12" step="0.5" inputmode="decimal" value="${value.day ?? value ?? 0}" data-day-hours-day aria-label="Дневных часов в день ${index + 1}"></span><span class="day-hour-input"><small>Ночь</small><input type="number" min="0" max="12" step="0.5" inputmode="decimal" value="${value.night ?? 0}" data-day-hours-night aria-label="Ночных часов в день ${index + 1}"></span></span>`;
        dayHoursContainer.append(label);
      }

      updateSelectedDayOptions(days, previousIndex);
      getRows().forEach((row, index) => {
        row.querySelectorAll("input").forEach((input) => input.addEventListener("input", () => {
          selectedDay.value = String(index);
          presetButtons.forEach((button) => button.setAttribute("aria-pressed", "false"));
          calculate();
        }));
      });
      calculate();
    };

    const applyPreset = (hours) => {
      const dayValues = presets[hours];
      const values = dayValues.map((day) => ({ day, night: 0 }));
      daysSelect.value = String(dayValues.length);
      presetButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(Number(button.dataset.weeklyPreset) === hours));
      });
      renderDays(values.length, values);
    };

    daysSelect.addEventListener("change", () => {
      const currentValues = readRows();
      const days = Number(daysSelect.value);
      const values = Array.from({ length: days }, (_, index) => currentValues[index] ?? { day: 0, night: 0 });
      presetButtons.forEach((button) => button.setAttribute("aria-pressed", "false"));
      renderDays(days, values);
    });

    selectedDay.addEventListener("change", calculate);
    presetButtons.forEach((button) => {
      button.addEventListener("click", () => applyPreset(Number(button.dataset.weeklyPreset)));
    });

    applyPreset(25);
  };

  const setupOrderDemo = () => {
    const demo = document.querySelector("[data-order-demo]");
    if (!demo) return;

    const card = demo.querySelector("[data-demo-card]");
    const status = demo.querySelector("[data-order-status]");
    const owner = demo.querySelector("[data-order-owner]");
    const deviation = demo.querySelector("[data-deviation]");
    const nextStep = demo.querySelector("[data-next-step]");
    const empty = demo.querySelector("[data-demo-empty]");
    const message = demo.querySelector("[data-message-preview]");
    const checkButton = demo.querySelector("[data-demo-check]");
    const composeButton = demo.querySelector("[data-demo-compose]");
    const transferButton = demo.querySelector("[data-demo-transfer]");
    const resetButton = demo.querySelector("[data-demo-reset]");
    const announcement = demo.querySelector("[data-demo-announcement]");
    const progress = [...demo.querySelectorAll("[data-demo-step]")];

    const setProgress = (step) => {
      progress.forEach((item) => {
        const itemStep = Number(item.dataset.demoStep);
        item.classList.toggle("is-active", itemStep === step);
        item.classList.toggle("is-complete", itemStep < step || step === 4);
      });
    };

    const reset = (focus = false) => {
      card.classList.remove("is-inspected", "is-transferred");
      status.textContent = "Новый";
      owner.textContent = "Не указан";
      deviation.hidden = true;
      nextStep.hidden = true;
      empty.hidden = false;
      message.hidden = true;
      checkButton.disabled = false;
      composeButton.disabled = true;
      transferButton.disabled = true;
      setProgress(1);
      announcement.textContent = "Шаг 1 из 3. Проверьте карточку заказа.";
      if (focus) checkButton.focus();
    };

    checkButton.addEventListener("click", () => {
      card.classList.add("is-inspected");
      deviation.hidden = false;
      checkButton.disabled = true;
      composeButton.disabled = false;
      setProgress(2);
      announcement.textContent = "Обнаружено отклонение: срок приближается, ответственный не указан.";
      composeButton.focus();
    });

    composeButton.addEventListener("click", () => {
      empty.hidden = true;
      message.hidden = false;
      composeButton.disabled = true;
      transferButton.disabled = false;
      setProgress(3);
      announcement.textContent = "Обращение сформировано. Проверьте структуру и передайте вопрос специалисту.";
      transferButton.focus();
    });

    transferButton.addEventListener("click", () => {
      card.classList.add("is-transferred");
      status.textContent = "Передано ответственному";
      owner.textContent = "Ответственный специалист";
      nextStep.hidden = false;
      transferButton.disabled = true;
      setProgress(4);
      announcement.textContent = "Вопрос передан ответственному. Следующий шаг: ожидаем подтверждения.";
      resetButton.focus();
    });

    resetButton.addEventListener("click", () => reset(true));
    reset();
  };

  setupSupportCalculator();
  setupOrdersCalculator();
  setupOrderDemo();
})();
