import { useMemo, useState } from "react";
import { BookOpen, ExternalLink, Headphones, Map, PlayCircle, Search, ShieldCheck, Train, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Design Reminder — 昭和現代主義與日本公共資訊設計：
 * - 以日本車站路線圖、公共資訊牌、票券卡片作為主要視覺語彙。
 * - N5 到 N1 是學習路線，不只是分類按鈕；所有影片來源必須透明。
 * - 色彩維持米紙、墨綠、朱紅、鐵道藍與炭黑，互動像抽出票券般輕微位移。
 */

type Level = "N5" | "N4" | "N3" | "N2" | "N1";
type Topic = "文法" | "單字" | "聽解" | "讀解" | "綜合";

type VideoItem = {
  id: string;
  title: string;
  channel: string;
  level: Level;
  topic: Topic;
  reason: string;
  confidence: "高" | "中";
};

const heroImage = "https://d2xsxph8kpxj0f.cloudfront.net/310519663615536359/Eo5zKxPE3r647x6NkNQoe5/nihongo_hero_station_map-i92c2aVR2pcivx8nJA773U.webp";
const ticketImage = "https://d2xsxph8kpxj0f.cloudfront.net/310519663615536359/Eo5zKxPE3r647x6NkNQoe5/nihongo_ticket_cards-9MdMarHp8aRGqMYTv5me3J.webp";
const badgeImage = "https://d2xsxph8kpxj0f.cloudfront.net/310519663615536359/Eo5zKxPE3r647x6NkNQoe5/nihongo_level_badges-cfDqXBDL2wJ27BC8FsjKJA.webp";

const levels: Array<{ level: Level; label: string; description: string; color: string }> = [
  { level: "N5", label: "初級入門", description: "五十音、基礎句型、日常寒暄", color: "bg-[#2f5d46]" },
  { level: "N4", label: "基礎學習", description: "基礎文法、短文理解、生活會話", color: "bg-[#24628f]" },
  { level: "N3", label: "中級前半", description: "常用語彙、文章銜接、情境聽解", color: "bg-[#b7442e]" },
  { level: "N2", label: "中級後半", description: "抽象表達、新聞讀解、長句解析", color: "bg-[#b48728]" },
  { level: "N1", label: "上級到達", description: "高度讀解、細膩語感、專題聽力", color: "bg-[#272a28]" },
];

const topics: Array<"全部" | Topic> = ["全部", "文法", "單字", "聽解", "讀解", "綜合"];

const videos: VideoItem[] = [
  { id: "3MPbTCqIkuM", level: "N5", topic: "文法", title: "JLPT N5 Grammar Practice｜N5 文法過去問解説", channel: "SAKINA | JOURNEY TO JAPAN", reason: "適合作為 N5 文法練習入口，標題與級別明確。", confidence: "高" },
  { id: "0V2Y8AIUugI", level: "N5", topic: "單字", title: "一次學完所有的 N5 動詞（全126個單字）", channel: "日文筆記本", reason: "以圖文例句整理 N5 動詞，適合初學者建立語彙基礎。", confidence: "高" },
  { id: "6nByRvRMuaY", level: "N5", topic: "聽解", title: "JLPT N5 Listening Practice with Mochi Sensei", channel: "Mochi real Japanese", reason: "針對 N5 聽力練習，適合建立初級聽懂速度。", confidence: "高" },
  { id: "j8RgqewE2C0", level: "N5", topic: "綜合", title: "日本語 N5 初級綜合複習 1｜聽力練習", channel: "日本語の仲間", reason: "整合初級複習與聽力，適合考前整理。", confidence: "高" },
  { id: "kRTh53juVOU", level: "N4", topic: "文法", title: "N4 日文文法 79 個｜上篇", channel: "Elsaの放送", reason: "涵蓋 N4 必記文法，適合系統化複習。", confidence: "高" },
  { id: "uIS_oika5w4", level: "N4", topic: "單字", title: "Japanese Basic Vocabulary and Grammar｜JLPT N4", channel: "with Taka", reason: "以 N4 基礎單字與文法為主，適合補強核心能力。", confidence: "中" },
  { id: "w-BvFOMkb40", level: "N4", topic: "聽解", title: "JLPT N4 Listening", channel: "Sun and Moon Channel", reason: "提供 N4 聽解練習，適合搭配通勤或碎片時間。", confidence: "中" },
  { id: "yPeWoZevNcU", level: "N4", topic: "讀解", title: "日語能力測試 N4｜閱讀理解篇", channel: "Elsaの放送", reason: "聚焦閱讀理解並含解說，適合作為 N4 讀解入門。", confidence: "高" },
  { id: "vpfwGneh4W4", level: "N3", topic: "聽解", title: "這樣聽懂 N3 聽力｜完整逐句解析", channel: "Elsaの放送", reason: "逐句解析 N3 聽力，有助理解句子連音與語境。", confidence: "高" },
  { id: "OuAtfP3-pk8", level: "N3", topic: "聽解", title: "JLPT N3 聽力 20 分鐘免費練習", channel: "Elsaの放送", reason: "以對話解析與例句教學降低 N3 聽力門檻。", confidence: "高" },
  { id: "w9AQ5a6-acU", level: "N3", topic: "綜合", title: "JLPT 考題改革趨勢與準備方式", channel: "抓尼先生 / 學日文 & 日本大小事", reason: "整理單字、文法、讀解與聽解準備策略。", confidence: "高" },
  { id: "_EgMcR2a0-4", level: "N3", topic: "單字", title: "一次聽完 250 個 N3 單字｜語彙聽力跟讀", channel: "旭文日本語學院", reason: "透過聽力與跟讀強化 N3 詞彙記憶。", confidence: "高" },
  { id: "JHikaTQAJVQ", level: "N2", topic: "文法", title: "N2 文法 144 個｜上篇", channel: "Elsaの放送", reason: "整理 N2 常見文法，適合中高級考生建立清單。", confidence: "高" },
  { id: "YWDC6z5DFkM", level: "N2", topic: "文法", title: "N2 攻略大全｜文法問題 50 題", channel: "日本語之森台灣", reason: "以題目演練方式檢查 N2 文法熟悉度。", confidence: "高" },
  { id: "cOa2dNx28xg", level: "N2", topic: "文法", title: "10 小時帶你拿下 N2 語法｜高頻語法總結", channel: "日本择优进学塾", reason: "長時段整理高頻語法，可作為集中複習材料。", confidence: "中" },
  { id: "CkRE2ZoXNOc", level: "N2", topic: "單字", title: "日語檢定 N2 重要單字 part1", channel: "井上一宏", reason: "針對 N2 重要單字，適合分段背誦。", confidence: "高" },
  { id: "j_qqHQtUOzw", level: "N1", topic: "文法", title: "N1 文法 141 個｜上篇", channel: "Elsaの放送", reason: "系統整理 N1 文法，適合進入高級句型複習。", confidence: "高" },
  { id: "r5rNHrJg-7I", level: "N1", topic: "聽解", title: "5 HRs Immerse Japanese Listening JLPT N1", channel: "Multi Language Practice", reason: "長時間沉浸式 N1 聽力訓練，適合建立耐力。", confidence: "高" },
  { id: "_Beflvl8PAs", level: "N1", topic: "單字", title: "N1 1500 單字｜上篇", channel: "Elsaの放送", reason: "聚焦 N1 高階詞彙，適合作為語彙清單。", confidence: "高" },
  { id: "F0ctfIuXKHQ", level: "N1", topic: "讀解", title: "Master JLPT N1 Reading Comprehension", channel: "CarlosCoordinator", reason: "聚焦 N1 讀解策略，適合補強長文理解。", confidence: "中" },
];

function topicIcon(topic: Topic) {
  if (topic === "聽解") return <Headphones className="h-4 w-4" />;
  if (topic === "單字") return <BookOpen className="h-4 w-4" />;
  if (topic === "讀解") return <Search className="h-4 w-4" />;
  if (topic === "綜合") return <Map className="h-4 w-4" />;
  return <Video className="h-4 w-4" />;
}

export default function Home() {
  const [activeLevel, setActiveLevel] = useState<Level>("N5");
  const [activeTopic, setActiveTopic] = useState<"全部" | Topic>("全部");
  const [selectedVideoId, setSelectedVideoId] = useState(videos[0].id);

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => video.level === activeLevel && (activeTopic === "全部" || video.topic === activeTopic));
  }, [activeLevel, activeTopic]);

  const selectedVideo = videos.find((video) => video.id === selectedVideoId) ?? filteredVideos[0] ?? videos[0];

  function switchLevel(level: Level) {
    setActiveLevel(level);
    setActiveTopic("全部");
    const first = videos.find((video) => video.level === level);
    if (first) setSelectedVideoId(first.id);
  }

  function switchTopic(topic: "全部" | Topic) {
    setActiveTopic(topic);
    const first = videos.find((video) => video.level === activeLevel && (topic === "全部" || video.topic === topic));
    if (first) setSelectedVideoId(first.id);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4ecd8] text-[#21392f]">
      <section className="relative min-h-screen border-b border-[#21392f]/15">
        <div className="absolute inset-0 bg-[url('https://d2xsxph8kpxj0f.cloudfront.net/310519663615536359/Eo5zKxPE3r647x6NkNQoe5/nihongo_paper_pattern-2qjVZvdvYrMsj2KwtsxgWV.webp')] bg-cover bg-center opacity-80" />
        <div className="absolute inset-y-0 right-0 hidden w-3/5 lg:block">
          <img src={heroImage} alt="N5 到 N1 的日文學習路線圖插畫" className="h-full w-full object-cover object-center opacity-95 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f4ecd8] via-[#f4ecd8]/40 to-transparent" />
        </div>

        <nav className="relative z-10 flex items-center justify-between px-5 py-6 md:px-10 lg:px-16">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center border-2 border-[#21392f] bg-[#f8f0de] shadow-[4px_4px_0_#b7442e]">
              <Train className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#b7442e]">Nihongo Video Hub</p>
              <p className="text-sm tracking-wide text-[#21392f]/70">JLPT 學習影片路線圖</p>
            </div>
          </div>
          <a href="#catalog" className="hidden border border-[#21392f]/30 bg-[#f8f0de]/80 px-4 py-2 text-sm font-semibold tracking-wide shadow-[3px_3px_0_#21392f] transition hover:-translate-y-0.5 md:inline-flex">
            前往影片月台
          </a>
        </nav>

        <div className="relative z-10 grid min-h-[calc(100vh-96px)] items-center px-5 pb-16 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-16">
          <div className="max-w-3xl pt-10 lg:pt-0">
            <div className="mb-8 inline-flex items-center gap-2 border border-[#21392f]/25 bg-[#f8f0de]/90 px-3 py-2 text-sm font-semibold shadow-[3px_3px_0_#24628f]">
              <ShieldCheck className="h-4 w-4 text-[#2f5d46]" />
              公開影片索引｜保留原作者來源
            </div>
            <h1 className="font-serif text-5xl font-black leading-[0.95] tracking-[-0.04em] text-[#21392f] md:text-7xl lg:text-8xl">
              從 N5 到 N1，沿著日語學習路線前進。
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#314a40] md:text-xl">
              這是一個把公開 YouTube 日文學習影片依 JLPT 級別整理的資源站。每支影片都標示頻道來源、學習主題與觀看方式，協助你快速找到適合目前程度的文法、單字、聽解與讀解內容。
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a href="#catalog">
                <Button className="h-12 rounded-none bg-[#21392f] px-7 text-base font-bold text-[#fff7e6] shadow-[5px_5px_0_#b7442e] transition hover:-translate-y-1 hover:bg-[#2f5d46]">
                  開始查詢路線
                </Button>
              </a>
              <a href="#copyright" className="inline-flex h-12 items-center justify-center border border-[#21392f]/30 bg-[#f8f0de] px-7 text-base font-bold text-[#21392f] shadow-[5px_5px_0_#24628f] transition hover:-translate-y-1">
                版權使用原則
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="catalog" className="relative px-5 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.32em] text-[#b7442e]">Route Selection</p>
              <h2 className="font-serif text-4xl font-black tracking-[-0.03em] md:text-6xl">選擇你的 JLPT 月台</h2>
            </div>
            <p className="max-w-3xl text-base leading-7 text-[#314a40]">
              第一版先採用精選影片清單，不自動下載或重新上傳內容。若影片作者關閉嵌入，播放器會依 YouTube 規則處理；你也可以直接點擊前往 YouTube 原頁觀看。
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
            <aside className="relative">
              <div className="sticky top-6 space-y-3">
                {levels.map((item, index) => (
                  <button
                    key={item.level}
                    onClick={() => switchLevel(item.level)}
                    className={`group w-full border-2 px-4 py-4 text-left transition duration-200 ${activeLevel === item.level ? "translate-x-2 border-[#21392f] bg-[#f8f0de] shadow-[7px_7px_0_#21392f]" : "border-[#21392f]/25 bg-[#fff8e9]/70 hover:translate-x-1 hover:border-[#21392f]/70"}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`flex h-14 w-20 items-center justify-center text-3xl font-black text-white ${item.color}`}>{item.level}</span>
                      <span>
                        <span className="block text-lg font-black tracking-wide">{item.label}</span>
                        <span className="mt-1 block text-sm leading-5 text-[#314a40]/80">{item.description}</span>
                      </span>
                    </div>
                    {index < levels.length - 1 && <div className="ml-10 mt-3 h-5 w-px bg-[#21392f]/25" />}
                  </button>
                ))}
              </div>
            </aside>

            <div className="space-y-8">
              <div className="grid gap-5 rounded-none border-2 border-[#21392f] bg-[#fff7e6] p-4 shadow-[10px_10px_0_#24628f] lg:grid-cols-[1.1fr_0.9fr]">
                <div className="aspect-video overflow-hidden border border-[#21392f]/30 bg-[#21392f]">
                  <iframe
                    key={selectedVideo.id}
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${selectedVideo.id}`}
                    title={selectedVideo.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="flex flex-col justify-between p-2">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 bg-[#b7442e] px-3 py-1 text-sm font-black text-[#fff7e6]">
                      {selectedVideo.level}｜{selectedVideo.topic}
                    </div>
                    <h3 className="font-serif text-2xl font-black leading-tight text-[#21392f] md:text-3xl">{selectedVideo.title}</h3>
                    <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-[#24628f]">來源頻道：{selectedVideo.channel}</p>
                    <p className="mt-4 text-base leading-7 text-[#314a40]">{selectedVideo.reason}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href={`https://www.youtube.com/watch?v=${selectedVideo.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#21392f] bg-[#21392f] px-4 py-2 text-sm font-bold text-[#fff7e6] transition hover:-translate-y-0.5">
                      到 YouTube 原頁 <ExternalLink className="h-4 w-4" />
                    </a>
                    <span className="inline-flex items-center border border-[#21392f]/25 px-4 py-2 text-sm font-bold text-[#21392f]/80">可信度：{selectedVideo.confidence}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => switchTopic(topic)}
                    className={`border px-4 py-2 text-sm font-black transition ${activeTopic === topic ? "border-[#21392f] bg-[#21392f] text-[#fff7e6]" : "border-[#21392f]/30 bg-[#fff8e9] text-[#21392f] hover:-translate-y-0.5 hover:border-[#21392f]"}`}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {filteredVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideoId(video.id)}
                    className={`group min-h-[210px] border-2 bg-[#fff8e9] p-5 text-left transition duration-200 ${selectedVideo.id === video.id ? "border-[#b7442e] shadow-[7px_7px_0_#b7442e]" : "border-[#21392f]/20 hover:-translate-y-1 hover:border-[#21392f] hover:shadow-[7px_7px_0_#21392f]"}`}
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 bg-[#2f5d46] px-3 py-1 text-sm font-black text-[#fff7e6]">
                        {topicIcon(video.topic)} {video.level}｜{video.topic}
                      </span>
                      <PlayCircle className="h-7 w-7 text-[#b7442e] transition group-hover:scale-110" />
                    </div>
                    <h4 className="font-serif text-xl font-black leading-snug text-[#21392f]">{video.title}</h4>
                    <p className="mt-3 text-sm font-bold text-[#24628f]">{video.channel}</p>
                    <p className="mt-4 text-sm leading-6 text-[#314a40]">{video.reason}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#21392f]/15 bg-[#21392f] px-5 py-16 text-[#fff7e6] md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.32em] text-[#e6b14a]">Learning Tickets</p>
            <h2 className="font-serif text-4xl font-black tracking-[-0.03em] md:text-5xl">用票券系統記住學習任務。</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#fff7e6]/80">
              每個級別都被設計成一張學習票券，幫助你快速判斷「現在要補哪一站」。未來可再擴充收藏、觀看紀錄與自訂播放清單。
            </p>
          </div>
          <img src={ticketImage} alt="JLPT 分級票券插畫" className="w-full border border-[#fff7e6]/20 shadow-[12px_12px_0_#b7442e]" />
        </div>
      </section>

      <section id="copyright" className="px-5 py-16 md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <img src={badgeImage} alt="JLPT 級別站牌插畫" className="w-full border border-[#21392f]/20 shadow-[10px_10px_0_#21392f]" />
          <div className="border-2 border-[#21392f] bg-[#fff8e9] p-7 shadow-[10px_10px_0_#b7442e] md:p-10">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.32em] text-[#b7442e]">Copyright Policy</p>
            <h2 className="font-serif text-4xl font-black tracking-[-0.03em]">這樣做比較不容易侵權。</h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-[#314a40]">
              <p>
                本站採用公開 YouTube 影片的官方嵌入播放器與原頁連結，不下載、不重製、不重新上傳影片，也不移除或遮蔽播放器來源資訊。影片版權與收益歸原創作者、頻道與 YouTube 平台機制處理。
              </p>
              <p>
                若影片作者關閉嵌入、移除影片或限制地區播放，本站會尊重 YouTube 的播放結果。若權利人希望移除本站索引中的影片，可透過網站管理者聯繫後下架該筆索引。
              </p>
              <p className="border-l-4 border-[#2f5d46] bg-[#f4ecd8] px-4 py-3 font-semibold">
                實務建議：只做「索引與分類」風險較低；不要下載影片、自架播放器、搬運字幕、複製付費教材，或讓使用者誤以為影片由本站製作。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
