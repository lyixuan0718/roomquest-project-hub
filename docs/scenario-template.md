# RoomQuest scenario template

新增場景前，先確認所有內容都來自實際觀察或主持人確認，不要讓 AI 自行補齊不存在的物品。

## Required information

- 場景名稱：
- 場景類型：
- 案例狀態：示意案例／測試中／已驗證
- 一句話摘要：
- 案例頁路徑：
- 最終密碼：
- 經確認的物品與屬性：
- 不可碰觸或會變動的物品：

## Clue template

每一關都要填寫：

1. `step`：從 1 開始的連續整數。
2. `prompt`：玩家實際看到的線索。
3. `answer`：數字、選項或短詞。
4. `hints`：由模糊到明確的提示，至少一則。
5. `verification`：答案如何從已確認的場景資料取得。

## Uniqueness demo

每個案例要選一個容易混淆的物品組合，列出目標物品、可逐步加入的條件，以及至少兩個候選物品的特徵。完整條件必須剛好只留下目標物品。

## Validation questions

- 線索使用的物品是否存在於場景資料？
- 條件是否只指向一個物品？
- 答案是否固定，不會因時間或移動而改變？
- 玩家是否只需要觀察、計數、閱讀或執行核准動作？
- 是否清楚標示案例目前是真實測試還是示意內容？

## JSON example

```json
{
  "slug": "library-reading-area",
  "title": "圖書館閱讀區",
  "status": "測試中",
  "summary": "使用書架標籤與固定座位編號設計三關解謎。",
  "location": "圖書館",
  "pagePath": "pages/scene-case-library.html",
  "finalCode": "123",
  "objects": ["物品 A", "物品 B"],
  "clues": [
    {
      "step": 1,
      "prompt": "第一關線索",
      "answer": "1",
      "hints": ["較模糊的提示", "較明確的提示"],
      "verification": "答案來源說明"
    }
  ],
  "uniquenessDemo": {
    "title": "如何唯一指向物品 A？",
    "target": "物品 A",
    "constraints": ["紅色", "可以裝水"],
    "candidates": [
      {"name": "物品 A", "traits": ["紅色", "可以裝水"]},
      {"name": "物品 B", "traits": ["紅色", "可以裝東西"]}
    ]
  },
  "validationNotes": ["驗證紀錄"]
}
```

新增後執行：

```bash
python3 scripts/validate_scenarios.py
python3 -m http.server 8000
```
