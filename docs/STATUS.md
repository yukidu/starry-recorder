# 繁星 AI 錄音｜2026-10-23 開發與部署狀態

## 最新結論
- **正式版尚未部署**；GitHub PR #1 為 Draft，未合併到 main。
- 僅部署獨立無會員資料測試站：https://starry-recorder-preview.yukidu.workers.dev/
- Preview Workers 最新版本：`0b243243-294b-42af-a6ee-2e09fa3f1816`；本次還原舊版代碼 `SR-PREVIEW-ROLLBACK-7641FCEF`。詳見 `docs/DEPLOYMENTS.md`。
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

## 2026-10-23 下午｜錄音核心與安全測試進度
- 錄音狀態：支援暫停、續錄、中斷狀態及 100 分鐘／10 筆邊界的**核心邏輯**；尚未實作 Android/iOS 真正背景錄音。
- 音檔驗證：新增只接受可信 FFprobe 檢查結果的 M4A/AAC LC、16kHz、單聲道、目標 64kbps、100MB、100 分鐘判斷；尚未建立正式轉檔服務，私人上傳開關維持關閉。
- AI 引用：新增資料來源 ID、時間軸／照片位置及答案來源檢查邏輯；尚未連接真實 AI 模型或搜尋索引。
- API 安全：未設定正式中央身份前，私人課程 API、上傳及分享一律拒絕。
- GitHub Actions：https://github.com/yukidu/starry-recorder/actions/runs/39866215074 已成功，包含 31 項核心單元測試、4 項 SQLite 測試、2 項 FFmpeg 實體音檔測試、5 項 Worker API 安全測試、前端 build、Cloudflare Worker TypeScript 型別檢查和 dry-run；另有 4 項測試頁測試通過。公開 Preview 站 HTTPS smoke test 成功：https://github.com/yukidu/starry-recorder/actions/runs/39866215085 。
- Preview 站：https://starry-recorder-preview.yukidu.workers.dev/ ，僅有唯讀進度頁，不開放會員登入、音檔、AI 或付款。
- **Production 尚未部署**。未合併 Draft PR #1；請勿將這些核心邏輯或測試頁當成可使用的完整錄音 App。

## 2026-10-23 下午｜續建成果（尚未 Production）

- 新增以會員、用量類別、付費期分開計算的 AI 額度台帳，原子扣款與重試防重複；免費 30 分鐘一生一次。已通過核心及 SQLite 測試。
- Preview D1 已成功套用 `0002_quota_indices.sql` 和 `0003_retention_fields.sql`，已確認專用測試資料庫內仍是 0 位會員。
- 180 天保留期：實作重要課程優先及最近使用排序的**刪除預覽**，尚未加入實際刪檔程式。
- 新增會員自己才可標記重要課程、更新最近使用時間的資料操作及測試。
- Cloudflare 測試站狀態頁更新，已驗證：https://github.com/yukidu/starry-recorder/actions/runs/39921154025 。
- 最新 GitHub CI：https://github.com/yukidu/starry-recorder/actions/runs/39921154032 通過；Draft PR #1 尚未合併；正式網站與原生 Android/iOS App 均未上線。

## 2026-10-23｜課程管理後端模組與跨會員隔離測試

- 新增 `src/course-service.ts`，課程建立、列表、修改名稱、重要課程保護、最近查看時間皆綁定可信後端身份。已接入 `src/worker.ts`。
- 新增兩位**模擬會員**簽章 JWT 的後端整合測試；會員 A 不能修改會員 B 的課程、無效簽章拒絕、功能開關拒絕。
- 新增 D1 相容 SQLite 的實際資料隔離測試；未變更正式資料庫。
- GitHub Actions 驗證：https://github.com/yukidu/starry-recorder/actions/runs/39922523322 成功。
- **仍未啟用真實 Starry ID 登入**，上述 API 所有私人功能在測試部署維持關閉。
- Cloudflare Preview Worker 更新狀態頁；部署版本 `0b243243-294b-42af-a6ee-2e09fa3f1816`，回復舊版代碼 `SR-PREVIEW-ROLLBACK-7641FCEF`。

## 2026-10-23 下午｜最新課程管理與上線安全關卡

- 完成 `src/course-service.ts`：課程新增、列表、改名、保護及最近使用時間全部限定已驗證擁有者；新的正向 API 測試利用短效 RS256 簽章模擬兩個不同會員，驗證跨會員不能讀寫、偽造 JWT 拒絕。
- 實際 SQLite 測試證明已刪課程不可改名、會員 A 無法修改會員 B 的課程。
- 新增 `tsconfig.web.json`，React/TypeScript 網頁編譯執行更嚴格型別檢查。
- 新增 `release-manifest.json` 與 `scripts/release-gate.mjs`：在登入、媒體處理、原生錄音、AI、訂閱、法務與負載等關卡完成前，`npm run cf:deploy` 強制失敗，**預設拒絕正式部署**。
- GitHub Actions 最新完整驗證成功：https://github.com/yukidu/starry-recorder/actions/runs/39923108807 。
- Cloudflare 第三版**唯讀 Preview** 成功部署；Worker Version `0b243243-294b-42af-a6ee-2e09fa3f1816`，部署記錄與舊版還原代碼見 `docs/DEPLOYMENTS.md`。HTTPS 檢查 https://github.com/yukidu/starry-recorder/actions/runs/39922742035 通過。
- **沒有正式 Production 網域、正式登入、原生 Android/iOS 背景錄音、真實音檔服務端轉碼、AI 引擎或正式訂閱付款。** Draft PR #1 不合併。
