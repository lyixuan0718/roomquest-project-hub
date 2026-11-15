const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));
const tabPanels = Array.from(document.querySelectorAll("[data-panel]"));
const scenarioList = document.querySelector("[data-scenario-list]");
const scenarioDetail = document.querySelector("[data-scenario-detail]");
const scenarioStatus = document.querySelector("[data-scenario-status]");

function closeNavigation() {
  nav?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
}

navToggle?.addEventListener("click", () => {
  const willOpen = !nav?.classList.contains("is-open");
  nav?.classList.toggle("is-open", willOpen);
  navToggle.setAttribute("aria-expanded", String(willOpen));
  document.body.classList.toggle("nav-open", willOpen);
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNavigation);
});

function activateTab(tabName, moveFocus = false) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    if (isActive && moveFocus) button.focus();
  });

  tabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tabName;
  });
}

tabButtons.forEach((button, index) => {
  button.addEventListener("click", () => activateTab(button.dataset.tab));
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + tabButtons.length) % tabButtons.length;
    activateTab(tabButtons[nextIndex].dataset.tab, true);
  });
});

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderScenarioDetail(scenario) {
  const objects = scenario.objects
    .map((object) => `<span class="object-tag">${escapeHTML(object)}</span>`)
    .join("");

  const clues = scenario.clues
    .map((clue) => `
      <li class="clue-item">
        <span class="clue-number">${String(clue.step).padStart(2, "0")}</span>
        <div>
          <strong>${escapeHTML(clue.prompt)}</strong>
          <p>${escapeHTML(clue.verification)}</p>
        </div>
        <span class="clue-answer">答案 ${escapeHTML(clue.answer)}</span>
      </li>
    `)
    .join("");

  const validationNotes = scenario.validationNotes
    .map((note) => `<li>${escapeHTML(note)}</li>`)
    .join("");

  scenarioDetail.innerHTML = `
    <div class="scenario-topline">
      <span>${escapeHTML(scenario.status)}</span>
      <span>${escapeHTML(scenario.location)}</span>
    </div>
    <h3>${escapeHTML(scenario.title)}</h3>
    <p>${escapeHTML(scenario.summary)}</p>
    <div class="object-tags" aria-label="場景物品">${objects}</div>
    <ol class="clue-list">${clues}</ol>
    <p><strong>最終密碼：</strong>${escapeHTML(scenario.finalCode)}</p>
    <div class="validation-box">
      <strong>程式需要檢查的地方</strong>
      <ul>${validationNotes}</ul>
    </div>
  `;
}

function renderScenarios(scenarios) {
  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    throw new Error("找不到可顯示的場景案例。");
  }

  scenarioList.innerHTML = scenarios
    .map((scenario, index) => `
      <button class="scenario-button${index === 0 ? " is-active" : ""}" type="button" data-scenario-index="${index}" aria-pressed="${index === 0}">
        <strong>${escapeHTML(scenario.title)}</strong>
        <span>${escapeHTML(scenario.status)} · ${escapeHTML(scenario.location)}</span>
      </button>
    `)
    .join("");

  const buttons = Array.from(scenarioList.querySelectorAll("[data-scenario-index]"));

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.scenarioIndex);
      buttons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
      renderScenarioDetail(scenarios[index]);
    });
  });

  renderScenarioDetail(scenarios[0]);
  scenarioStatus.textContent = `共 ${scenarios.length} 個案例；內容來自 data/scenarios.json。`;
}

async function loadScenarios() {
  try {
    const response = await fetch("data/scenarios.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    renderScenarios(await response.json());
  } catch (error) {
    scenarioDetail.innerHTML = `
      <p class="empty-state"><strong>案例資料載入失敗。</strong><br>請確認 data/scenarios.json 路徑與網站部署狀態。</p>
    `;
    scenarioStatus.textContent = `錯誤：${error.message}`;
  }
}

loadScenarios();

