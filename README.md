# RoomQuest 開發筆記

這是「第九週作業：建立自己的 `AGENTS.md`」所製作的小型文件網站。

- 網頁：<https://lyixuan0718.github.io/roomquest-project-hub/>
- Repository：<https://github.com/lyixuan0718/roomquest-project-hub>
- 作者：B1228010 長庚 AI 四 李怡萱

## 作業重點

網站不是只有一張完成後就不再變動的頁面。`AGENTS.md` 定義了專案目的、語氣、資訊架構、頁面格式、檔名、資料來源、視覺規則與完成前檢查，讓 AI 可以依照相同方式繼續增加開發筆記和場景案例。

實際網站用以下機制對應規則：

1. `templates/content-page.html` 提供新頁面的固定骨架。
2. `data/navigation.json` 同時管理側欄與首頁內容索引。
3. `data/scenarios.json` 集中保存場景、線索、提示與驗證案例，避免重複抄寫。
4. 場景頁共用「玩家模式／開發者模式」，可直接試玩，也能操作唯一性檢查。
5. 兩支驗證程式會檢查頁面結構、場景格式與唯一性資料。

## 目前頁面

- 開始閱讀：網站目的、內容地圖與延伸方式。
- 專案概覽：RoomQuest 的動機、核心原則與 MVP。
- 系統流程：主持人模式、玩家模式與資料流。
- 驗證規則：Python 檢查項目、修改迴圈與限制。
- 案例：教室 B305：由 JSON 載入的三關示意案例。
- 案例：圖書館閱讀區：沿用相同規則建立的第二個示意案例。

## 專案結構

```text
.
├── AGENTS.md
├── README.md
├── index.html
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── main.js
│       └── scenario.js
├── data/
│   ├── navigation.json
│   └── scenarios.json
├── docs/scenario-template.md
├── pages/
│   ├── project-overview.html
│   ├── system-workflow.html
│   ├── validation-rules.html
│   ├── scene-case-b305.html
│   └── scene-case-library.html
├── templates/content-page.html
└── scripts/
    ├── validate_site.py
    └── validate_scenarios.py
```

## 新增一般內容頁

1. 複製 `templates/content-page.html` 到 `pages/<slug>.html`。
2. 替換範本內所有 `TODO`，並設定唯一的 `data-page`。
3. 在 `data/navigation.json` 加入頁面資料。
4. 執行檢查並在瀏覽器預覽。

詳細規則請閱讀 [AGENTS.md](AGENTS.md)。

## 本機檢查

```bash
python3 scripts/validate_site.py
python3 scripts/validate_scenarios.py
node --check assets/js/main.js
node --check assets/js/scenario.js
python3 -m http.server 8000
```

打開 <http://localhost:8000> 即可預覽。`main` branch 更新後，GitHub Pages 會自動部署公開網站。
