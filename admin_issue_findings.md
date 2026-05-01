# /admin 後台問題重現紀錄

已於 2026-05-01 檢查以下網址：

- 本機預覽：`https://3000-i1alr6uv5zhsztxmq15na-7aa2c2c2.sg1.manus.computer/admin`
- 已部署網域：`https://nihongovid-eo5zkxpe.manus.space/admin`

HTTP 檢查結果兩者皆回應 `200 text/html`。瀏覽器直接開啟已部署 `/admin` 時，畫面可顯示「管理員資料維護頁」與「登入管理員帳號」按鈕，代表基本前端路由與部署端 SPA fallback 可用。

待檢查項目：

1. 使用者所說「打開不了」是否指無法登入、登入後回不到 `/admin`、或權限不足。
2. OAuth 登入按鈕是否產生正確的 returnPath `/admin`。
3. 是否需要在頁面加入更明確的直接後台網址提示或修正登入回跳。


## 修復後驗證（2026-05-01）

本機預覽直接開啟 `/admin` 已可顯示「站務資料維護」後台頁，畫面包含回到影片索引、登出按鈕、YouTube 連結、JLPT 級別、主題、影片標題、頻道名稱、原頻道網址、備註與「新增到資料庫」按鈕。這表示前端路由可直接載入後台，且目前測試帳號具備管理員角色時可進入資料維護介面。

本次修復同時處理兩個問題：第一，首頁 `Home.tsx` 缺少 React hooks 匯入會造成本機預覽曾出現 `useAuth is not defined` 類型的前端錯誤；第二，OAuth token exchange 原本把整段 JSON state 解碼後當成 redirect URI 使用，現在會正確從 state 中取出 `redirectUri`，可避免從 `/admin` 登入回跳時 token 換取失敗。
