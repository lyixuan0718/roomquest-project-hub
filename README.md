# RoomQuest Project Hub

RoomQuest 是一個生成式 AI 實境解謎專案概念：主持人提供並確認真實場景資料，AI 規劃關卡與線索，Python 負責檢查可驗證的規則，最後再由主持人核准後交給玩家。

這個 repository 是 RoomQuest 的公開專案網站，也是「建立自己的 `AGENTS.md`」課堂作業成果。網站目前呈現專案概念、工作流程、示意案例與開發方向；完整 RoomQuest 遊戲仍在規劃與開發中。

## Website

- GitHub repository: <https://github.com/lyixuan0718/roomquest-project-hub>
- GitHub Pages: <https://lyixuan0718.github.io/roomquest-project-hub/>

## Features

- 響應式單頁專案網站
- 主持人／玩家流程切換
- 由 `data/scenarios.json` 驅動的場景案例
- 場景資料驗證腳本
- 可供 AI 持續維護的 `AGENTS.md`
- 無需建置工具，可直接部署到 GitHub Pages

## Project structure

```text
.
├── AGENTS.md
├── README.md
├── index.html
├── .nojekyll
├── assets/
│   ├── css/styles.css
│   └── js/main.js
├── data/scenarios.json
├── docs/scenario-template.md
└── scripts/validate_scenarios.py
```

## Local preview

```bash
python3 scripts/validate_scenarios.py
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Add a scenario

1. Read `AGENTS.md` and `docs/scenario-template.md`.
2. Add a new object to `data/scenarios.json`.
3. Run the validation script.
4. Preview the page at desktop and mobile widths.

## Deployment

GitHub Pages settings:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

## Author

李怡萱｜長庚大學人工智慧學系
