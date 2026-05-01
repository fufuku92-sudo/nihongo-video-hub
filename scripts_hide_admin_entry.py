from pathlib import Path

path = Path('/home/ubuntu/nihongo-video-hub/client/src/pages/Home.tsx')
text = path.read_text()

replacements = [
    (
        '  const [formMessage, setFormMessage] = useState("請以管理員帳號登入後新增、編輯或刪除自訂影片。資料會同步到資料庫。");',
        '  const [formMessage, setFormMessage] = useState("站務登入後即可維護資料庫影片，變更會同步保存。");\n  const [showOpsPanel, setShowOpsPanel] = useState(false);',
    ),
    (
        '  function handleLogin() {\n    window.location.href = getLoginUrl();\n  }',
        '  function revealOpsPanel() {\n    setShowOpsPanel(true);\n    window.setTimeout(() => document.getElementById("station-office")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);\n  }\n\n  function handleLogin() {\n    window.location.href = getLoginUrl();\n  }',
    ),
    (
        '            <a href="#catalog" className="border border-[#21392f]/30 bg-[#f8f0de]/80 px-4 py-2 text-sm font-semibold tracking-wide shadow-[3px_3px_0_#21392f] transition hover:-translate-y-0.5">影片月台</a>\n            <a href="#manage" className="border border-[#21392f]/30 bg-[#f8f0de]/80 px-4 py-2 text-sm font-semibold tracking-wide shadow-[3px_3px_0_#24628f] transition hover:-translate-y-0.5">管理員入口</a>',
        '            <a href="#catalog" className="border border-[#21392f]/30 bg-[#f8f0de]/80 px-4 py-2 text-sm font-semibold tracking-wide shadow-[3px_3px_0_#21392f] transition hover:-translate-y-0.5">影片月台</a>',
    ),
    (
        '              這裡把日文學習影片依 JLPT 級別與主題整理成路線圖。一般使用者可以瀏覽與篩選影片；新增與刪除影片則限定管理員操作。',
        '              這裡把日文學習影片依 JLPT 級別與主題整理成路線圖。你可以依程度與學習目標瀏覽、篩選並開啟適合的影片。',
    ),
    (
        '              <a href="#manage" className="inline-flex h-12 items-center justify-center border border-[#21392f]/30 bg-[#f8f0de] px-7 text-base font-bold text-[#21392f] shadow-[5px_5px_0_#24628f] transition hover:-translate-y-1">\n                管理員新增影片\n              </a>',
        '              <a href="#catalog" className="inline-flex h-12 items-center justify-center border border-[#21392f]/30 bg-[#f8f0de] px-7 text-base font-bold text-[#21392f] shadow-[5px_5px_0_#24628f] transition hover:-translate-y-1">\n                查看影片清單\n              </a>',
    ),
    (
        '              目前預設收錄 {seedVideos.length} 支影片。管理員新增的影片會與預設影片合併顯示，一般訪客只會看到整理好的學習清單。',
        '              目前預設收錄 {seedVideos.length} 支影片。站方維護的補充影片會與預設影片合併顯示，讓學習清單持續保持可用。',
    ),
    (
        '      <section id="manage" className="border-y border-[#21392f]/15 bg-[#21392f] px-5 py-16 text-[#fff7e6] md:px-10 lg:px-16">',
        '      {(showOpsPanel || isAuthenticated) && (\n      <section id="station-office" className="border-y border-[#21392f]/15 bg-[#21392f] px-5 py-16 text-[#fff7e6] md:px-10 lg:px-16">',
    ),
    (
        '            <p className="mb-3 text-sm font-black uppercase tracking-[0.32em] text-[#e6b14a]">Video Manager</p>\n            <h2 className="font-serif text-4xl font-black tracking-[-0.03em] md:text-5xl">管理員新增影片。</h2>\n            <p className="mt-5 max-w-xl text-base leading-8 text-[#fff7e6]/80">\n              這個區塊已改成管理員入口。一般訪客只能瀏覽影片；管理員解鎖後，才可以貼上 YouTube 連結、選擇 N5 到 N1 與主題，並把影片加入清單。\n            </p>',
        '            <p className="mb-3 text-sm font-black uppercase tracking-[0.32em] text-[#e6b14a]">Station Office</p>\n            <h2 className="font-serif text-4xl font-black tracking-[-0.03em] md:text-5xl">站務資料維護。</h2>\n            <p className="mt-5 max-w-xl text-base leading-8 text-[#fff7e6]/80">\n              此區塊僅供站務維護使用；未登入時不會在首頁主視覺或主要導覽中顯示，登入後才會依帳號角色開放資料維護功能。\n            </p>',
    ),
    (
        '                    <h3 className="font-serif text-2xl font-black">管理員登入後台</h3>\n                    <p className="mt-2 text-sm leading-6 text-[#314a40]">一般訪客可以瀏覽影片。若要新增或刪除自訂影片，請先登入具有管理員角色的帳號。</p>',
        '                    <h3 className="font-serif text-2xl font-black">站務登入</h3>\n                    <p className="mt-2 text-sm leading-6 text-[#314a40]">此入口提供內容維護使用。若需要維護資料，請登入具備相應權限的帳號。</p>',
    ),
    (
        '                    <Lock className="mr-2 h-4 w-4" /> 登入管理員帳號',
        '                    <Lock className="mr-2 h-4 w-4" /> 登入站務帳號',
    ),
    (
        '                  <p className="text-sm font-black text-[#2f5d46]">管理員模式使用中：{user?.name || "管理員"} 可以新增與刪除資料庫影片。</p>',
        '                  <p className="text-sm font-black text-[#2f5d46]">站務模式使用中：{user?.name || "管理員"} 可以新增、編輯與刪除資料庫影片。</p>',
    ),
    (
        '                  <h3 className="mb-4 font-serif text-2xl font-black">管理員新增的影片</h3>',
        '                  <h3 className="mb-4 font-serif text-2xl font-black">站務維護的影片</h3>',
    ),
    (
        '        </div>\n      </section>\n\n      <footer',
        '        </div>\n      </section>\n      )}\n\n      <footer',
    ),
    (
        '        <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[#21392f]/15 pt-6 md:flex-row md:items-center md:justify-between">\n          <p className="font-bold">Nihongo Video Hub｜目前共 {videos.length} 支影片，包含 {customVideos.length} 支自訂影片。</p>',
        '        <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[#21392f]/15 pt-6 md:flex-row md:items-center md:justify-between">\n          <div className="flex flex-col gap-2">\n            <p className="font-bold">Nihongo Video Hub｜目前共 {videos.length} 支影片，包含 {customVideos.length} 支補充影片。</p>\n            <button type="button" onClick={revealOpsPanel} className="w-fit text-left text-xs font-semibold tracking-[0.18em] text-[#314a40]/45 underline-offset-4 transition hover:text-[#314a40] hover:underline" aria-label="開啟站務入口">\n              站務\n            </button>\n          </div>',
    ),
]

for old, new in replacements:
    if old not in text:
        raise SystemExit(f'Missing expected text:\n{old[:220]}')
    text = text.replace(old, new, 1)

path.write_text(text)
print('updated hidden station office entry')
