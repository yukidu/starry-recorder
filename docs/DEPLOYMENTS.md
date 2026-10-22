# 繁星 AI 錄音｜部署登記簿

> 以下「部署」僅代表獨立的無會員資料測試站，不代表正式錄音 App 上線。

## 2026-10-23｜第一次 Cloudflare Preview 部署

- 環境：`starry-recorder-preview`
- 站點：https://starry-recorder-preview.yukidu.workers.dev/
- 用途：公開唯讀狀態頁、`/healthz`、安全標頭與拒絕私密寫入驗證；不收集使用者資料
- 已驗證：GitHub `Preview smoke test` https://github.com/yukidu/starry-recorder/actions/runs/39863497086
- Cloudflare Deployment ID：`c0bd392b-5766-4e8b-84e8-cf318622c83d`
- Cloudflare Version ID：`9f479b66-ff38-41ec-99e3-d623183ee9af`
- 還原識別碼：**SR-PREVIEW-20261023-9F479B66**
- 還原方式：透過 Cloudflare Workers Deployments 將 `starry-recorder-preview` 版本 `9f479b66-ff38-41ec-99e3-d623183ee9af` 的流量比例設為 100%；還原後重新檢查 `/healthz` 及首頁。**只作用於 Preview Worker，不得對正式 Worker 使用。**

## 正式部署狀態

- 尚未部署 `record.starry.phd`。
- `main` 尚未包含完整錄音 App。
- Starry ID 正式登入、M4A 驗證、AI 逐字稿與圖片 OCR、原生背景錄音、訂閱付款、合規與正式負載驗收仍未完成。
- **正式版本沒有還原代碼**：因為尚無正式部署。
