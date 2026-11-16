# RoomQuest 開發筆記 — AI 協作規則

## 1. 專案目的

這個 repository 是 **RoomQuest 開發筆記**，一個可持續增加內容的小型文件網站。

網站不是 RoomQuest 完整遊戲，也不是產品宣傳頁。它的任務是記錄：

1. RoomQuest 想解決的問題與 MVP 範圍。
2. 主持人模式、玩家模式與資料流。
3. Python 驗證規則及風險處理方式。
4. 場景案例、測試紀錄與之後的開發決策。
5. 這個專案如何透過共用規則繼續新增頁面。

目前所有「完成」、「測試中」與「未來規劃」都必須如實標示，不可以把概念稿寫成已完成產品。

## 2. 讀者與語言

- 主要讀者：課程老師、同學、未來接手專案的自己，以及作品集訪客。
- 預設語言：繁體中文（`zh-Hant`）。
- JSON、Planning、Reflection、Human-in-the-loop 等專有名詞可以保留英文，但第一次出現時要附上中文說明。
- 文案要像學生整理開發筆記：直接、具體、可以查證。
- 不使用廣告口號、誇大成果或空泛的「智慧、無縫、創新體驗」等文字。

## 3. 網站資訊架構

首頁是內容入口，不承擔所有細節。正式內容放在 `pages/`：

| page id | 檔案 | 用途 |
| --- | --- | --- |
| `home` | `index.html` | 網站說明、內容索引、如何延伸 |
| `project-overview` | `pages/project-overview.html` | 專案動機、核心原則與 MVP |
| `system-workflow` | `pages/system-workflow.html` | 主持人／玩家流程與資料流 |
| `scene-case-b305` | `pages/scene-case-b305.html` | 由 JSON 產生的教室案例 |
| `scene-case-library` | `pages/scene-case-library.html` | 沿用相同規則產生的圖書館案例 |
| `validation-rules` | `pages/validation-rules.html` | Python 可檢查的規則與限制 |

新增一般內容頁時，從 `templates/content-page.html` 複製；不要從現有頁面任意拼湊。

## 4. 檔案結構與責任

```text
roomquest-project-hub/
├── AGENTS.md
├── README.md
├── index.html
├── .nojekyll
├── assets/
│   ├── css/styles.css       # 全站共用排版與響應式規則
│   └── js/
│       ├── main.js          # 共用側欄、手機選單、內容索引
│       └── scenario.js      # 場景卡、玩家模式與開發者驗證模式
├── data/
│   ├── navigation.json      # 網站導覽與首頁內容索引的唯一來源
│   └── scenarios.json       # 場景案例資料
├── docs/
│   └── scenario-template.md
├── pages/
│   ├── project-overview.html
│   ├── system-workflow.html
│   ├── scene-case-b305.html
│   ├── scene-case-library.html
│   └── validation-rules.html
├── templates/
│   └── content-page.html
└── scripts/
    ├── validate_site.py
    └── validate_scenarios.py
```

規則：

- 頁面內容寫在 HTML；共用視覺只寫在 `assets/css/styles.css`。
- 導覽標題、順序、摘要與路徑只寫在 `data/navigation.json`。
- 場景事實、線索與答案只寫在 `data/scenarios.json`。
- 不把同一份場景資料重新複製到 HTML。
- 不建立空資料夾；確定有檔案時才新增目錄。

## 5. 頁面格式

每一個正式頁面必須：

1. 使用小寫英文與連字號命名，例如 `system-workflow.html`。
2. 放在 `pages/`，首頁除外。
3. 在 `<body>` 設定：
   - `data-root="../"`
   - `data-page="與 navigation.json 相同的 page id"`
4. 包含共用元素：
   - 跳至主要內容連結。
   - `data-site-header`。
   - `data-sidebar`。
   - `main.docs-main#main-content`。
   - `article.doc-page`。
   - `data-site-footer`。
5. 在 `article` 內依序包含：
   - 頁面分類與更新日期。
   - 唯一一個 `h1`。
   - 一段 `.lead` 摘要。
   - 兩個以上有 `h2` 的內容區段。
6. 載入共用 `assets/js/main.js`。

首頁的場景卡與案例頁的互動都必須讀取 `data/scenarios.json`，不得在 HTML 另外寫一份案例資料。

`templates/content-page.html` 是頁面骨架的唯一範本。若共用結構改變，先更新範本，再同步既有頁面。

## 6. 新增頁面的流程

1. 先確認新內容與既有頁面的目的不同；能補進原頁面時不要濫建新頁。
2. 複製 `templates/content-page.html` 到 `pages/<slug>.html`。
3. 替換所有 `TODO`，並設定唯一的 `data-page`。
4. 在 `data/navigation.json` 新增一筆：
   ```json
   {
     "id": "new-page",
     "title": "導覽中顯示的名稱",
     "summary": "首頁索引顯示的一句話摘要",
     "path": "pages/new-page.html",
     "group": "開發筆記"
   }
   ```
