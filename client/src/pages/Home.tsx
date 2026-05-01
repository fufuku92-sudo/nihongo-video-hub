import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ALL_SONG_ARTISTS, ALL_SONG_LEVELS, filterSongs, getSongArtists, type SongFilterLevel } from "@/lib/songFilters";
import { trpc } from "@/lib/trpc";
import { BookOpen, ExternalLink, Headphones, Map, Music2, PlayCircle, Search, ShieldCheck, Train, Video } from "lucide-react";

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
  channelUrl?: string | null;
  level: Level;
  topic: Topic;
  reason: string;
  confidence: "高" | "中" | "自訂";
  custom?: boolean;
};

type SongItem = {
  id: string;
  title: string;
  artist: string;
  channel: string;
  channelUrl?: string | null;
  level: Level;
  mood: string;
  reason: string;
  lyricsUrl?: string | null;
  lyricsNote: string;
  vocabularyNotes: string;
  grammarNotes: string;
  listeningPrompt: string;
};

const heroImage = "https://d2xsxph8kpxj0f.cloudfront.net/310519663615536359/Eo5zKxPE3r647x6NkNQoe5/nihongo_hero_station_map-i92c2aVR2pcivx8nJA773U.webp";

const levels: Array<{ level: Level; label: string; description: string; color: string }> = [
  { level: "N5", label: "初級入門", description: "五十音、基礎句型、日常寒暄", color: "bg-[#2f5d46]" },
  { level: "N4", label: "基礎學習", description: "基礎文法、短文理解、生活會話", color: "bg-[#24628f]" },
  { level: "N3", label: "中級前半", description: "常用語彙、文章銜接、情境聽解", color: "bg-[#b7442e]" },
  { level: "N2", label: "中級後半", description: "抽象表達、新聞讀解、長句解析", color: "bg-[#b48728]" },
  { level: "N1", label: "上級到達", description: "高度讀解、細膩語感、專題聽力", color: "bg-[#272a28]" },
];

const topics: Array<"全部" | Topic> = ["全部", "文法", "單字", "聽解", "讀解", "綜合"];

