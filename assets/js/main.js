"use strict";

(() => {
  const body = document.body;
  const root = body.dataset.root || "";
  const currentPage = body.dataset.page || "";
  const header = document.querySelector("[data-site-header]");
  const sidebar = document.querySelector("[data-sidebar]");
  const footer = document.querySelector("[data-site-footer]");
  const pageIndex = document.querySelector("[data-page-index]");

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const pageHref = (path) => `${root}${path}`;

  function renderHeader() {
    if (!header) return;

    header.innerHTML = `
      <div class="header-inner">
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-sidebar" aria-label="開啟導覽">☰</button>
        <a class="site-name" href="${pageHref("index.html")}">RoomQuest 開發筆記<small>李怡萱</small></a>
        <a class="header-link" href="https://github.com/lyixuan0718/roomquest-project-hub">GitHub Repository</a>
      </div>`;

    const menuButton = header.querySelector(".menu-button");
    menuButton?.addEventListener("click", () => {
      const isOpen = sidebar?.classList.toggle("is-open") || false;
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "關閉導覽" : "開啟導覽");
    });
  }

  function renderSidebar(pages) {
    if (!sidebar) return;

    sidebar.id = "site-sidebar";
    const groups = new Map();
    pages.forEach((page) => {
      if (!groups.has(page.group)) groups.set(page.group, []);
      groups.get(page.group).push(page);
    });

    sidebar.innerHTML = Array.from(groups.entries()).map(([group, entries]) => `
      <nav class="sidebar-group" aria-label="${escapeHtml(group)}">
        <p class="sidebar-title">${escapeHtml(group)}</p>
        <ul class="sidebar-list">
          ${entries.map((page) => `
            <li><a href="${pageHref(page.path)}"${page.id === currentPage ? ' aria-current="page"' : ""}>${escapeHtml(page.title)}</a></li>
          `).join("")}
        </ul>
      </nav>`).join("");

    sidebar.addEventListener("click", (event) => {
      if (event.target.closest("a") && window.matchMedia("(max-width: 800px)").matches) {
        sidebar.classList.remove("is-open");
        const menuButton = header?.querySelector(".menu-button");
        menuButton?.setAttribute("aria-expanded", "false");
        menuButton?.setAttribute("aria-label", "開啟導覽");
      }
    });
  }

  function renderPageIndex(pages) {
    if (!pageIndex) return;
    const entries = pages.filter((page) => page.id !== "home");
    pageIndex.innerHTML = `
      <ul class="page-index-list">
        ${entries.map((page) => `
          <li>
            <a href="${pageHref(page.path)}">
              <strong>${escapeHtml(page.title)}</strong>
              <span>${escapeHtml(page.summary)}</span>
            </a>
          </li>`).join("")}
      </ul>`;
  }

  function renderFooter() {
    if (!footer) return;
    footer.innerHTML = "B1228010 長庚 AI 四 李怡萱｜本網站依 AGENTS.md 的共用規則維護";
  }

  async function loadNavigation() {
    try {
      const response = await fetch(`${root}data/navigation.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const pages = await response.json();
      if (!Array.isArray(pages)) throw new Error("navigation.json 必須是陣列");
      renderSidebar(pages);
      renderPageIndex(pages);
    } catch (error) {
      const message = "導覽資料載入失敗，請直接回到首頁或稍後重試。";
      if (sidebar) sidebar.innerHTML = `<p class="load-error">${message}</p>`;
      if (pageIndex) pageIndex.innerHTML = `<p class="load-error">${message}</p>`;
      console.error("Failed to load navigation:", error);
    }
  }

  renderHeader();
  renderFooter();
  loadNavigation();
})();
