# RoomQuest scenario template

新增場景前，先確認所有內容都來自實際觀察或主持人確認，不要讓 AI 自行補齊不存在的物品。

## Required information

- 場景名稱：
- 場景類型：
- 案例狀態：示意案例／測試中／已驗證
- 一句話摘要：
- 最終密碼：
- 經確認的物品與屬性：
- 不可碰觸或會變動的物品：

## Clue template

每一關都要填寫：

1. `step`：從 1 開始的連續整數。
2. `prompt`：玩家實際看到的線索。
3. `answer`：數字、選項或短詞。
4. `verification`：答案如何從已確認的場景資料取得。

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
  "finalCode": "123",
  "objects": ["物品 A", "物品 B"],
  "clues": [
    {
      "step": 1,
      "prompt": "第一關線索",
      "answer": "1",
      "verification": "答案來源說明"
    }
  ],
  "validationNotes": ["驗證紀錄"]
}
```

新增後執行：

```bash
python3 scripts/validate_scenarios.py
python3 -m http.server 8000
```
