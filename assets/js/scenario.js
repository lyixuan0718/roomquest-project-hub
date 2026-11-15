"use strict";

(() => {
  const container = document.querySelector("[data-scenario-view]");
  if (!container) return;

  const root = document.body.dataset.root || "";
  const targetSlug = container.dataset.scenarioSlug;
  const dataVersion = "20261116-3";
  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function renderScenario(scenario) {
    container.innerHTML = `
      <div class="scenario-heading">
        <h3>${escapeHtml(scenario.title)}</h3>
        <span class="scenario-status">${escapeHtml(scenario.status)}｜${escapeHtml(scenario.location)}</span>
      </div>
      <p>${escapeHtml(scenario.summary)}</p>
      <h3>經確認的物品</h3>
      <ul class="scenario-object-list">
        ${scenario.objects.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <h3>關卡</h3>
      ${scenario.clues.map((clue) => `
        <article class="scenario-clue">
          <h3>第 ${escapeHtml(clue.step)} 關</h3>
          <p>${escapeHtml(clue.prompt)}</p>
          <p class="answer-line"><strong>答案：</strong>${escapeHtml(clue.answer)}<br><strong>驗證：</strong>${escapeHtml(clue.verification)}</p>
        </article>`).join("")}
      <p class="note"><strong>最終密碼：</strong>${escapeHtml(scenario.finalCode)}</p>
      <h3>驗證備註</h3>
      <ul>${scenario.validationNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>`;
  }

  fetch(`${root}data/scenarios.json?v=${dataVersion}`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((scenarios) => {
      const scenario = scenarios.find((item) => item.slug === targetSlug);
      if (!scenario) throw new Error(`找不到場景：${targetSlug}`);
      renderScenario(scenario);
    })
    .catch((error) => {
      container.innerHTML = '<p class="load-error">場景資料載入失敗，請稍後重試。</p>';
      console.error("Failed to load scenario:", error);
    });
})();
