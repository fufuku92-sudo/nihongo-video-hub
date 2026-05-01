import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpen, ExternalLink, Headphones, Map, PlayCircle, Plus, Search, ShieldCheck, Train, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Design Reminder — 昭和現代主義與日本公共資訊設計：
 * - 以日本車站路線圖、公共資訊牌、票券卡片作為主要視覺語彙。
 * - N5 到 N1 是學習路線，不只是分類按鈕；所有影片來源必須透明但不要喧賓奪主。
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
  confidence: "高" | "中" | "自訂";
  custom?: boolean;
};

type FormState = {
  url: string;
  title: string;
  channel: string;
  level: Level;
  topic: Topic;
  note: string;
};

const STORAGE_KEY = "nihongo-video-hub-custom-videos";
const heroImage = "https://d2xsxph8kpxj0f.cloudfront.net/310519663615536359/Eo5zKxPE3r647x6NkNQoe5/nihongo_hero_station_map-i92c2aVR2pcivx8nJA773U.webp";
const ticketImage = "https://d2xsxph8kpxj0f.cloudfront.net/310519663615536359/Eo5zKxPE3r647x6NkNQoe5/nihongo_ticket_cards-9MdMarHp8aRGqMYTv5me3J.webp";

const levels: Array<{ level: Level; label: string; description: string; color: string }> = [
  { level: "N5", label: "初級入門", description: "五十音、基礎句型、日常寒暄", color: "bg-[#2f5d46]" },
  { level: "N4", label: "基礎學習", description: "基礎文法、短文理解、生活會話", color: "bg-[#24628f]" },
  { level: "N3", label: "中級前半", description: "常用語彙、文章銜接、情境聽解", color: "bg-[#b7442e]" },
  { level: "N2", label: "中級後半", description: "抽象表達、新聞讀解、長句解析", color: "bg-[#b48728]" },
  { level: "N1", label: "上級到達", description: "高度讀解、細膩語感、專題聽力", color: "bg-[#272a28]" },
];

const topics: Array<"全部" | Topic> = ["全部", "文法", "單字", "聽解", "讀解", "綜合"];

