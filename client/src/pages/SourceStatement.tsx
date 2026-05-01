import { ArrowLeft, ExternalLink, HeartHandshake, ShieldCheck, Train } from "lucide-react";

const principles = [
  {
    title: "免費學習",
    description: "本站整理公開的 YouTube 日文學習影片，目的在於幫助學習者更快找到適合 JLPT N5 到 N1 的學習資源，不向使用者收費。",
  },
  {
    title: "非營利整合",
    description: "本站不以影片內容營利，也不販售、下載或重新上傳任何原創影片；所有觀看行為都會導回 YouTube 原影片或原頻道。",
  },
  {
    title: "尊重創作者",
    description: "每支影片皆盡量標示原頻道名稱與原頻道連結，讓學習者可以回到創作者頁面訂閱、觀看更多內容，增加原創作者曝光。",
  },
];

export default function SourceStatement() {
  return (
    <main className="min-h-screen bg-[#f4ecd8] text-[#21392f]">
      <section className="relative overflow-hidden border-b border-[#21392f]/15">
        <div className="absolute inset-0 bg-[url('https://d2xsxph8kpxj0f.cloudfront.net/310519663615536359/Eo5zKxPE3r647x6NkNQoe5/nihongo_paper_pattern-2qjVZvdvYrMsj2KwtsxgWV.webp')] bg-cover bg-center opacity-70" />
        <div className="relative z-10 mx-auto max-w-5xl px-5 py-8 md:px-10 lg:px-16">
          <nav className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center border-2 border-[#21392f] bg-[#f8f0de] shadow-[4px_4px_0_#b7442e]">
                <Train className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#b7442e]">Nihongo Video Hub</p>
                <p className="text-sm tracking-wide text-[#21392f]/70">來源聲明</p>
              </div>
            </div>
            <a href="/" className="inline-flex items-center border border-[#21392f] bg-[#f8f0de] px-4 py-2 text-sm font-bold text-[#21392f] shadow-[3px_3px_0_#21392f] transition hover:-translate-y-0.5 hover:bg-[#fff8e9]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              回到首頁
            </a>
          </nav>

          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-[#21392f]/25 bg-[#f8f0de]/90 px-3 py-2 text-sm font-semibold shadow-[3px_3px_0_#24628f]">
              <ShieldCheck className="h-4 w-4 text-[#2f5d46]" />
              免費、非營利、尊重原創
            </div>
            <h1 className="font-serif text-5xl font-black leading-[0.98] tracking-[-0.04em] text-[#173b2d] md:text-7xl">
              來源聲明與創作者感謝
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-9 text-[#314a40]">
              Nihongo Video Hub 是一個<strong>免費、非營利的日文學習影片整合平台</strong>。我們將多個 YouTube 頻道公開提供的優質日文學習影片，依 JLPT 級別與主題整理成更容易查找的路線圖，協助學習者快速找到適合自己的內容。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 md:px-10 lg:px-16">
        <div className="grid gap-4 md:grid-cols-3">
          {principles.map((item) => (
            <article key={item.title} className="border border-[#21392f]/20 bg-[#f8f0de] p-6 shadow-[6px_6px_0_rgba(33,57,47,0.16)]">
              <HeartHandshake className="mb-5 h-7 w-7 text-[#b7442e]" />
              <h2 className="text-xl font-black text-[#173b2d]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#314a40]/85">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-l-4 border-[#b7442e] bg-[#f8f0de]/70 p-6">
            <h2 className="text-2xl font-black text-[#173b2d]">我們如何使用這些來源</h2>
            <p className="mt-4 leading-8 text-[#314a40]">
              本站只做<strong>索引、分類與導流</strong>。影片播放仍透過 YouTube 嵌入或外部連結進行，使用者可以直接前往原影片與原頻道觀看、按讚、留言或訂閱。我們希望這樣的整理能降低學習者尋找資料的成本，也讓更多優質創作者被看見。
            </p>
          </div>

          <div className="overflow-hidden border border-[#21392f]/20 bg-[#fff8e9]">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-[#21392f]/15">
                <tr>
                  <th className="w-36 bg-[#21392f] px-4 py-4 font-bold text-[#f8f0de]">本站會做</th>
                  <td className="px-4 py-4 leading-7 text-[#314a40]">整理公開影片資訊、標示原頻道、提供原影片與原頻道連結，方便學習者回到 YouTube 原始頁面。</td>
                </tr>
                <tr>
                  <th className="w-36 bg-[#2f5d46] px-4 py-4 font-bold text-[#f8f0de]">本站不做</th>
                  <td className="px-4 py-4 leading-7 text-[#314a40]">不下載影片、不重新上傳影片、不販售影片內容，也不主張擁有原影片或頻道內容的著作權。</td>
                </tr>
                <tr>
                  <th className="w-36 bg-[#24628f] px-4 py-4 font-bold text-[#f8f0de]">我們感謝</th>
                  <td className="px-4 py-4 leading-7 text-[#314a40]">感謝所有 YouTube 原創作者與頻道長期製作日文教學內容，讓學習者能以免費或低門檻方式接觸優質資源。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 border border-[#21392f]/20 bg-[#21392f] p-6 text-[#f8f0de] shadow-[7px_7px_0_#b7442e]">
          <h2 className="text-2xl font-black">給創作者與頻道經營者</h2>
          <p className="mt-4 max-w-3xl leading-8 text-[#f8f0de]/85">
            如果你是影片或頻道的原創作者，並希望我們修正標示、更新連結、補充說明，或移除本站整理中的某項內容，歡迎透過網站管理者聯繫我們。我們會以尊重原創者意願為優先，盡快處理相關調整。
          </p>
          <a
            href="https://www.youtube.com/"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center border border-[#f8f0de]/60 px-4 py-2 text-sm font-bold tracking-wide text-[#f8f0de] transition hover:-translate-y-0.5 hover:bg-[#f8f0de] hover:text-[#21392f]"
          >
            前往 YouTube 探索更多原創內容
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
