# 2026-10-23｜上線前實際狀態

**尚未正式部署。** 使用者已授權正式部署準備，但安全門檻不允許發布未完成功能。

## 已確認
- Repo: https://github.com/yukidu/starry-recorder
- Draft PR #1: https://github.com/yukidu/starry-recorder/pull/1，**尚未合併 main**。
- PR head `52b47f691c00465e5f77f301e49b4e8cd872e24b` 的 GitHub Actions 驗證成功：https://github.com/yukidu/starry-recorder/actions/runs/39850198972
- 最新 GitHub Actions 已加上 Worker 型別檢查、Cloudflare 預覽設定 dry-run，並且**全部通過**：https://github.com/yukidu/starry-recorder/actions/runs/39860587291 。這只是編譯與模擬驗證，**沒有進行真正 Worker 部署，也未涵蓋端到端驗證、原生錄音或正式付費**。

## 已建立的 Cloudflare 預覽資源（獨立且無正式會員資料）
- Account: `611de84062006fe96fafd0cf157f2ec0`
- D1: `starry-recorder-preview-db`，UUID `b13dc8f0-eb02-42fa-9685-c99d36d23ea7`。
- D1: `migrations/0001_init.sql` 已於預覽資料庫套用成功，並已確認 9 張業務資料表。
- R2: `starry-recorder-preview-media`，APAC 儲存，私人存取（無自訂網域、公開 r2.dev 連結未啟用）。
- **尚未建立正式產品 Worker，沒有部署網頁，沒有開啟 `record.starry.phd` 網域。**

## 尚未完成的正式門檻
- 實際 Starry ID 及會員權限端到端串接，跨會員私人資料隔離測試。
- M4A/AAC 16kHz、64kbps 的真實轉碼與伺服端音訊驗證；不接受只修改副檔名。
- 真實雲端錄音播放、AI 逐字稿、50 張照片 OCR、資料引用式 AI 搜尋與長檔處理。
- Android/iOS 原生背景錄音、來電中斷復原與實機驗收。
- 訂閱月年繳、Apple/Google/Web 收據與續費、退款、跨地區規範及個資法務。
- 完整 Worker 型別檢查、安全與負載測試、全量 CI/Release Gate。
- 主分支合併、Cloudflare Production Deploy、正式網址驗證及部署還原碼。

## 安全原則
測試環境沒有公開會員檔案；不允許在未完成授權驗證時公開音訊 API。
即使獲得上線授權，只能在全部必需驗收通過後稱為「正式上線」。
