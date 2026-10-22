# 繁星 AI 錄音｜2026-10-23 開發與部署狀態

## 最新結論
- **正式版尚未部署**；GitHub PR #1 為 Draft，未合併到 main。
- 僅部署獨立無會員資料測試站：https://starry-recorder-preview.yukidu.workers.dev/
- Preview Workers 版本：`9f479b66-ff38-41ec-99e3-d623183ee9af`；回復碼 `SR-PREVIEW-20261023-9F479B66`。詳見 `docs/DEPLOYMENTS.md`。
- 獨立 Cloudflare D1 `starry-recorder-preview-db` 及私人 R2 `starry-recorder-preview-media` 已建立並驗證，不屬於正式環境。

## 程式進展與 GitHub 驗證
- 核心領域規則：單筆錄音 100 分鐘、每課最多 10 筆、單檔 100MB、每筆 50 張照片、10 秒影片、免費轉錄及訂閱方案額度。
- 客戶錄音狀態機：100 分鐘時結束、暫停、續錄、意外中斷、必須先保存片段才能標記完成。**尚未接 Android/iOS 原生音訊 API**。
- M4A 信任邊界：`verifyMediaProbe` 驗證伺服端 ffprobe 回傳的 AAC、16kHz、單聲道、約 64kbps、時長及檔案大小，不採信檔名或客戶填的 MIME；**正式轉檔服務及服務端執行仍未完成**。
- AI 回答驗證：限制只有授權來源 ID 可引用，無來源回覆拒答；**尚未接 Cloudflare Workers AI／OCR 與安全檢索**。
- 獨立會員 API：Starry ID 未正式整合前所有私人 API、上傳、分享預設拒絕。
- 最新整套 GitHub 檢查成功：https://github.com/yukidu/starry-recorder/actions/runs/39866215074
  - 31 項核心程式測試、2 項真實 FFmpeg／ffprobe 音檔測試、5 項 API 隔離測試、4 項 D1 SQLite 測試、4 項測試 Worker 測試，**合計 46 項**。
  - React 前端 build、Worker TypeScript 型別檢查、Wrangler dry-run 均成功。
  - 公網 HTTPS 測試站 smoke test：https://github.com/yukidu/starry-recorder/actions/runs/39866215085

## 重要依賴
- Starry ID v2 仍未啟用正式跨 App 登入，已於 https://github.com/yukidu/Satrry-ID-Center/issues/23 開啟整合工作。
- 真實雲端音檔轉檔與逐字稿、講者辨識、照片 OCR 與安全搜尋、Android/iOS 可靠背景錄音、Apple/Google/Web 月繳年繳等，全部未完成。
- 全球商店發布、條款、上架實機測試及 2,000 會員負載測試尚未完成。

## 安全規範
- `record.starry.phd` 尚未啟用；不得對使用者宣稱錄音 App 已上線。
- Preview Worker 只提供公開資訊，禁用登入、上傳、付款及私人 API。
- 正式釋出必須符合 GitHub main 最新程式、CI 成功、Cloudflare Production Deploy 成功、正式網域驗證成功與功能安全驗收。