const seedVideos: VideoItem[] = [
  { id: "3MPbTCqIkuM", level: "N5", topic: "文法", title: "JLPT N5 Grammar Practice｜N5 文法過去問解説", channel: "SAKINA | JOURNEY TO JAPAN", reason: "適合作為 N5 文法練習入口，標題與級別明確。", confidence: "高" },
  { id: "0V2Y8AIUugI", level: "N5", topic: "單字", title: "一次學完所有的 N5 動詞（全126個單字）", channel: "日文筆記本", reason: "以圖文例句整理 N5 動詞，適合初學者建立語彙基礎。", confidence: "高" },
  { id: "x6ICllwCMxE", level: "N5", topic: "單字", title: "日檢 N5 必考單字｜名詞篇單字＋例句", channel: "YouTube 日文學習頻道", reason: "以 N5 必考名詞與例句作為語彙補充，適合初學者反覆練習。", confidence: "中" },
  { id: "qRACZeHacpA", level: "N5", topic: "單字", title: "日檢 N5 必考單字｜副詞・連體詞・接續詞篇", channel: "YouTube 日文學習頻道", reason: "補充常見副詞與連接語，適合搭配基礎文法學習。", confidence: "中" },
  { id: "6nByRvRMuaY", level: "N5", topic: "聽解", title: "JLPT N5 Listening Practice with Mochi Sensei", channel: "Mochi real Japanese", reason: "針對 N5 聽力練習，適合建立初級聽懂速度。", confidence: "高" },
  { id: "j8RgqewE2C0", level: "N5", topic: "綜合", title: "日本語 N5 初級綜合複習 1｜聽力練習", channel: "日本語の仲間", reason: "整合初級複習與聽力，適合考前整理。", confidence: "高" },
  { id: "8VrmqrSrONA", level: "N5", topic: "讀解", title: "N5 讀解完全攻略｜文法＋單字＋解題", channel: "YouTube 日文學習頻道", reason: "聚焦 N5 讀解解題，補足初級閱讀練習。", confidence: "中" },
  { id: "bTWnm02sObk", level: "N5", topic: "讀解", title: "JLPT N5 Online Course｜Reading Practice", channel: "IndoSensei / YouTube", reason: "以線上課程形式練習 N5 讀解，適合想增加英文輔助材料的學習者。", confidence: "中" },
  { id: "kRTh53juVOU", level: "N4", topic: "文法", title: "N4 日文文法 79 個｜上篇", channel: "Elsaの放送", reason: "涵蓋 N4 必記文法，適合系統化複習。", confidence: "高" },
  { id: "uIS_oika5w4", level: "N4", topic: "單字", title: "Japanese Basic Vocabulary and Grammar｜JLPT N4", channel: "with Taka", reason: "以 N4 基礎單字與文法為主，適合補強核心能力。", confidence: "中" },
  { id: "w-BvFOMkb40", level: "N4", topic: "聽解", title: "JLPT N4 Listening", channel: "Sun and Moon Channel", reason: "提供 N4 聽解練習，適合搭配通勤或碎片時間。", confidence: "中" },
  { id: "yPeWoZevNcU", level: "N4", topic: "讀解", title: "日語能力測試 N4｜閱讀理解篇", channel: "Elsaの放送", reason: "聚焦閱讀理解並含解說，適合作為 N4 讀解入門。", confidence: "高" },
  { id: "p5vFjq_rQtw", level: "N4", topic: "讀解", title: "JLPT 日語線上課程｜享受日文文章讀解", channel: "YouTube 日文學習頻道", reason: "以閱讀文章為主，適合 N4 到 N3 過渡期增加閱讀量。", confidence: "中" },
  { id: "cRSAqhqPWG4", level: "N4", topic: "單字", title: "日檢 N5-N1 必備單字・動詞補充", channel: "YouTube Shorts", reason: "短影片形式可作為單字碎片複習，適合補充清單。", confidence: "中" },
  { id: "vpfwGneh4W4", level: "N3", topic: "聽解", title: "這樣聽懂 N3 聽力｜完整逐句解析", channel: "Elsaの放送", reason: "逐句解析 N3 聽力，有助理解句子連音與語境。", confidence: "高" },
  { id: "OuAtfP3-pk8", level: "N3", topic: "聽解", title: "JLPT N3 聽力 20 分鐘免費練習", channel: "Elsaの放送", reason: "以對話解析與例句教學降低 N3 聽力門檻。", confidence: "高" },
  { id: "w9AQ5a6-acU", level: "N3", topic: "綜合", title: "JLPT 考題改革趨勢與準備方式", channel: "抓尼先生 / 學日文 & 日本大小事", reason: "整理單字、文法、讀解與聽解準備策略。", confidence: "高" },
  { id: "_EgMcR2a0-4", level: "N3", topic: "單字", title: "一次聽完 250 個 N3 單字｜語彙聽力跟讀", channel: "旭文日本語學院", reason: "透過聽力與跟讀強化 N3 詞彙記憶。", confidence: "高" },
  { id: "aUjo01G1O2U", level: "N3", topic: "綜合", title: "Japanese Self Study Tips for N5 N4 N3 N2 and N1", channel: "Nihonno Neko / YouTube", reason: "適合作為自學方法補充，尤其可用於 N3 之後規劃讀書節奏。", confidence: "中" },
  { id: "DKzxO7ujP58", level: "N3", topic: "綜合", title: "JLPT N5 N4 N3 N2 N1 準備提醒與學習方向", channel: "Arai Academy / YouTube", reason: "提供跨級別考前提醒，可放在中級階段作為策略影片。", confidence: "中" },
  { id: "JHikaTQAJVQ", level: "N2", topic: "文法", title: "N2 文法 144 個｜上篇", channel: "Elsaの放送", reason: "整理 N2 常見文法，適合中高級考生建立清單。", confidence: "高" },
  { id: "YWDC6z5DFkM", level: "N2", topic: "文法", title: "N2 攻略大全｜文法問題 50 題", channel: "日本語之森台灣", reason: "以題目演練方式檢查 N2 文法熟悉度。", confidence: "高" },
  { id: "cOa2dNx28xg", level: "N2", topic: "文法", title: "10 小時帶你拿下 N2 語法｜高頻語法總結", channel: "日本择优进学塾", reason: "長時段整理高頻語法，可作為集中複習材料。", confidence: "中" },
  { id: "CkRE2ZoXNOc", level: "N2", topic: "單字", title: "日語檢定 N2 重要單字 part1", channel: "井上一宏", reason: "針對 N2 重要單字，適合分段背誦。", confidence: "高" },
  { id: "j_qqHQtUOzw", level: "N1", topic: "文法", title: "N1 文法 141 個｜上篇", channel: "Elsaの放送", reason: "系統整理 N1 文法，適合進入高級句型複習。", confidence: "高" },
  { id: "r5rNHrJg-7I", level: "N1", topic: "聽解", title: "5 HRs Immerse Japanese Listening JLPT N1", channel: "Multi Language Practice", reason: "長時間沉浸式 N1 聽力訓練，適合建立耐力。", confidence: "高" },
  { id: "_Beflvl8PAs", level: "N1", topic: "單字", title: "N1 1500 單字｜上篇", channel: "Elsaの放送", reason: "聚焦 N1 高階詞彙，適合作為語彙清單。", confidence: "高" },
  { id: "F0ctfIuXKHQ", level: "N1", topic: "讀解", title: "Master JLPT N1 Reading Comprehension", channel: "CarlosCoordinator", reason: "聚焦 N1 讀解策略，適合補強長文理解。", confidence: "中" },
];

