# 靜態預測頁（GitHub Pages）

此目錄為對外靜態預測站原始碼，部署目標：[taiwan-lottery-page](https://github.com/hikkijojo/taiwan-lottery-page)。

## 檔案

| 檔案 | 說明 |
|------|------|
| `index.html` | 手機版頁面殼 |
| `assets/style.css` | 樣式 |
| `assets/app.js` | 讀取 JSON 並渲染 |
| `predictions.json` | 執行時產生（已 gitignore） |

## 更新流程

增量同步完成後，後端自動：

1. 寫入 `predictions.json`（三彩種 pending + 近三期 evaluated）
2. 若設定有效 `GITHUB_TOKEN`，推送整個目錄至 GitHub Pages 倉庫

手動匯出：`.\scripts\export-static-page.ps1` 或 `docker compose exec api ./export-static-page`

## 本地預覽

```bash
cd backend/static-page
npx serve .
# 需先有一次 predictions.json（執行增量同步或種子還原）
```

## GitHub Pages 設定

在 `taiwan-lottery-page` 倉庫：Settings → Pages → Deploy from branch `main` / root。
