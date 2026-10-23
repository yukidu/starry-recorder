# 繁星 AI 錄音｜Cloudflare AI 整合（AI71，2026-10-24）

**狀態：Cloudflare 獨立 AI 測試 Worker 已部署；正式錄音 App 尚未部署。**

## 已接通
- 專用後台 AI Adapter `src/ai-cloudflare.ts`，Whisper Large V3 Turbo 作語音辨識；Llama 3.3 作摘要與來源限定問答；Qwen 3.8 Vision 作簡報圖片文字辨識。
- GitHub `wrangler.preview.jsonc` / `wrangler.jsonc` 已設定 Workers AI binding 名稱 `AI`；但原本私人會員 API 的全部安全開關維持關閉，尚無可用的正式資料流程。
- Cloudflare 帳號 `611de84062006fe96fafd0cf157f2ec0` 已部署無公開路由的 `starry-recorder-ai-lab` Worker；Cloudflare 確認其綁定 `AI` 類型 `ai`，Worker Version `2a8a5695-9ac1-4294-81a1-7dcf635a9d77`。
- 該 Worker 禁用 workers.dev 和預覽連結；所有收到的 HTTP 請求回傳 404，不公開任何 AI、會員或付款服務。
- 透過使用者已授權的 Cloudflare 管理連線，使用合成測試資料直接向 Workers AI 官方帳號 API 測試：
  - Llama 摘要成功。
  - Cloudflare Melo TTS 合成「Water is important for healthy human bodies.」→ Whisper 辨識還原原句，成功（約 2.73 秒）。
  - Qwen3.8 Vision 對合成 PNG 「WATER」圖片辨識得到 WATER（使用 `enable_thinking:false`）。
- 注意：對沒有真實人聲的合成聲波，Whisper 曾產生虛構的「Thank you.」，因此**必須加入靜音／VAD 檢查、品質測試以及人工校正**，不能把上述測試當作完整品質驗收。
- Meta Llama 3.2 Vision 要求額外模型授權及使用地區聲明，**未接受條款、未啟用**，已改用 Cloudflare Qwen 視覺模型。

## AI 費用保護
- `src/ai-cloudflare.ts` 限制音訊段最多 120 秒、2MB；圖片最多 800KB；問答需限量且引用已授權來源。
- `src/ai-budget.ts` 與 Preview D1 `0004_ai_lab_budget.sql`：合成測試任務須 `synthetic-` ID，每 UTC 日最多 10 次推論預留、預留估算合計不得超過 US$1；先預留再呼叫，失敗不退款以防無限重試。這是**可供私有背景工作者使用的軟體預算關卡**，並非 Cloudflare 帳號層級的強制扣款上限。
- 管理者透過 Cloudflare REST API 手動執行的上述少量模型驗證**未使用 D1 軟體預算封裝**，僅透過管理權限執行；不得宣稱所有雲端 AI 花費都已有硬性阻擋。
- 正式部署前應建立專用 AI Gateway、設定費用上限、完成真實成本文書及壓力測試，避免模型滾動超支。

## 尚未完成
- Starry ID 安全跨 App 登入、會員額度的完整預留／核銷及撤銷機制。
- 100 分鐘音訊的實際轉檔、音訊切段工作流程、AI Queue／重試／DLQ、逐字稿與 OCR 存回 D1、完整私有語意搜尋索引。
- 圖片中的文字 OCR 品質驗證、多語言多口音、人物辨識與原始音檔時間戳同步。
- Android/iOS 原生背景錄音、訂閱付款、2000 人以上安全和負載測試、正式網址 `record.starry.phd`。

## 回復
- AI 測試 Worker 初次部署，無舊版本可回切；內部 Lab 回復識別碼：`SR-AILAB-UNDO-2A8A5695`，意思是**停用並經確認後刪除這個無公開路由的測試 Worker**，不影響正式 App 或其他 Worker。
- 既有唯讀測試站繼續獨立運作，須另記錄它的每次部署版本與上一版回復代碼。