const seedVideos: VideoItem[] = [
  { id: "3MPbTCqIkuM", channelUrl: "https://www.youtube.com/@journeytojapan_sakina", level: "N5", topic: "文法", title: "JLPT N5 Grammar Practice｜N5 文法過去問解説", channel: "SAKINA | JOURNEY TO JAPAN", reason: "適合作為 N5 文法練習入口，標題與級別明確。", confidence: "高" },
  { id: "0V2Y8AIUugI", channelUrl: "https://www.youtube.com/@nihongo-note", level: "N5", topic: "單字", title: "一次學完所有的 N5 動詞（全126個單字）", channel: "日文筆記本", reason: "以圖文例句整理 N5 動詞，適合初學者建立語彙基礎。", confidence: "高" },
  { id: "x6ICllwCMxE", channelUrl: "https://www.youtube.com/@ListeningJapanese-zhTW", level: "N5", topic: "單字", title: "日檢 N5 必考單字｜名詞篇單字＋例句", channel: "YouTube 日文學習頻道", reason: "以 N5 必考名詞與例句作為語彙補充，適合初學者反覆練習。", confidence: "中" },
  { id: "qRACZeHacpA", channelUrl: "https://www.youtube.com/@ListeningJapanese-zhTW", level: "N5", topic: "單字", title: "日檢 N5 必考單字｜副詞・連體詞・接續詞篇", channel: "YouTube 日文學習頻道", reason: "補充常見副詞與連接語，適合搭配基礎文法學習。", confidence: "中" },
  { id: "6nByRvRMuaY", channelUrl: "https://www.youtube.com/@mochirealjapanese3430", level: "N5", topic: "聽解", title: "JLPT N5 Listening Practice with Mochi Sensei", channel: "Mochi real Japanese", reason: "針對 N5 聽力練習，適合建立初級聽懂速度。", confidence: "高" },
  { id: "j8RgqewE2C0", channelUrl: "https://www.youtube.com/@nihongononakama", level: "N5", topic: "綜合", title: "日本語 N5 初級綜合複習 1｜聽力練習", channel: "日本語の仲間", reason: "整合初級複習與聽力，適合考前整理。", confidence: "高" },
  { id: "8VrmqrSrONA", channelUrl: "https://www.youtube.com/@ElsaJapanese", level: "N5", topic: "讀解", title: "N5 讀解完全攻略｜文法＋單字＋解題", channel: "YouTube 日文學習頻道", reason: "聚焦 N5 讀解解題，補足初級閱讀練習。", confidence: "中" },
  { id: "bTWnm02sObk", channelUrl: "https://www.youtube.com/@Indosensei", level: "N5", topic: "讀解", title: "JLPT N5 Online Course｜Reading Practice", channel: "IndoSensei / YouTube", reason: "以線上課程形式練習 N5 讀解，適合想增加英文輔助材料的學習者。", confidence: "中" },
  { id: "kRTh53juVOU", channelUrl: "https://www.youtube.com/@ElsaJapanese", level: "N4", topic: "文法", title: "N4 日文文法 79 個｜上篇", channel: "Elsaの放送", reason: "涵蓋 N4 必記文法，適合系統化複習。", confidence: "高" },
  { id: "uIS_oika5w4", channelUrl: "https://www.youtube.com/@JapanesewithTaka", level: "N4", topic: "單字", title: "Japanese Basic Vocabulary and Grammar｜JLPT N4", channel: "with Taka", reason: "以 N4 基礎單字與文法為主，適合補強核心能力。", confidence: "中" },
  { id: "w-BvFOMkb40", channelUrl: "https://www.youtube.com/@sunandmoon2019", level: "N4", topic: "聽解", title: "JLPT N4 Listening", channel: "Sun and Moon Channel", reason: "提供 N4 聽解練習，適合搭配通勤或碎片時間。", confidence: "中" },
  { id: "yPeWoZevNcU", channelUrl: "https://www.youtube.com/@ElsaJapanese", level: "N4", topic: "讀解", title: "日語能力測試 N4｜閱讀理解篇", channel: "Elsaの放送", reason: "聚焦閱讀理解並含解說，適合作為 N4 讀解入門。", confidence: "高" },
  { id: "p5vFjq_rQtw", channelUrl: "https://www.youtube.com/@yesjap568", level: "N4", topic: "讀解", title: "JLPT 日語線上課程｜享受日文文章讀解", channel: "YouTube 日文學習頻道", reason: "以閱讀文章為主，適合 N4 到 N3 過渡期增加閱讀量。", confidence: "中" },
  { id: "cRSAqhqPWG4", channelUrl: "https://www.youtube.com/@wusjp", level: "N4", topic: "單字", title: "日檢 N5-N1 必備單字・動詞補充", channel: "YouTube Shorts", reason: "短影片形式可作為單字碎片複習，適合補充清單。", confidence: "中" },
  { id: "vpfwGneh4W4", channelUrl: "https://www.youtube.com/@ElsaJapanese", level: "N3", topic: "聽解", title: "這樣聽懂 N3 聽力｜完整逐句解析", channel: "Elsaの放送", reason: "逐句解析 N3 聽力，有助理解句子連音與語境。", confidence: "高" },
  { id: "OuAtfP3-pk8", channelUrl: "https://www.youtube.com/@ElsaJapanese", level: "N3", topic: "聽解", title: "JLPT N3 聽力 20 分鐘免費練習", channel: "Elsaの放送", reason: "以對話解析與例句教學降低 N3 聽力門檻。", confidence: "高" },
  { id: "w9AQ5a6-acU", channelUrl: "https://www.youtube.com/@johnysensei", level: "N3", topic: "綜合", title: "JLPT 考題改革趨勢與準備方式", channel: "抓尼先生 / 學日文 & 日本大小事", reason: "整理單字、文法、讀解與聽解準備策略。", confidence: "高" },
  { id: "_EgMcR2a0-4", channelUrl: "https://www.youtube.com/@shuwoon", level: "N3", topic: "單字", title: "一次聽完 250 個 N3 單字｜語彙聽力跟讀", channel: "旭文日本語學院", reason: "透過聽力與跟讀強化 N3 詞彙記憶。", confidence: "高" },
  { id: "aUjo01G1O2U", channelUrl: "https://www.youtube.com/@NihonnoNeko", level: "N3", topic: "綜合", title: "Japanese Self Study Tips for N5 N4 N3 N2 and N1", channel: "Nihonno Neko / YouTube", reason: "適合作為自學方法補充，尤其可用於 N3 之後規劃讀書節奏。", confidence: "中" },
  { id: "DKzxO7ujP58", channelUrl: "https://www.youtube.com/@AraiAcademyofJapaneseStudies", level: "N3", topic: "綜合", title: "JLPT N5 N4 N3 N2 N1 準備提醒與學習方向", channel: "Arai Academy / YouTube", reason: "提供跨級別考前提醒，可放在中級階段作為策略影片。", confidence: "中" },
  { id: "JHikaTQAJVQ", channelUrl: "https://www.youtube.com/@ElsaJapanese", level: "N2", topic: "文法", title: "N2 文法 144 個｜上篇", channel: "Elsaの放送", reason: "整理 N2 常見文法，適合中高級考生建立清單。", confidence: "高" },
  { id: "YWDC6z5DFkM", channelUrl: "https://www.youtube.com/@nihongonomori_taiwan", level: "N2", topic: "文法", title: "N2 攻略大全｜文法問題 50 題", channel: "日本語之森台灣", reason: "以題目演練方式檢查 N2 文法熟悉度。", confidence: "高" },
  { id: "cOa2dNx28xg", channelUrl: "https://www.youtube.com/@%E6%97%A5%E6%9C%AC%E6%8B%A9%E4%BC%98%E8%BF%9B%E5%AD%A6%E5%A1%BE", level: "N2", topic: "文法", title: "10 小時帶你拿下 N2 語法｜高頻語法總結", channel: "日本择优进学塾", reason: "長時段整理高頻語法，可作為集中複習材料。", confidence: "中" },
  { id: "CkRE2ZoXNOc", channelUrl: "https://www.youtube.com/@inouesensei", level: "N2", topic: "單字", title: "日語檢定 N2 重要單字 part1", channel: "井上一宏", reason: "針對 N2 重要單字，適合分段背誦。", confidence: "高" },
  { id: "j_qqHQtUOzw", channelUrl: "https://www.youtube.com/@ElsaJapanese", level: "N1", topic: "文法", title: "N1 文法 141 個｜上篇", channel: "Elsaの放送", reason: "系統整理 N1 文法，適合進入高級句型複習。", confidence: "高" },
  { id: "r5rNHrJg-7I", channelUrl: "https://www.youtube.com/@MultiLanguagePractice", level: "N1", topic: "聽解", title: "5 HRs Immerse Japanese Listening JLPT N1", channel: "Multi Language Practice", reason: "長時間沉浸式 N1 聽力訓練，適合建立耐力。", confidence: "高" },
  { id: "_Beflvl8PAs", channelUrl: "https://www.youtube.com/@ElsaJapanese", level: "N1", topic: "單字", title: "N1 1500 單字｜上篇", channel: "Elsaの放送", reason: "聚焦 N1 高階詞彙，適合作為語彙清單。", confidence: "高" },
  { id: "F0ctfIuXKHQ", channelUrl: "https://www.youtube.com/@CarlosCoordinator", level: "N1", topic: "讀解", title: "Master JLPT N1 Reading Comprehension", channel: "CarlosCoordinator", reason: "聚焦 N1 讀解策略，適合補強長文理解。", confidence: "中" },
];