const emptyForm: FormState = {
  url: "",
  title: "",
  channel: "",
  level: "N5",
  topic: "文法",
  note: "",
};

function topicIcon(topic: Topic) {
  if (topic === "聽解") return <Headphones className="h-4 w-4" />;
  if (topic === "單字") return <BookOpen className="h-4 w-4" />;
  if (topic === "讀解") return <Search className="h-4 w-4" />;
  if (topic === "綜合") return <Map className="h-4 w-4" />;
  return <Video className="h-4 w-4" />;
}

function extractYouTubeId(input: string) {
  const trimmed = input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{6,})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  if (/^[a-zA-Z0-9_-]{6,}$/.test(trimmed)) return trimmed;
  return "";
}

function readCustomVideos(): VideoItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VideoItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item.id && item.title && item.level && item.topic) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [activeLevel, setActiveLevel] = useState<Level>("N5");
  const [activeTopic, setActiveTopic] = useState<"全部" | Topic>("全部");
  const [customVideos, setCustomVideos] = useState<VideoItem[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState(seedVideos[0].id);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formMessage, setFormMessage] = useState("貼上 YouTube 連結後，系統會自動解析影片 ID。");

  useEffect(() => {
    setCustomVideos(readCustomVideos());
  }, []);

  const videos = useMemo(() => [...customVideos, ...seedVideos], [customVideos]);

  const countsByLevel = useMemo(() => {
    return levels.reduce<Record<Level, number>>((acc, item) => {
      acc[item.level] = videos.filter((video) => video.level === item.level).length;
      return acc;
    }, { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 });
  }, [videos]);

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => video.level === activeLevel && (activeTopic === "全部" || video.topic === activeTopic));
  }, [activeLevel, activeTopic, videos]);

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

  function handleAddVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = extractYouTubeId(form.url);
    if (!id) {
      setFormMessage("找不到影片 ID。請貼上 YouTube 影片網址、Shorts 網址、嵌入網址，或直接貼影片 ID。");
      return;
    }
    if (!form.title.trim()) {
      setFormMessage("請填寫影片標題，這樣之後比較好搜尋與辨識。");
      return;
    }
    const newVideo: VideoItem = {
      id,
      title: form.title.trim(),
      channel: form.channel.trim() || "自訂來源",
      level: form.level,
      topic: form.topic,
      reason: form.note.trim() || "由你手動加入的學習影片。",
      confidence: "自訂",
      custom: true,
    };
    const next = [newVideo, ...customVideos.filter((video) => video.id !== id)];
    setCustomVideos(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setActiveLevel(newVideo.level);
    setActiveTopic("全部");
    setSelectedVideoId(newVideo.id);
    setForm(emptyForm);
    setFormMessage("已新增影片。它會保存在這個瀏覽器中，並立刻出現在對應級別。 ");
  }

  function removeCustomVideo(id: string) {
    const next = customVideos.filter((video) => video.id !== id);
    setCustomVideos(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (selectedVideoId === id) setSelectedVideoId(seedVideos[0].id);
    setFormMessage("已移除自訂影片。預設影片不會被刪除。 ");
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
          <div className="hidden items-center gap-3 md:flex">
            <a href="#catalog" className="border border-[#21392f]/30 bg-[#f8f0de]/80 px-4 py-2 text-sm font-semibold tracking-wide shadow-[3px_3px_0_#21392f] transition hover:-translate-y-0.5">影片月台</a>
            <a href="#manage" className="border border-[#21392f]/30 bg-[#f8f0de]/80 px-4 py-2 text-sm font-semibold tracking-wide shadow-[3px_3px_0_#24628f] transition hover:-translate-y-0.5">新增影片</a>
          </div>
        </nav>

        <div className="relative z-10 grid min-h-[calc(100vh-96px)] items-center px-5 pb-16 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-16">
          <div className="max-w-3xl pt-10 lg:pt-0">
            <div className="mb-8 inline-flex items-center gap-2 border border-[#21392f]/25 bg-[#f8f0de]/90 px-3 py-2 text-sm font-semibold shadow-[3px_3px_0_#24628f]">
              <ShieldCheck className="h-4 w-4 text-[#2f5d46]" />
              JLPT N5–N1 影片索引
            </div>
            <h1 className="font-serif text-5xl font-black leading-[0.95] tracking-[-0.04em] text-[#21392f] md:text-7xl lg:text-8xl">
              從 N5 到 N1，沿著日語學習路線前進。
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#314a40] md:text-xl">
              這裡把日文學習影片依 JLPT 級別與主題整理成路線圖。你可以先看精選清單，也可以在下方管理區自己貼上 YouTube 影片，逐步做成自己的日文學習庫。
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a href="#catalog">
                <Button className="h-12 rounded-none bg-[#21392f] px-7 text-base font-bold text-[#fff7e6] shadow-[5px_5px_0_#b7442e] transition hover:-translate-y-1 hover:bg-[#2f5d46]">
                  開始查詢路線
                </Button>
              </a>
              <a href="#manage" className="inline-flex h-12 items-center justify-center border border-[#21392f]/30 bg-[#f8f0de] px-7 text-base font-bold text-[#21392f] shadow-[5px_5px_0_#24628f] transition hover:-translate-y-1">
                自己新增影片
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
              目前預設收錄 {seedVideos.length} 支影片，另可加入你自己的影片。篩選時會把預設影片與自訂影片合併顯示。
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
                        <span className="mt-2 inline-flex border border-[#21392f]/20 px-2 py-0.5 text-xs font-bold">{countsByLevel[item.level]} 支影片</span>
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
                      {selectedVideo.level}｜{selectedVideo.topic}{selectedVideo.custom ? "｜自訂" : ""}
                    </div>
                    <h3 className="font-serif text-2xl font-black leading-tight text-[#21392f] md:text-3xl">{selectedVideo.title}</h3>
                    <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-[#24628f]">來源頻道：{selectedVideo.channel}</p>
                    <p className="mt-4 text-base leading-7 text-[#314a40]">{selectedVideo.reason}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href={`https://www.youtube.com/watch?v=${selectedVideo.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#21392f] bg-[#21392f] px-4 py-2 text-sm font-bold text-[#fff7e6] transition hover:-translate-y-0.5">
                      到 YouTube 原頁 <ExternalLink className="h-4 w-4" />
                    </a>
                    <span className="inline-flex items-center border border-[#21392f]/25 px-4 py-2 text-sm font-bold text-[#21392f]/80">標記：{selectedVideo.confidence}</span>
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

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredVideos.map((video) => (
                  <button
                    key={`${video.custom ? "custom" : "seed"}-${video.id}`}
                    onClick={() => setSelectedVideoId(video.id)}
                    className={`group min-h-[230px] border-2 bg-[#fff8e9] p-5 text-left transition duration-200 ${selectedVideo.id === video.id ? "border-[#b7442e] shadow-[7px_7px_0_#b7442e]" : "border-[#21392f]/20 hover:-translate-y-1 hover:border-[#21392f] hover:shadow-[7px_7px_0_#21392f]"}`}
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

      <section id="manage" className="border-y border-[#21392f]/15 bg-[#21392f] px-5 py-16 text-[#fff7e6] md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.32em] text-[#e6b14a]">Video Manager</p>
            <h2 className="font-serif text-4xl font-black tracking-[-0.03em] md:text-5xl">自己把影片放進去。</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#fff7e6]/80">
              這個管理區先做成本機版後台：你貼上 YouTube 連結、選擇 N5 到 N1 與主題，影片就會加入清單。資料會存在目前瀏覽器，適合先整理自己的學習庫。
            </p>
            <img src={ticketImage} alt="JLPT 分級票券插畫" className="mt-8 hidden w-full border border-[#fff7e6]/20 shadow-[12px_12px_0_#b7442e] lg:block" />
          </div>

          <div className="border-2 border-[#fff7e6] bg-[#f8f0de] p-5 text-[#21392f] shadow-[10px_10px_0_#b7442e] md:p-7">
            <form onSubmit={handleAddVideo} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">YouTube 連結或影片 ID</label>
                <input value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">JLPT 級別</label>
                  <select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value as Level })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]">
                    {levels.map((item) => <option key={item.level} value={item.level}>{item.level}｜{item.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">主題</label>
                  <select value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value as Topic })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]">
                    {topics.filter((topic): topic is Topic => topic !== "全部").map((topic) => <option key={topic} value={topic}>{topic}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">影片標題</label>
                <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" placeholder="例如：N3 聽力逐句解析" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">頻道名稱</label>
                <input value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" placeholder="例如：Elsaの放送" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">備註</label>
                <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} className="min-h-24 w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" placeholder="例如：適合考前複習，老師講解速度清楚。" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="submit" className="h-12 rounded-none bg-[#21392f] px-7 text-base font-bold text-[#fff7e6] shadow-[5px_5px_0_#b7442e] transition hover:-translate-y-1 hover:bg-[#2f5d46]">
                  <Plus className="mr-2 h-4 w-4" /> 新增到影片庫
                </Button>
                <p className="text-sm font-semibold text-[#314a40]">{formMessage}</p>
              </div>
            </form>

            {customVideos.length > 0 && (
              <div className="mt-8 border-t border-[#21392f]/20 pt-6">
                <h3 className="mb-4 font-serif text-2xl font-black">你新增的影片</h3>
                <div className="space-y-3">
                  {customVideos.map((video) => (
                    <div key={video.id} className="flex items-start justify-between gap-4 border border-[#21392f]/20 bg-[#fff8e9] p-4">
                      <div>
                        <p className="text-sm font-black text-[#b7442e]">{video.level}｜{video.topic}</p>
                        <p className="mt-1 font-bold">{video.title}</p>
                        <p className="mt-1 text-sm text-[#314a40]">{video.channel}</p>
                      </div>
                      <button onClick={() => removeCustomVideo(video.id)} className="border border-[#21392f]/30 p-2 text-[#b7442e] transition hover:bg-[#b7442e] hover:text-[#fff7e6]" aria-label="移除自訂影片">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="px-5 py-8 text-sm leading-6 text-[#314a40] md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[#21392f]/15 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="font-bold">Nihongo Video Hub｜目前共 {videos.length} 支影片，包含 {customVideos.length} 支自訂影片。</p>
          <p className="max-w-2xl text-[#314a40]/75">
            小提醒：本站以學習索引方式嵌入公開 YouTube 影片，不下載或重新上傳；若影片作者移除或關閉嵌入，播放結果會依 YouTube 設定為準。
          </p>
        </div>
      </footer>
    </main>
  );
}
