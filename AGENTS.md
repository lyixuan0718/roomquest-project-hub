# RoomQuest Project Hub - AI Collaboration Guide

## 1. Project purpose

This repository is the public project hub for **RoomQuest**, a generative-AI concept that turns a confirmed real-world scene into a small puzzle game.

The website must help visitors understand:

1. What RoomQuest is and why it exists.
2. How the host workflow differs from the player workflow.
3. Why the project uses the principle "AI creates, Python verifies".
4. Which features are completed, planned, or only future ideas.
5. How a new scene case can be added without redesigning the site.

The current website is a **concept and development showcase**. Do not describe the full RoomQuest application as completed unless working code and evidence have been added to this repository.

## 2. Audience and language

- Primary audience: course instructors, classmates, internship reviewers, and portfolio visitors.
- Default language: Traditional Chinese (`zh-Hant`).
- English technical terms may appear when they improve precision, such as JSON, Planning, Reflection, Tool Use, and Human-in-the-loop.
- Explain unfamiliar technical terms in plain language on first use.

## 3. Source of truth

- `index.html`: page structure and editorial copy.
- `data/scenarios.json`: scene-case content rendered by JavaScript.
- `assets/css/styles.css`: visual system and responsive layout.
- `assets/js/main.js`: navigation, workflow tabs, and scenario rendering.
- `docs/scenario-template.md`: human-readable instructions for adding a scene.
- `scripts/validate_scenarios.py`: machine-checkable scenario validation.

Never duplicate scenario data directly inside `index.html`. Add or update cases in `data/scenarios.json`.

## 4. Project structure

```text
roomquest-project-hub/
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

Create `assets/images/` only when an actual image is added. Do not add empty folders.

## 5. Visual rules

- Overall mood: quiet, exploratory, trustworthy, and slightly mysterious.
- Use the existing design tokens in `:root`; do not scatter new literal colors throughout the stylesheet.
- Use the four workflow identities consistently:
  - AI: purple.
  - Python verification: green.
  - Human action: amber.
  - Data or interface state: blue.
- Keep body text highly readable and avoid excessive animation.
- Maintain responsive behavior down to 320 px wide.
- Preserve visible keyboard focus and support `prefers-reduced-motion`.
- Do not add external UI frameworks for a small change.

## 6. HTML, CSS, and JavaScript responsibilities

- HTML contains semantic structure and stable editorial content.
- CSS owns layout, colors, typography, and responsive behavior.
- JavaScript owns interaction and data rendering only.
- Do not generate large blocks of HTML strings outside the scenario renderer.
- Avoid inline styles and inline event handlers.
- Every interactive control must be usable by keyboard.
- Every section linked from the navigation must have a stable `id`.

## 7. Scenario schema

Every object in `data/scenarios.json` must contain:

```json
{
  "slug": "classroom-b305",
  "title": "教室 B305",
  "status": "示意案例",
  "summary": "一句話描述場景與玩法。",
  "location": "教室",
  "finalCode": "375",
  "objects": ["公告欄", "藍色椅子", "紅色水壺"],
  "clues": [
    {
      "step": 1,
      "prompt": "玩家看到的線索。",
      "answer": "3",
      "verification": "答案如何由已確認的場景資料取得。"
    }
  ],
  "validationNotes": ["Python 擋下或檢查了什麼。"]
}
```

Additional rules:

- `slug` uses lowercase ASCII letters, numbers, and hyphens only.
- `slug` values must be unique.
- `status` must be one of `示意案例`, `測試中`, or `已驗證`.
- `clues` must contain at least one item and use consecutive steps starting at 1.
- A case marked `已驗證` must have real play-test evidence documented in the repository.
- Never invent test results, completion rates, or model performance.

## 8. Adding a new scenario

1. Read this file and `docs/scenario-template.md`.
2. Collect only confirmed scene facts.
3. Add one object to the JSON array in `data/scenarios.json`.
4. Use a unique slug and an honest status.
5. Run `python3 scripts/validate_scenarios.py`.
6. Start a local server with `python3 -m http.server 8000`.
7. Open the homepage and check the new card and detail panel.
8. Test at desktop and mobile widths.
9. Confirm that existing scenarios and navigation still work.

## 9. Adding a new page or section

Prefer adding content to the existing page when it fits the current information architecture.

Create a new page only when the content has a distinct purpose and enough substance, such as a detailed development log or a complete technical report. When adding a page:

- Use lowercase English filenames with hyphens.
- Reuse the existing header, footer, tokens, and typography.
- Add a clear link from `index.html`.
- Add a return link to the homepage.
- Update `README.md` and this file if the project structure changes.

## 10. Content integrity

- Clearly distinguish `已完成`, `開發中`, and `未來延伸`.
- Do not present example clues as verified gameplay unless they were tested.
- Do not claim that AI guarantees a puzzle is solvable.
- Describe Python checks as operating on host-confirmed scene data.
- Do not publish private room photos, personal information, API keys, tokens, or credentials.
- Do not overwrite unrelated content when making a focused change.

## 11. Validation checklist

Before considering a change complete:

1. `python3 scripts/validate_scenarios.py` passes.
2. `node --check assets/js/main.js` passes.
3. `python3 -m http.server 8000` serves the site without missing files.
4. Browser console shows no JavaScript errors.
5. Navigation links reach the correct sections.
6. Workflow tabs work with mouse and keyboard.
7. Scenario cards and detail view render from JSON.
8. Layout remains readable at 1440 px, 768 px, and 375 px widths.
9. No unfinished placeholder text, fake links, or secret values remain.
10. README and AGENTS.md still match the actual repository.

## 12. Git and deployment rules

- Keep `index.html` at the repository root for GitHub Pages.
- Use lowercase English filenames without spaces.
- Never commit secrets or local environment files.
- Keep commits focused and describe the user-visible change.
- The deployment target is GitHub Pages from the `main` branch and `/ (root)` folder.

## 13. Definition of done

A website change is done only when the requested content is visible, the reusable rules remain valid, all automated checks pass, and the page has been visually inspected at desktop and mobile widths.