5. 確認頁面中的事實有資料來源，狀態標示誠實。
6. 執行：
   ```bash
   python3 scripts/validate_site.py
   python3 scripts/validate_scenarios.py
   node --check assets/js/main.js
   ```
7. 使用 HTTP server 預覽首頁、新頁面、側欄與手機選單。
8. 更新 README 的頁面清單；若規則或資料結構改變，也要更新本檔。

## 7. 新增場景案例的流程

1. 依照 `docs/scenario-template.md` 收集主持人確認過的資料。
2. 在 `data/scenarios.json` 新增物件，`slug` 必須唯一，並填寫 `pagePath`、每關 `hints` 與 `uniquenessDemo`。
3. 從內容頁範本建立 `pages/scene-case-<slug>.html`。
4. 在頁面放置：
   ```html
   <div data-scenario-view data-scenario-slug="<slug>"></div>
   <script src="../assets/js/scenario.js" defer></script>
   ```
5. 把頁面加入 `data/navigation.json`。
6. 執行兩支 Python 驗證器並實際預覽。

每個案例頁必須提供兩種視角：

- `玩家模式`：一次顯示一關，支援答案輸入、分層提示、進度與通關結果，不得顯示答案或完整物品清單。
- `開發者模式`：顯示物品、答案來源、驗證備註，並以可操作的條件篩選示範唯一性檢查。

案例狀態只能使用：

- `示意案例`：尚未實際遊玩。
- `測試中`：已開始測試，但仍可能修改。
- `已驗證`：repository 內必須有實際測試紀錄。

## 8. 視覺規則

本網站是文件網站，不是科技產品 Landing Page。

- 使用簡單的文件排版：左側導覽、主要閱讀欄、標題、段落、表格、提示框。
- 主要色彩為白、淺灰、深灰與低彩度藍色。
- 陰影只用於手機導覽層；一般內容不使用大面積陰影。
- 圓角最大 6px，不使用膠囊形按鈕。
- 不使用漸層、發光、玻璃效果、抽象 AI 插圖、儀表板裝飾或巨大標語。
- 不用英文大寫文字當裝飾；英文只用於必要技術名詞、檔名與程式碼。
- 內文寬度要適合閱讀；桌機與手機都不可出現水平捲動。
- 表格在窄螢幕可水平捲動，但頁面本身不可溢出。
- 所有連結與按鈕要有清楚的鍵盤焦點。
- 尊重 `prefers-reduced-motion`；本專案原則上不需要動畫。
- 互動必須用來說明 RoomQuest 的流程或驗證規則，不加入只有裝飾效果、按了沒有實際意義的控制項。

## 9. 內容誠信

- 明確區分 `已完成`、`進行中`、`未來規劃`。
- 不宣稱 AI 能保證謎題可解。
- Python 唯一性檢查只涵蓋主持人已確認的場景資料。
- 不捏造遊玩人數、準確率、完成率或模型比較結果。
- 不公開私人房間照片、個資、API key、token 或帳號資訊。
- 修改一個頁面時，不順便重寫無關內容。

## 10. JavaScript 與資料規則

- JavaScript 只負責共用導覽、手機選單、JSON 顯示、玩家作答與規則示範，不負責產生主要文章內容。
- 所有插入頁面的 JSON 文字必須先做 HTML escaping。
- fetch 路徑要使用 `body.dataset.root`，確保首頁與 `pages/` 都能載入。
- 互動控制必須可用鍵盤操作並提供 ARIA 狀態。
- 不加入大型前端框架；目前原生 HTML、CSS、JavaScript 已足夠。

## 11. 自動檢查

`scripts/validate_site.py` 必須檢查：

- `navigation.json` 格式、id 與 path 唯一。
- 導覽列出的每個檔案存在。
- 每個正式頁面有正確 `data-page`、單一 `h1`、主要內容與共用 script。
- 所有 `pages/*.html` 都被 navigation 收錄。
- 沒有未替換的 `TODO`。
- 範本、AGENTS.md、README 與必要資源存在。

`scripts/validate_scenarios.py` 必須檢查場景 schema、頁面路徑、狀態、slug、提示、關卡順序，以及完整條件是否能唯一指向指定目標。

## 12. 完成定義

修改完成必須同時符合：

1. 使用者要求的內容已出現在正確頁面。
2. `python3 scripts/validate_site.py` 通過。
3. `python3 scripts/validate_scenarios.py` 通過。
4. `node --check assets/js/main.js` 與相關 JS 通過。
5. 首頁、所有修改頁面與 JSON 載入沒有錯誤。
6. 側欄、目前頁面標記與手機選單可操作。
7. 每個場景的玩家模式可從第一關完成至最終密碼，開發者模式的唯一性檢查會隨條件更新。
8. 桌機與手機版可正常閱讀。
9. README、AGENTS.md、範本與實際結構一致。
10. GitHub Pages 已部署，公開網址可以開啟。

