export type PodcastLevel = "N5" | "N4" | "N3" | "N2" | "N1" | "all";

export type PodcastItem = {
  id: string;
  title: string;
  host: string;
  platform: "Spotify" | "Apple Podcasts" | "YouTube" | "其他";
  platformUrl?: string | null;
  level: PodcastLevel;
  category: string;
  description: string;
  episodeCount?: number;
  updateFrequency?: string;
};

export const seedPodcasts: PodcastItem[] = [
  {
    id: "nhk-easy-japanese",
    title: "NHK Easy Japanese",
    host: "NHK World",
    platform: "Spotify",
    platformUrl: "https://open.spotify.com/show/1KqKGKJqKqKqKqKqKqKqKq",
    level: "N5",
    category: "初級日文",
    description: "NHK 官方推出的初級日文學習 Podcast，每集介紹日常用語與基礎文法。",
    episodeCount: 200,
    updateFrequency: "每週更新",
  },
  {
    id: "marugoto-online",
    title: "まるごと日本語オンライン",
    host: "国際交流基金",
    platform: "YouTube",
    platformUrl: "https://www.youtube.com/@marugotoonline",
    level: "N4",
    category: "中級日文",
    description: "國際交流基金製作的系統化日文學習 Podcast，涵蓋語法、單字與文化。",
    episodeCount: 150,
    updateFrequency: "每週更新",
  },
  {
    id: "nihongo-no-mori",
    title: "日本語の森",
    host: "日本語の森",
    platform: "YouTube",
    platformUrl: "https://www.youtube.com/@nihongonomori",
    level: "N3",
    category: "中級日文",
    description: "針對 JLPT 考生的日文學習 Podcast，重點講解常見文法與考試技巧。",
    episodeCount: 300,
    updateFrequency: "每週更新",
  },
  {
    id: "slow-japanese",
    title: "Slow Japanese",
    host: "Slow Japanese",
    platform: "Spotify",
    platformUrl: "https://open.spotify.com/show/slowjapanese",
    level: "N4",
    category: "聽力練習",
    description: "以較慢速度朗讀日文新聞與故事，適合初中級聽力練習。",
    episodeCount: 500,
    updateFrequency: "每日更新",
  },
  {
    id: "nihongo-quest",
    title: "日本語クエスト",
    host: "Nihongo Quest",
    platform: "Apple Podcasts",
    platformUrl: "https://podcasts.apple.com/podcast/nihongo-quest",
    level: "N3",
    category: "文化與語言",
    description: "透過故事與冒險學習日文，融合日本文化與語言知識。",
    episodeCount: 100,
    updateFrequency: "每週更新",
  },
  {
    id: "japan-times-podcast",
    title: "Japan Times Podcast",
    host: "Japan Times",
    platform: "Spotify",
    platformUrl: "https://open.spotify.com/show/japantimes",
    level: "N2",
    category: "新聞與時事",
    description: "日本時報推出的英日雙語 Podcast，介紹日本時事與文化。",
    episodeCount: 200,
    updateFrequency: "每週更新",
  },
  {
    id: "tokyo-fm-podcast",
    title: "Tokyo FM Podcast",
    host: "Tokyo FM",
    platform: "YouTube",
    platformUrl: "https://www.youtube.com/@tokyofm",
    level: "N2",
    category: "廣播節目",
    description: "東京 FM 官方 Podcast，包含音樂、訪談與日本流行文化。",
    episodeCount: 400,
    updateFrequency: "每週更新",
  },
  {
    id: "asahi-shimbun-podcast",
    title: "朝日新聞ポッドキャスト",
    host: "朝日新聞",
    platform: "Spotify",
    platformUrl: "https://open.spotify.com/show/asahi",
    level: "N1",
    category: "新聞與評論",
    description: "朝日新聞推出的新聞評論 Podcast，涵蓋政治、經濟與社會議題。",
    episodeCount: 250,
    updateFrequency: "每週更新",
  },
];

export function getPodcastsByLevel(podcasts: PodcastItem[], level: PodcastLevel): PodcastItem[] {
  if (level === "all") return podcasts;
  return podcasts.filter((podcast) => podcast.level === level || podcast.level === "all");
}

export function getPodcastsByCategory(podcasts: PodcastItem[], category: string): PodcastItem[] {
  return podcasts.filter((podcast) => podcast.category === category);
}

export function getAllCategories(podcasts: PodcastItem[]): string[] {
  const categories = new Set(podcasts.map((p) => p.category));
  return Array.from(categories).sort();
}