function topicIcon(topic: Topic) {
  if (topic === "聽解") return <Headphones className="h-4 w-4" />;
  if (topic === "單字") return <BookOpen className="h-4 w-4" />;
  if (topic === "讀解") return <Search className="h-4 w-4" />;
  if (topic === "綜合") return <Map className="h-4 w-4" />;
  return <Video className="h-4 w-4" />;
}


function filteredVideoFallback(videos: VideoItem[], activeLevel: Level, activeTopic: "全部" | Topic) {
  const preferred = videos.find((video) => video.level === activeLevel && (activeTopic === "全部" || video.topic === activeTopic));
  return preferred?.id ?? videos[0]?.id ?? seedVideos[0].id;
}

export default function Home() {
  const { data: databaseVideos = [] } = trpc.videos.list.useQuery();
  const { data: databaseSongs = [] } = trpc.songs.list.useQuery();

  const [activeLevel, setActiveLevel] = useState<Level>("N5");
  const [activeTopic, setActiveTopic] = useState<"全部" | Topic>("全部");
  const [selectedVideoId, setSelectedVideoId] = useState(seedVideos[0].id);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [activeSongArtist, setActiveSongArtist] = useState(ALL_SONG_ARTISTS);
  const [activeSongLevel, setActiveSongLevel] = useState<SongFilterLevel>(ALL_SONG_LEVELS);

  const customVideos = useMemo<VideoItem[]>(() => {
    return databaseVideos.map((video) => ({
      id: video.youtubeId,
      title: video.title,
      channel: video.channel,
      channelUrl: video.channelUrl,
      level: video.level as Level,
      topic: video.topic as Topic,
      reason: video.reason || "由內容維護新增的學習影片。",
      confidence: "自訂",
      custom: true,
    }));
  }, [databaseVideos]);

  const videos = useMemo(() => [...customVideos, ...seedVideos], [customVideos]);

  const songs = useMemo<SongItem[]>(() => {
    return databaseSongs.map((song) => ({
      id: song.youtubeId,
      title: song.title,
      artist: song.artist,
      channel: song.channel,
      channelUrl: song.channelUrl,
      level: song.level as Level,
      mood: song.mood || "日文歌",
      reason: song.reason || "由內容維護新增的日文歌曲。",
      lyricsUrl: song.lyricsUrl,
      lyricsNote: song.lyricsNote || "請參考官方或授權歌詞來源搭配學習。",
      vocabularyNotes: song.vocabularyNotes || "可補充常見單字、片假名或慣用語。",
      grammarNotes: song.grammarNotes || "可補充句型、助詞或口語表現。",
      listeningPrompt: song.listeningPrompt || "先聽副歌，再回到整首歌練習辨音與跟唱。",
    }));
  }, [databaseSongs]);

  const songArtists = useMemo(() => getSongArtists(songs), [songs]);

  const filteredSongs = useMemo(() => filterSongs(songs, activeSongArtist, activeSongLevel), [activeSongArtist, activeSongLevel, songs]);

  const selectedSong = filteredSongs.find((song) => song.id === selectedSongId) ?? filteredSongs[0];

  useEffect(() => {
    if (!videos.some((video) => video.id === selectedVideoId)) {
      setSelectedVideoId(filteredVideoFallback(videos, activeLevel, activeTopic));
    }
  }, [activeLevel, activeTopic, selectedVideoId, videos]);

  useEffect(() => {
    if (filteredSongs.length === 0) {
      setSelectedSongId(null);
      return;
    }

    if (!selectedSongId || !filteredSongs.some((song) => song.id === selectedSongId)) {
      setSelectedSongId(filteredSongs[0].id);
    }
  }, [filteredSongs, selectedSongId]);

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
            <a href="#songs" className="border border-[#21392f]/30 bg-[#f8f0de]/80 px-4 py-2 text-sm font-semibold tracking-wide shadow-[3px_3px_0_#b7442e] transition hover:-translate-y-0.5">日文歌曲</a>
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
              這裡整理多個 YouTube 頻道提供的優質日文學習影片，依 JLPT 級別與主題做成免費學習路線圖。本站以非營利方式協助學習者快速找到適合內容，並將流量導回原影片與原作者。
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a href="#catalog">
                <Button className="h-12 rounded-none bg-[#21392f] px-7 text-base font-bold text-[#fff7e6] shadow-[5px_5px_0_#b7442e] transition hover:-translate-y-1 hover:bg-[#2f5d46]">
                  開始查詢路線
                </Button>
              </a>
              <a href="#songs" className="inline-flex h-12 items-center justify-center border border-[#21392f]/30 bg-[#f8f0de] px-7 text-base font-bold text-[#21392f] shadow-[5px_5px_0_#24628f] transition hover:-translate-y-1">
                查看日文歌曲
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
              這份清單會持續整理與補充公開 YouTube 學習資源。所有影片皆保留原頻道名稱與 YouTube 連結，本站只做分類、索引與學習導覽，方便大家免費學習。
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
                    {selectedVideo.channelUrl ? (
                      <a href={selectedVideo.channelUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#24628f] bg-[#f8f0de] px-4 py-2 text-sm font-bold text-[#24628f] transition hover:-translate-y-0.5 hover:bg-[#24628f] hover:text-[#fff7e6]">
                        前往原頻道 <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
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
                  <article
                    key={`${video.custom ? "custom" : "seed"}-${video.id}`}
                    className={`group flex min-h-[250px] flex-col border-2 bg-[#fff8e9] p-5 text-left transition duration-200 ${selectedVideo.id === video.id ? "border-[#b7442e] shadow-[7px_7px_0_#b7442e]" : "border-[#21392f]/20 hover:-translate-y-1 hover:border-[#21392f] hover:shadow-[7px_7px_0_#21392f]"}`}
                  >
                    <button type="button" onClick={() => setSelectedVideoId(video.id)} className="flex flex-1 flex-col text-left">
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
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-[#21392f]/15 pt-4">
                      <button type="button" onClick={() => setSelectedVideoId(video.id)} className="inline-flex items-center gap-2 border border-[#21392f] bg-[#21392f] px-3 py-2 text-xs font-black text-[#fff7e6] transition hover:-translate-y-0.5">
                        播放影片 <PlayCircle className="h-3.5 w-3.5" />
                      </button>
                      {video.channelUrl ? (
                        <a href={video.channelUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#24628f] bg-[#f8f0de] px-3 py-2 text-xs font-black text-[#24628f] transition hover:-translate-y-0.5 hover:bg-[#24628f] hover:text-[#fff7e6]">
                          前往原頻道 <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      <section id="songs" className="relative border-y border-[#21392f]/15 bg-[#21392f] px-5 py-16 text-[#fff7e6] md:px-10 lg:px-16">
        <div className="absolute inset-0 bg-[url('https://d2xsxph8kpxj0f.cloudfront.net/310519663615536359/Eo5zKxPE3r647x6NkNQoe5/nihongo_paper_pattern-2qjVZvdvYrMsj2KwtsxgWV.webp')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-10 grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.32em] text-[#f1b35b]">Song Study</p>
              <h2 className="font-serif text-4xl font-black tracking-[-0.03em] md:text-6xl">日文歌曲學習區</h2>
            </div>
            <p className="max-w-3xl text-base leading-7 text-[#f4ecd8]/85">
              這裡可放你喜歡的日文歌，搭配官方或授權歌詞來源、單字重點、文法提示與聽力練習。本站不自動產生或重製商業歌曲完整歌詞，而是協助整理合規的學習導覽。
            </p>
          </div>

          {songs.length > 0 ? (
            <div className="mb-8 border-2 border-[#f4ecd8]/30 bg-[#fff8e9]/10 p-5 shadow-[8px_8px_0_#24628f]">
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                <label className="block">
                  <span className="mb-2 block text-sm font-black tracking-[0.18em] text-[#f1b35b]">依歌手篩選</span>
                  <select
                    value={activeSongArtist}
                    onChange={(event) => setActiveSongArtist(event.target.value)}
                    className="h-12 w-full rounded-none border-2 border-[#f4ecd8]/45 bg-[#f8f0de] px-4 text-sm font-bold text-[#21392f] outline-none transition focus:border-[#f1b35b]"
                  >
                    <option value={ALL_SONG_ARTISTS}>全部歌手</option>
                    {songArtists.map((artist) => (
                      <option key={artist} value={artist}>{artist}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-black tracking-[0.18em] text-[#f1b35b]">依難度篩選</span>
                  <select
                    value={activeSongLevel}
                    onChange={(event) => setActiveSongLevel(event.target.value as SongFilterLevel)}
                    className="h-12 w-full rounded-none border-2 border-[#f4ecd8]/45 bg-[#f8f0de] px-4 text-sm font-bold text-[#21392f] outline-none transition focus:border-[#f1b35b]"
                  >
                    <option value={ALL_SONG_LEVELS}>全部難度</option>
                    {levels.map((item) => (
                      <option key={item.level} value={item.level}>{item.level}｜{item.label}</option>
                    ))}
                  </select>
                </label>
                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                  <span className="inline-flex h-12 items-center justify-center border border-[#f4ecd8]/40 px-4 text-sm font-black text-[#fff7e6]">
                    顯示 {filteredSongs.length} / {songs.length} 首
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSongArtist(ALL_SONG_ARTISTS);
                      setActiveSongLevel(ALL_SONG_LEVELS);
                    }}
                    className="h-12 border border-[#f1b35b] bg-[#f8f0de] px-4 text-sm font-black text-[#21392f] transition hover:-translate-y-0.5 hover:bg-[#f1b35b]"
                  >
                    重設篩選
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {songs.length === 0 ? (
            <div className="border-2 border-[#f4ecd8]/30 bg-[#f8f0de] p-8 text-[#21392f] shadow-[10px_10px_0_#b7442e]">
              <Music2 className="mb-4 h-9 w-9 text-[#b7442e]" />
              <h3 className="font-serif text-3xl font-black">目前還沒有新增歌曲。</h3>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#314a40]">管理員可以到後台新增 YouTube 歌曲連結、歌手、官方歌詞來源與學習重點。新增後會自動出現在這個區塊。</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="border-2 border-[#f4ecd8]/30 bg-[#f8f0de] p-8 text-[#21392f] shadow-[10px_10px_0_#b7442e]">
              <Search className="mb-4 h-9 w-9 text-[#24628f]" />
              <h3 className="font-serif text-3xl font-black">沒有符合篩選條件的歌曲。</h3>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#314a40]">請改選其他歌手或難度，或按「重設篩選」回到完整歌曲清單。</p>
            </div>
          ) : selectedSong ? (
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="border-2 border-[#f4ecd8] bg-[#fff7e6] p-4 text-[#21392f] shadow-[10px_10px_0_#b7442e]">
                <div className="aspect-video overflow-hidden border border-[#21392f]/30 bg-[#21392f]">
                  <iframe key={selectedSong.id} className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${selectedSong.id}`} title={selectedSong.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                </div>
                <div className="mt-5">
                  <div className="mb-4 inline-flex items-center gap-2 bg-[#b7442e] px-3 py-1 text-sm font-black text-[#fff7e6]">
                    <Music2 className="h-4 w-4" /> {selectedSong.level}｜{selectedSong.mood}
                  </div>
                  <h3 className="font-serif text-3xl font-black leading-tight">{selectedSong.title}</h3>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-[#24628f]">{selectedSong.artist}｜{selectedSong.channel}</p>
                  <p className="mt-4 text-base leading-7 text-[#314a40]">{selectedSong.reason}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href={`https://www.youtube.com/watch?v=${selectedSong.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#21392f] bg-[#21392f] px-4 py-2 text-sm font-bold text-[#fff7e6] transition hover:-translate-y-0.5">到 YouTube 原頁 <ExternalLink className="h-4 w-4" /></a>
                    {selectedSong.lyricsUrl ? <a href={selectedSong.lyricsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#24628f] bg-[#f8f0de] px-4 py-2 text-sm font-bold text-[#24628f] transition hover:-translate-y-0.5 hover:bg-[#24628f] hover:text-[#fff7e6]">官方／授權歌詞來源 <ExternalLink className="h-4 w-4" /></a> : null}
                    {selectedSong.channelUrl ? <a href={selectedSong.channelUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#2f5d46] bg-[#f8f0de] px-4 py-2 text-sm font-bold text-[#2f5d46] transition hover:-translate-y-0.5 hover:bg-[#2f5d46] hover:text-[#fff7e6]">前往原頻道 <ExternalLink className="h-4 w-4" /></a> : null}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-[#f4ecd8]/30 bg-[#f8f0de] p-5 text-[#21392f] shadow-[6px_6px_0_#24628f]">
                  <h4 className="font-serif text-2xl font-black">歌詞與版權備註</h4>
                  <p className="mt-3 text-sm leading-6 text-[#314a40]">{selectedSong.lyricsNote}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  <div className="border border-[#f4ecd8]/30 bg-[#fff8e9] p-5 text-[#21392f]"><h4 className="font-black text-[#b7442e]">單字重點</h4><p className="mt-2 text-sm leading-6 text-[#314a40]">{selectedSong.vocabularyNotes}</p></div>
                  <div className="border border-[#f4ecd8]/30 bg-[#fff8e9] p-5 text-[#21392f]"><h4 className="font-black text-[#b7442e]">文法重點</h4><p className="mt-2 text-sm leading-6 text-[#314a40]">{selectedSong.grammarNotes}</p></div>
                  <div className="border border-[#f4ecd8]/30 bg-[#fff8e9] p-5 text-[#21392f]"><h4 className="font-black text-[#b7442e]">聽力練習</h4><p className="mt-2 text-sm leading-6 text-[#314a40]">{selectedSong.listeningPrompt}</p></div>
                </div>
              </div>
            </div>
          ) : null}

          {filteredSongs.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredSongs.map((song) => (
                <button key={song.id} type="button" onClick={() => setSelectedSongId(song.id)} className={`border-2 p-5 text-left transition ${selectedSong?.id === song.id ? "border-[#f1b35b] bg-[#f8f0de] text-[#21392f] shadow-[7px_7px_0_#f1b35b]" : "border-[#f4ecd8]/25 bg-[#fff8e9]/10 text-[#fff7e6] hover:-translate-y-1 hover:border-[#f4ecd8]"}`}>
                  <span className="inline-flex items-center gap-2 bg-[#b7442e] px-3 py-1 text-sm font-black text-[#fff7e6]"><Music2 className="h-4 w-4" /> {song.level}</span>
                  <h4 className="mt-4 font-serif text-xl font-black leading-snug">{song.title}</h4>
                  <p className={`mt-2 text-sm font-bold ${selectedSong?.id === song.id ? "text-[#24628f]" : "text-[#f4ecd8]/80"}`}>{song.artist}</p>
                  <p className={`mt-3 text-sm leading-6 ${selectedSong?.id === song.id ? "text-[#314a40]" : "text-[#f4ecd8]/75"}`}>{song.reason}</p>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <footer className="px-5 py-8 text-sm leading-6 text-[#314a40] md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[#21392f]/15 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="font-bold">Nihongo Video Hub｜免費、非營利的 YouTube 日文學習影片整合平台。</p>
            <a href="/sources" className="w-fit font-bold text-[#b7442e] underline-offset-4 transition hover:text-[#8f2f1f] hover:underline">
              來源聲明
            </a>
          </div>
          <p className="max-w-2xl text-[#314a40]/75">
            感謝各 YouTube 頻道與創作者提供公開且實用的日文學習資源。本站不下載、不重新上傳，也不販售內容；僅整理影片資訊並導向原頁觀看，希望協助學習者找到好內容，同時增加原創作者的曝光。
          </p>
        </div>
      </footer>
    </main>
  );
}
