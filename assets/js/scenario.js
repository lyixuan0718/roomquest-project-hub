"use strict";

(() => {
  const scenarioContainer = document.querySelector("[data-scenario-view]");
  const cardsContainer = document.querySelector("[data-scenario-cards]");
  if (!scenarioContainer && !cardsContainer) return;

  const root = document.body.dataset.root || "";
  const dataVersion = "20261116-4";
  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const normalizeAnswer = (value) => {
    const chineseDigits = { 零: "0", 一: "1", 二: "2", 三: "3", 四: "4", 五: "5", 六: "6", 七: "7", 八: "8", 九: "9" };
    return String(value).trim().toLowerCase()
      .replace(/[\s，,。.!！?？]/g, "")
      .replace(/[張個本號]/g, "")
      .replace(/[零一二三四五六七八九]/g, (character) => chineseDigits[character]);
  };

  function renderCards(scenarios) {
    if (!cardsContainer) return;
    cardsContainer.innerHTML = `<div class="scenario-card-grid">${scenarios.map((scenario) => `
      <article class="scenario-card">
        <p class="scenario-card-meta">${escapeHtml(scenario.location)}｜${escapeHtml(scenario.status)}</p>
        <h3>${escapeHtml(scenario.title)}</h3>
        <p>${escapeHtml(scenario.summary)}</p>
        <p class="scenario-card-facts">${scenario.clues.length} 關・玩家端不呼叫 AI</p>
        <div class="scenario-card-actions">
          <a class="button-primary" href="${root}${escapeHtml(scenario.pagePath)}">開始試玩</a>
          <a class="text-link" href="${root}${escapeHtml(scenario.pagePath)}?mode=developer">查看設計</a>
        </div>
      </article>`).join("")}</div>`;
  }

  function renderPlayerMode(scenario, host) {
    let currentIndex = 0;
    let visibleHints = 0;
    const completedAnswers = [];

    const draw = () => {
      const clue = scenario.clues[currentIndex];
      const progress = Math.round((currentIndex / scenario.clues.length) * 100);
      host.innerHTML = `
        <section class="play-panel" aria-labelledby="play-title">
          <div class="play-progress-row">
            <p id="play-title"><strong>現場試玩</strong>・第 ${clue.step} / ${scenario.clues.length} 關</p>
            <span>${progress}%</span>
          </div>
          <div class="play-progress-track" aria-hidden="true"><span style="width: ${progress}%"></span></div>
          <article class="play-clue-card">
            <p class="eyebrow">目前線索</p>
            <h3>第 ${escapeHtml(clue.step)} 關</h3>
            <p class="clue-prompt">${escapeHtml(clue.prompt)}</p>
            <form class="answer-form" data-answer-form>
              <label for="player-answer">你的答案</label>
              <div class="answer-controls">
                <input id="player-answer" name="answer" autocomplete="off" required>
                <button class="button-primary" type="submit">確認答案</button>
              </div>
            </form>
            <div class="play-actions">
              <button class="button-secondary" type="button" data-show-hint ${visibleHints >= clue.hints.length ? "disabled" : ""}>顯示下一層提示</button>
              <button class="text-button" type="button" data-reset-game>重新開始</button>
            </div>
            <div class="feedback" data-feedback aria-live="polite"></div>
            <ol class="hint-list">${clue.hints.slice(0, visibleHints).map((hint, index) => `<li><strong>提示 ${index + 1}：</strong>${escapeHtml(hint)}</li>`).join("")}</ol>
          </article>
          <p class="play-note">這個模式只讀取已核准的遊戲資料，不會在遊玩時呼叫 AI。</p>
        </section>`;

      host.querySelector("[data-answer-form]").addEventListener("submit", (event) => {
        event.preventDefault();
        const input = event.currentTarget.elements.answer;
        const feedback = host.querySelector("[data-feedback]");
        if (normalizeAnswer(input.value) !== normalizeAnswer(clue.answer)) {
          feedback.className = "feedback is-error";
          feedback.textContent = "答案還不對。再觀察一次現場，或打開一層提示。";
          input.select();
          return;
        }
        completedAnswers.push(clue.answer);
        if (currentIndex < scenario.clues.length - 1) {
          feedback.className = "feedback is-success";
          feedback.innerHTML = `答對了，取得數字 <strong>${escapeHtml(clue.answer)}</strong>。<button class="button-primary next-clue" type="button" data-next-clue>前往下一關</button>`;
          input.disabled = true;
          event.currentTarget.querySelector("button").disabled = true;
          feedback.querySelector("[data-next-clue]").addEventListener("click", () => {
            currentIndex += 1;
            visibleHints = 0;
            draw();
          });
          return;
        }
        host.innerHTML = `<section class="completion-panel" aria-live="polite">
          <p class="eyebrow">挑戰完成</p><h3>你解開了 ${escapeHtml(scenario.title)}</h3>
          <p>取得的數字是 ${completedAnswers.map(escapeHtml).join("、")}，組合後的最終密碼：</p>
          <p class="final-code">${escapeHtml(scenario.finalCode)}</p>
          <button class="button-secondary" type="button" data-replay>再玩一次</button>
        </section>`;
        host.querySelector("[data-replay]").addEventListener("click", () => renderPlayerMode(scenario, host));
      });
      host.querySelector("[data-show-hint]").addEventListener("click", () => {
        visibleHints = Math.min(visibleHints + 1, clue.hints.length);
        draw();
      });
      host.querySelector("[data-reset-game]").addEventListener("click", () => renderPlayerMode(scenario, host));
    };
    draw();
  }

  function renderUniquenessDemo(demo) {
    return `<section class="uniqueness-demo" data-uniqueness-demo>
      <div><p class="eyebrow">可操作的規則檢查</p><h3>${escapeHtml(demo.title)}</h3>
      <p>逐一加入線索條件，觀察候選物品如何縮小。只有剩下一個候選物品時，程式才判定為「唯一」。</p></div>
      <fieldset class="constraint-fieldset"><legend>選擇線索條件</legend><div class="constraint-grid">
        ${demo.constraints.map((constraint) => `<label class="constraint-option"><input type="checkbox" value="${escapeHtml(constraint)}"><span>${escapeHtml(constraint)}</span></label>`).join("")}
      </div></fieldset>
      <div class="candidate-grid" data-candidate-grid></div>
      <p class="unique-result" data-unique-result aria-live="polite"></p>
    </section>`;
  }

  function activateUniquenessDemo(host, demo) {
    const demoRoot = host.querySelector("[data-uniqueness-demo]");
    const inputs = [...demoRoot.querySelectorAll('input[type="checkbox"]')];
    const candidateGrid = demoRoot.querySelector("[data-candidate-grid]");
    const result = demoRoot.querySelector("[data-unique-result]");
    const update = () => {
      const selected = inputs.filter((input) => input.checked).map((input) => input.value);
      const matches = demo.candidates.filter((candidate) => selected.every((constraint) => candidate.traits.includes(constraint)));
      candidateGrid.innerHTML = demo.candidates.map((candidate) => {
        const isMatch = matches.some((match) => match.name === candidate.name);
        return `<article class="candidate-card ${isMatch ? "is-match" : "is-excluded"}"><p><strong>${escapeHtml(candidate.name)}</strong></p><p>${candidate.traits.map(escapeHtml).join("・")}</p><span>${isMatch ? "符合目前條件" : "已排除"}</span></article>`;
      }).join("");
      if (selected.length === 0) {
        result.className = "unique-result";
        result.textContent = `尚未加入條件，目前共有 ${matches.length} 個候選物品。`;
      } else if (matches.length > 1) {
        result.className = "unique-result is-warning";
        result.textContent = `仍不唯一：目前還有 ${matches.length} 個候選物品。`;
      } else if (matches.length === 1) {
        result.className = "unique-result is-unique";
        result.textContent = `通過：目前只剩「${matches[0].name}」，條件已能唯一指認物品。`;
      } else {
        result.className = "unique-result is-warning";
        result.textContent = "沒有物品符合全部條件，這條線索也不能使用。";
      }
    };
    inputs.forEach((input) => input.addEventListener("change", update));
    update();
  }

  function renderDeveloperMode(scenario, host) {
    host.innerHTML = `<section class="developer-panel">
      <aside class="note"><strong>開發者視角：</strong>這裡會顯示玩家看不到的物品、答案與驗證依據。</aside>
      <h3>經確認的物品</h3><ul class="scenario-object-list">${scenario.objects.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <h3>關卡與答案來源</h3>${scenario.clues.map((clue) => `<article class="scenario-clue"><h3>第 ${escapeHtml(clue.step)} 關</h3><p>${escapeHtml(clue.prompt)}</p><p class="answer-line"><strong>答案：</strong>${escapeHtml(clue.answer)}<br><strong>驗證：</strong>${escapeHtml(clue.verification)}</p></article>`).join("")}
      ${renderUniquenessDemo(scenario.uniquenessDemo)}
      <p class="note"><strong>最終密碼：</strong>${escapeHtml(scenario.finalCode)}</p>
      <h3>驗證備註</h3><ul>${scenario.validationNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>
    </section>`;
    activateUniquenessDemo(host, scenario.uniquenessDemo);
  }

  function renderScenario(scenario) {
    if (!scenarioContainer) return;
    const initialMode = new URLSearchParams(window.location.search).get("mode") === "developer" ? "developer" : "player";
    scenarioContainer.innerHTML = `<div class="scenario-heading"><div><p class="eyebrow">${escapeHtml(scenario.status)}｜${escapeHtml(scenario.location)}</p><h3>${escapeHtml(scenario.title)}</h3></div></div>
      <p>${escapeHtml(scenario.summary)}</p>
      <div class="mode-switch" role="group" aria-label="切換場景模式"><button type="button" data-mode="player">玩家模式</button><button type="button" data-mode="developer">開發者模式</button></div>
      <div data-mode-content></div>`;
    const content = scenarioContainer.querySelector("[data-mode-content]");
    const buttons = [...scenarioContainer.querySelectorAll("[data-mode]")];
    const setMode = (mode) => {
      buttons.forEach((button) => {
        const active = button.dataset.mode === mode;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      if (mode === "developer") renderDeveloperMode(scenario, content);
      else renderPlayerMode(scenario, content);
      const url = new URL(window.location.href);
      if (mode === "developer") url.searchParams.set("mode", "developer");
      else url.searchParams.delete("mode");
      window.history.replaceState({}, "", url);
    };
    buttons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
    setMode(initialMode);
  }

  fetch(`${root}data/scenarios.json?v=${dataVersion}`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((scenarios) => {
      renderCards(scenarios);
      if (!scenarioContainer) return;
      const targetSlug = scenarioContainer.dataset.scenarioSlug;
      const scenario = scenarios.find((item) => item.slug === targetSlug);
      if (!scenario) throw new Error(`找不到場景：${targetSlug}`);
      renderScenario(scenario);
    })
    .catch((error) => {
      const message = '<p class="load-error">場景資料載入失敗，請稍後重試。</p>';
      if (cardsContainer) cardsContainer.innerHTML = message;
      if (scenarioContainer) scenarioContainer.innerHTML = message;
      console.error("Failed to load scenarios:", error);
    });
})();
