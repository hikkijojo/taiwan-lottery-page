# 靜態預測頁（GitHub Pages）

對外純靜態站原始碼由 **`static-page-ui/`** Vue 專案建置輸出至此目錄；部署目標：[taiwan-lottery-page](https://github.com/hikkijojo/taiwan-lottery-page)。

## 檔案

| 檔案 | 說明 |
|------|------|
| `index.html` | Vue build 產物 |
| `assets/*` | JS / CSS（hash 檔名） |
| `predictions.json` | 執行時產生（已 gitignore） |
| `nginx.preview.conf` | Docker 本地預覽用 |
| `README.md` | 本說明 |

> **原始碼請改 `static-page-ui/`**，勿直接編輯 build 後的 `assets/index-*.js`。

## 建置

```powershell
.\scripts\build-static-page-ui.ps1
```

## 更新 JSON

增量同步完成後，後端自動：

1. 寫入 `predictions.json`
2. 若設定有效 `GITHUB_TOKEN`，推送整個目錄至 GitHub Pages 倉庫

手動：`.\scripts\export-static-page.ps1`

## 本地預覽

```powershell
docker compose up -d static-preview
# http://localhost:38581
```

開發熱更新：`cd static-page-ui && npm run dev` → http://localhost:38582

## GitHub Pages

Settings → Pages → branch `main` / root
