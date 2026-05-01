import { FormEvent, useMemo, useState } from "react";

import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Lock, LogOut, Music2, Pencil, Plus, ShieldCheck, Train, Trash2, X } from "lucide-react";

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

type VideoFormState = {
  url: string;
  title: string;
  channel: string;
  channelUrl: string;
  level: Level;
  topic: Topic;
  note: string;
};

type SongFormState = {
  url: string;
  title: string;
  artist: string;
  channel: string;
  channelUrl: string;
  level: Level;
  mood: string;
  reason: string;
  lyricsUrl: string;
  lyricsNote: string;
  vocabularyNotes: string;
  grammarNotes: string;
  listeningPrompt: string;
};

const levels: Array<{ level: Level; label: string }> = [
  { level: "N5", label: "初級入門" },
  { level: "N4", label: "基礎學習" },
  { level: "N3", label: "中級前半" },
  { level: "N2", label: "中級後半" },
  { level: "N1", label: "上級到達" },
];

const topics: Topic[] = ["文法", "單字", "聽解", "讀解", "綜合"];

const emptyVideoForm: VideoFormState = {
  url: "",
  title: "",
  channel: "",
  channelUrl: "",
  level: "N5",
  topic: "文法",
  note: "",
};

const emptySongForm: SongFormState = {
  url: "",
  title: "",
  artist: "",
  channel: "",
  channelUrl: "",
  level: "N5",
  mood: "日文歌",
  reason: "",
  lyricsUrl: "",
  lyricsNote: "",
  vocabularyNotes: "",
  grammarNotes: "",
  listeningPrompt: "",
};

const ticketImage = "https://d2xsxph8kpxj0f.cloudfront.net/310519663615536359/Eo5zKxPE3r647x6NkNQoe5/nihongo_ticket_cards-9MdMarHp8aRGqMYTv5me3J.webp";

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

export default function Admin() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const utils = trpc.useUtils();
  const { data: databaseVideos = [], isLoading: videosLoading } = trpc.videos.list.useQuery();
  const { data: databaseSongs = [], isLoading: songsLoading } = trpc.songs.list.useQuery();

  const [videoForm, setVideoForm] = useState<VideoFormState>(emptyVideoForm);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editVideoForm, setEditVideoForm] = useState<VideoFormState>(emptyVideoForm);
  const [videoMessage, setVideoMessage] = useState("請以管理員帳號登入後維護資料庫影片。");

  const [songForm, setSongForm] = useState<SongFormState>(emptySongForm);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [editSongForm, setEditSongForm] = useState<SongFormState>(emptySongForm);
  const [songMessage, setSongMessage] = useState("可新增日文歌 YouTube 連結、官方歌詞來源與學習重點；不建議貼上未授權完整歌詞。");

  const customVideos = useMemo<VideoItem[]>(() => {
    return databaseVideos.map((video) => ({
      id: video.youtubeId,
      title: video.title,
      channel: video.channel,
      channelUrl: video.channelUrl ?? null,
      level: video.level as Level,
      topic: video.topic as Topic,
      reason: video.reason || "由管理員新增的學習影片。",
    }));
  }, [databaseVideos]);

  const songs = useMemo<SongItem[]>(() => {
    return databaseSongs.map((song) => ({
      id: song.youtubeId,
      title: song.title,
      artist: song.artist,
      channel: song.channel,
      channelUrl: song.channelUrl ?? null,
      level: song.level as Level,
      mood: song.mood || "日文歌",
      reason: song.reason || "由管理員新增的日文歌曲。",
      lyricsUrl: song.lyricsUrl ?? null,
      lyricsNote: song.lyricsNote || "請使用官方歌詞頁或已授權來源搭配學習。",
      vocabularyNotes: song.vocabularyNotes || "可補充常見單字、片假名或慣用語。",
      grammarNotes: song.grammarNotes || "可補充句型、助詞或口語表現。",
      listeningPrompt: song.listeningPrompt || "先聽副歌，再回到整首歌練習辨音與跟唱。",
    }));
  }, [databaseSongs]);

  const addVideoMutation = trpc.videos.add.useMutation({
    onSuccess: async () => {
      await utils.videos.list.invalidate();
      setVideoForm(emptyVideoForm);
      setVideoMessage("已新增到資料庫。公開頁面的影片清單會同步顯示這支影片。");
    },
    onError: (mutationError) => setVideoMessage(mutationError.message || "新增失敗，請確認你已登入且具有管理員權限。"),
  });

  const updateVideoMutation = trpc.videos.update.useMutation({
    onSuccess: async () => {
      await utils.videos.list.invalidate();
      setEditingVideoId(null);
      setEditVideoForm(emptyVideoForm);
      setVideoMessage("已更新影片資訊。標題、級別與備註會同步到資料庫。");
    },
    onError: (mutationError) => setVideoMessage(mutationError.message || "更新失敗，請確認你已登入且具有管理員權限。"),
  });

  const deleteVideoMutation = trpc.videos.delete.useMutation({
    onSuccess: async (_result, variables) => {
      await utils.videos.list.invalidate();
      if (editingVideoId === variables.youtubeId) setEditingVideoId(null);
      setVideoMessage("已從資料庫移除自訂影片。預設影片不會被刪除。");
    },
    onError: (mutationError) => setVideoMessage(mutationError.message || "刪除失敗，請確認你已登入且具有管理員權限。"),
  });

  const addSongMutation = trpc.songs.add.useMutation({
    onSuccess: async () => {
      await utils.songs.list.invalidate();
      setSongForm(emptySongForm);
      setSongMessage("已新增到歌曲區。公開首頁會顯示這首歌與學習重點。");
    },
    onError: (mutationError) => setSongMessage(mutationError.message || "新增歌曲失敗，請確認你已登入且具有管理員權限。"),
  });

  const updateSongMutation = trpc.songs.update.useMutation({
    onSuccess: async () => {
      await utils.songs.list.invalidate();
      setEditingSongId(null);
      setEditSongForm(emptySongForm);
      setSongMessage("已更新歌曲資訊與學習輔助欄位。");
    },
    onError: (mutationError) => setSongMessage(mutationError.message || "更新歌曲失敗，請確認你已登入且具有管理員權限。"),
  });

  const deleteSongMutation = trpc.songs.delete.useMutation({
    onSuccess: async (_result, variables) => {
      await utils.songs.list.invalidate();
      if (editingSongId === variables.youtubeId) setEditingSongId(null);
      setSongMessage("已從歌曲區移除這首歌。");
    },
    onError: (mutationError) => setSongMessage(mutationError.message || "刪除歌曲失敗，請確認你已登入且具有管理員權限。"),
  });

  const isAdmin = user?.role === "admin";
  const isMutating = addVideoMutation.isPending || updateVideoMutation.isPending || deleteVideoMutation.isPending || addSongMutation.isPending || updateSongMutation.isPending || deleteSongMutation.isPending;

  function handleLogin() {
    window.location.href = getLoginUrl("/admin");
  }

  function handleLogout() {
    logout();
    setVideoForm(emptyVideoForm);
    setSongForm(emptySongForm);
    setEditingVideoId(null);
    setEditingSongId(null);
    setVideoMessage("已登出。請以管理員帳號登入後再維護影片。");
    setSongMessage("已登出。請以管理員帳號登入後再維護歌曲。");
  }

  function handleAddVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdmin) {
      setVideoMessage(isAuthenticated ? "此帳號不是管理員，無法新增影片。" : "請先登入管理員帳號，才能新增影片。");
      return;
    }
    const id = extractYouTubeId(videoForm.url);
    if (!id) {
      setVideoMessage("找不到影片 ID。請貼上 YouTube 影片網址、Shorts 網址、嵌入網址，或直接貼影片 ID。");
      return;
    }
    if (!videoForm.title.trim()) {
      setVideoMessage("請填寫影片標題，這樣之後比較好搜尋與辨識。");
      return;
    }
    addVideoMutation.mutate({
      youtubeId: id,
      title: videoForm.title.trim(),
      channel: videoForm.channel.trim() || "自訂來源",
      channelUrl: videoForm.channelUrl.trim() || undefined,
      level: videoForm.level,
      topic: videoForm.topic,
      reason: videoForm.note.trim() || "由管理員新增的學習影片。",
    });
  }

  function startEditVideo(video: VideoItem) {
    if (!isAdmin) {
      setVideoMessage(isAuthenticated ? "此帳號不是管理員，無法編輯影片。" : "請先登入管理員帳號，才能編輯影片。");
      return;
    }
    setEditingVideoId(video.id);
    setEditVideoForm({ url: video.id, title: video.title, channel: video.channel, channelUrl: video.channelUrl ?? "", level: video.level, topic: video.topic, note: video.reason });
    setVideoMessage("正在編輯影片資訊；可修改標題、JLPT 級別與備註。");
  }

  function handleUpdateVideo(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    if (!isAdmin) {
      setVideoMessage(isAuthenticated ? "此帳號不是管理員，無法編輯影片。" : "請先登入管理員帳號，才能編輯影片。");
      return;
    }
    if (!editVideoForm.title.trim()) {
      setVideoMessage("請填寫影片標題，才能儲存編輯結果。");
      return;
    }
    updateVideoMutation.mutate({
      youtubeId: id,
      title: editVideoForm.title.trim(),
      channel: editVideoForm.channel.trim() || "自訂來源",
      channelUrl: editVideoForm.channelUrl.trim() || undefined,
      level: editVideoForm.level,
      reason: editVideoForm.note.trim() || "由管理員新增的學習影片。",
    });
  }

  function handleAddSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdmin) {
      setSongMessage(isAuthenticated ? "此帳號不是管理員，無法新增歌曲。" : "請先登入管理員帳號，才能新增歌曲。");
      return;
    }
    const id = extractYouTubeId(songForm.url);
    if (!id) {
      setSongMessage("找不到歌曲影片 ID。請貼上 YouTube 歌曲網址或影片 ID。");
      return;
    }
    if (!songForm.title.trim() || !songForm.artist.trim()) {
      setSongMessage("請至少填寫歌曲名稱與歌手名稱。");
      return;
    }
    addSongMutation.mutate({
      youtubeId: id,
      title: songForm.title.trim(),
      artist: songForm.artist.trim(),
      channel: songForm.channel.trim() || "官方或授權頻道",
      channelUrl: songForm.channelUrl.trim() || undefined,
      level: songForm.level,
      mood: songForm.mood.trim() || "日文歌",
      reason: songForm.reason.trim() || "由管理員新增的日文歌曲。",
      lyricsUrl: songForm.lyricsUrl.trim() || undefined,
      lyricsNote: songForm.lyricsNote.trim() || "請使用官方歌詞頁或已授權來源搭配學習。",
      vocabularyNotes: songForm.vocabularyNotes.trim() || "可補充常見單字、片假名或慣用語。",
      grammarNotes: songForm.grammarNotes.trim() || "可補充句型、助詞或口語表現。",
      listeningPrompt: songForm.listeningPrompt.trim() || "先聽副歌，再回到整首歌練習辨音與跟唱。",
    });
  }

  function startEditSong(song: SongItem) {
    if (!isAdmin) {
      setSongMessage(isAuthenticated ? "此帳號不是管理員，無法編輯歌曲。" : "請先登入管理員帳號，才能編輯歌曲。 ");
      return;
    }
    setEditingSongId(song.id);
    setEditSongForm({
      url: song.id,
      title: song.title,
      artist: song.artist,
      channel: song.channel,
      channelUrl: song.channelUrl ?? "",
      level: song.level,
      mood: song.mood,
      reason: song.reason,
      lyricsUrl: song.lyricsUrl ?? "",
      lyricsNote: song.lyricsNote,
      vocabularyNotes: song.vocabularyNotes,
      grammarNotes: song.grammarNotes,
      listeningPrompt: song.listeningPrompt,
    });
    setSongMessage("正在編輯歌曲資訊；可更新歌詞來源、學習重點與聽力提示。");
  }

  function handleUpdateSong(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    if (!isAdmin) {
      setSongMessage(isAuthenticated ? "此帳號不是管理員，無法編輯歌曲。" : "請先登入管理員帳號，才能編輯歌曲。 ");
      return;
    }
    if (!editSongForm.title.trim() || !editSongForm.artist.trim()) {
      setSongMessage("請至少填寫歌曲名稱與歌手名稱，才能儲存。");
      return;
    }
    updateSongMutation.mutate({
      youtubeId: id,
      title: editSongForm.title.trim(),
      artist: editSongForm.artist.trim(),
      channel: editSongForm.channel.trim() || "官方或授權頻道",
      channelUrl: editSongForm.channelUrl.trim() || undefined,
      level: editSongForm.level,
      mood: editSongForm.mood.trim() || "日文歌",
      reason: editSongForm.reason.trim() || "由管理員新增的日文歌曲。",
      lyricsUrl: editSongForm.lyricsUrl.trim() || undefined,
      lyricsNote: editSongForm.lyricsNote.trim() || "請使用官方歌詞頁或已授權來源搭配學習。",
      vocabularyNotes: editSongForm.vocabularyNotes.trim() || "可補充常見單字、片假名或慣用語。",
      grammarNotes: editSongForm.grammarNotes.trim() || "可補充句型、助詞或口語表現。",
      listeningPrompt: editSongForm.listeningPrompt.trim() || "先聽副歌，再回到整首歌練習辨音與跟唱。",
    });
  }

  const fieldClass = "w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]";
  const labelClass = "mb-2 block text-sm font-black uppercase tracking-[0.18em]";

  return (
    <main className="min-h-screen bg-[#f4ecd8] text-[#21392f]">
      <section className="relative border-b border-[#21392f]/15 px-5 py-8 md:px-10 lg:px-16">
        <div className="absolute inset-0 bg-[url('https://d2xsxph8kpxj0f.cloudfront.net/310519663615536359/Eo5zKxPE3r647x6NkNQoe5/nihongo_paper_pattern-2qjVZvdvYrMsj2KwtsxgWV.webp')] bg-cover bg-center opacity-80" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center border-2 border-[#21392f] bg-[#f8f0de] shadow-[4px_4px_0_#b7442e]"><Train className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#b7442e]">Nihongo Video Hub</p>
              <p className="text-sm tracking-wide text-[#21392f]/70">管理員資料維護頁</p>
            </div>
          </div>
          <a href="/" className="w-fit border border-[#21392f]/30 bg-[#f8f0de]/80 px-4 py-2 text-sm font-semibold tracking-wide shadow-[3px_3px_0_#21392f] transition hover:-translate-y-0.5">回到學習索引</a>
        </div>
      </section>

      <section className="px-5 py-14 md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.32em] text-[#b7442e]">Admin Route</p>
            <h1 className="font-serif text-4xl font-black tracking-[-0.03em] md:text-6xl">站務資料維護。</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#314a40]">此頁面不會在公開首頁提供入口；需要維護影片或日文歌曲時，請直接輸入 <span className="font-black">/admin</span> 並使用具備管理員角色的帳號登入。</p>
            <div className="mt-8 inline-flex items-center gap-2 border border-[#21392f]/25 bg-[#f8f0de]/90 px-3 py-2 text-sm font-semibold shadow-[3px_3px_0_#24628f]"><ShieldCheck className="h-4 w-4 text-[#2f5d46]" />管理員限定：新增、編輯、刪除資料庫影片與歌曲</div>
            <img src={ticketImage} alt="JLPT 分級票券插畫" className="mt-8 hidden w-full border border-[#21392f]/20 shadow-[12px_12px_0_#b7442e] lg:block" />
          </div>

          <div className="border-2 border-[#21392f] bg-[#f8f0de] p-5 text-[#21392f] shadow-[10px_10px_0_#24628f] md:p-7">
            {!isAuthenticated ? (
              <div className="space-y-5">
                <div className="flex items-start gap-4 border border-[#21392f]/20 bg-[#fff8e9] p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#21392f] bg-[#21392f] text-[#fff7e6] shadow-[4px_4px_0_#b7442e]"><Lock className="h-5 w-5" /></div>
                  <div><h2 className="font-serif text-2xl font-black">管理員登入</h2><p className="mt-2 text-sm leading-6 text-[#314a40]">此頁提供內容維護使用。若需要維護資料，請登入具備管理員權限的帳號。</p></div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="button" onClick={handleLogin} className="h-12 rounded-none bg-[#21392f] px-7 text-base font-bold text-[#fff7e6] shadow-[5px_5px_0_#b7442e] transition hover:-translate-y-1 hover:bg-[#2f5d46]"><Lock className="mr-2 h-4 w-4" /> 登入管理員帳號</Button>
                  <p className="text-sm font-semibold text-[#314a40]">{authLoading ? "正在確認登入狀態……" : "登入後系統會依帳號角色開放管理功能。"}</p>
                </div>
              </div>
            ) : !isAdmin ? (
              <div className="space-y-5">
                <div className="flex items-start gap-4 border border-[#b7442e]/30 bg-[#fff8e9] p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#b7442e] bg-[#b7442e] text-[#fff7e6] shadow-[4px_4px_0_#21392f]"><Lock className="h-5 w-5" /></div>
                  <div><h2 className="font-serif text-2xl font-black">目前帳號沒有管理員權限</h2><p className="mt-2 text-sm leading-6 text-[#314a40]">你已登入為 {user?.name || "一般使用者"}，但此帳號角色為 {user?.role || "user"}。請改用管理員帳號登入。</p></div>
                </div>
                <Button type="button" onClick={handleLogout} className="h-12 rounded-none bg-[#21392f] px-7 text-base font-bold text-[#fff7e6] shadow-[5px_5px_0_#24628f] transition hover:-translate-y-1 hover:bg-[#2f5d46]"><LogOut className="mr-2 h-4 w-4" /> 登出並切換帳號</Button>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="flex flex-col gap-3 border border-[#2f5d46]/30 bg-[#fff8e9] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-black text-[#2f5d46]">管理員模式使用中：{user?.name || "管理員"} 可以新增、編輯與刪除影片和歌曲。</p>
                  <button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 border border-[#21392f]/30 px-3 py-2 text-sm font-black transition hover:bg-[#21392f] hover:text-[#fff7e6]"><LogOut className="h-4 w-4" /> 登出</button>
                </div>

                <section className="space-y-6">
                  <div><p className="text-sm font-black uppercase tracking-[0.28em] text-[#b7442e]">Video Catalog</p><h2 className="mt-2 font-serif text-3xl font-black">影片管理</h2></div>
                  <form onSubmit={handleAddVideo} className="space-y-5">
                    <div><label className={labelClass}>YouTube 連結或影片 ID</label><input value={videoForm.url} onChange={(event) => setVideoForm({ ...videoForm, url: event.target.value })} className={fieldClass} placeholder="https://www.youtube.com/watch?v=..." /></div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div><label className={labelClass}>JLPT 級別</label><select value={videoForm.level} onChange={(event) => setVideoForm({ ...videoForm, level: event.target.value as Level })} className={fieldClass}>{levels.map((item) => <option key={item.level} value={item.level}>{item.level}｜{item.label}</option>)}</select></div>
                      <div><label className={labelClass}>主題</label><select value={videoForm.topic} onChange={(event) => setVideoForm({ ...videoForm, topic: event.target.value as Topic })} className={fieldClass}>{topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}</select></div>
                    </div>
                    <div><label className={labelClass}>影片標題</label><input value={videoForm.title} onChange={(event) => setVideoForm({ ...videoForm, title: event.target.value })} className={fieldClass} placeholder="例如：N3 聽力逐句解析" /></div>
                    <div><label className={labelClass}>頻道名稱</label><input value={videoForm.channel} onChange={(event) => setVideoForm({ ...videoForm, channel: event.target.value })} className={fieldClass} placeholder="例如：Elsaの放送" /></div>
                    <div><label className={labelClass}>原頻道網址</label><input value={videoForm.channelUrl} onChange={(event) => setVideoForm({ ...videoForm, channelUrl: event.target.value })} className={fieldClass} placeholder="例如：https://www.youtube.com/@ElsaJapanese" /></div>
                    <div><label className={labelClass}>備註</label><textarea value={videoForm.note} onChange={(event) => setVideoForm({ ...videoForm, note: event.target.value })} className={`${fieldClass} min-h-24`} placeholder="例如：適合考前複習，老師講解速度清楚。" /></div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Button type="submit" disabled={isMutating} className="h-12 rounded-none bg-[#21392f] px-7 text-base font-bold text-[#fff7e6] shadow-[5px_5px_0_#b7442e] transition hover:-translate-y-1 hover:bg-[#2f5d46] disabled:cursor-not-allowed disabled:opacity-70"><Plus className="mr-2 h-4 w-4" /> {addVideoMutation.isPending ? "新增中……" : "新增影片"}</Button><p className="text-sm font-semibold text-[#314a40]">{videoMessage}</p></div>
                  </form>

                  <div className="border-t border-[#21392f]/20 pt-6">
                    <h3 className="mb-4 font-serif text-2xl font-black">管理員維護的影片</h3>
                    {videosLoading ? <p className="border border-[#21392f]/20 bg-[#fff8e9] p-4 text-sm font-semibold text-[#314a40]">正在載入資料庫影片……</p> : customVideos.length === 0 ? <p className="border border-[#21392f]/20 bg-[#fff8e9] p-4 text-sm font-semibold text-[#314a40]">目前尚未新增資料庫影片。</p> : (
                      <div className="space-y-3">{customVideos.map((video) => <div key={video.id} className="border border-[#21392f]/20 bg-[#fff8e9] p-4">{editingVideoId === video.id ? (
                        <form onSubmit={(event) => handleUpdateVideo(event, video.id)} className="space-y-4"><div className="flex justify-between gap-3"><div><p className="text-sm font-black text-[#b7442e]">編輯中｜{video.topic}</p><p className="mt-1 text-sm text-[#314a40]">YouTube ID：{video.id}</p></div><button type="button" disabled={isMutating} onClick={() => { setEditingVideoId(null); setEditVideoForm(emptyVideoForm); }} className="inline-flex items-center gap-2 border border-[#21392f]/30 px-3 py-2 text-sm font-black transition hover:bg-[#21392f] hover:text-[#fff7e6]"><X className="h-4 w-4" /> 取消</button></div><input value={editVideoForm.title} onChange={(event) => setEditVideoForm({ ...editVideoForm, title: event.target.value })} className={fieldClass} /><div className="grid gap-4 md:grid-cols-2"><input value={editVideoForm.channel} onChange={(event) => setEditVideoForm({ ...editVideoForm, channel: event.target.value })} className={fieldClass} /><select value={editVideoForm.level} onChange={(event) => setEditVideoForm({ ...editVideoForm, level: event.target.value as Level })} className={fieldClass}>{levels.map((item) => <option key={item.level} value={item.level}>{item.level}｜{item.label}</option>)}</select></div><input value={editVideoForm.channelUrl} onChange={(event) => setEditVideoForm({ ...editVideoForm, channelUrl: event.target.value })} className={fieldClass} placeholder="https://www.youtube.com/@channel" /><textarea value={editVideoForm.note} onChange={(event) => setEditVideoForm({ ...editVideoForm, note: event.target.value })} className={`${fieldClass} min-h-24`} /><Button type="submit" disabled={isMutating} className="h-11 rounded-none bg-[#21392f] px-6 text-sm font-bold text-[#fff7e6] shadow-[4px_4px_0_#b7442e] transition hover:-translate-y-0.5 hover:bg-[#2f5d46]"><Pencil className="mr-2 h-4 w-4" /> 儲存編輯</Button></form>
                      ) : (
                        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black text-[#b7442e]">{video.level}｜{video.topic}</p><p className="mt-1 font-bold">{video.title}</p><p className="mt-1 text-sm text-[#314a40]">{video.channel}</p>{video.channelUrl ? <a href={video.channelUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#24628f] underline decoration-[#24628f]/40 underline-offset-4">原頻道連結 <ExternalLink className="h-3 w-3" /></a> : null}<p className="mt-2 text-sm leading-6 text-[#314a40]/80">{video.reason}</p></div><div className="flex shrink-0 gap-2"><button disabled={isMutating} onClick={() => startEditVideo(video)} className="border border-[#21392f]/30 p-2 text-[#24628f] transition hover:bg-[#24628f] hover:text-[#fff7e6]" aria-label="編輯自訂影片"><Pencil className="h-4 w-4" /></button><button disabled={isMutating} onClick={() => deleteVideoMutation.mutate({ youtubeId: video.id })} className="border border-[#21392f]/30 p-2 text-[#b7442e] transition hover:bg-[#b7442e] hover:text-[#fff7e6]" aria-label="移除自訂影片"><Trash2 className="h-4 w-4" /></button></div></div>
                      )}</div>)}</div>
                    )}
                  </div>
                </section>

                <section className="space-y-6 border-t-2 border-[#21392f] pt-10">
                  <div><p className="text-sm font-black uppercase tracking-[0.28em] text-[#b7442e]">Song Study</p><h2 className="mt-2 flex items-center gap-2 font-serif text-3xl font-black"><Music2 className="h-7 w-7" /> 日文歌曲管理</h2><p className="mt-3 text-sm leading-6 text-[#314a40]">可以放日文歌 YouTube 連結、官方歌詞頁與學習重點。完整商業歌詞請使用官方或授權來源連結；本站只整理學習提示，不自動生成或重製完整歌詞。</p></div>
                  <form onSubmit={handleAddSong} className="space-y-5">
                    <div><label className={labelClass}>YouTube 歌曲連結或影片 ID</label><input value={songForm.url} onChange={(event) => setSongForm({ ...songForm, url: event.target.value })} className={fieldClass} placeholder="https://www.youtube.com/watch?v=..." /></div>
                    <div className="grid gap-5 md:grid-cols-2"><div><label className={labelClass}>歌曲名稱</label><input value={songForm.title} onChange={(event) => setSongForm({ ...songForm, title: event.target.value })} className={fieldClass} placeholder="例如：優しい彗星" /></div><div><label className={labelClass}>歌手／作品</label><input value={songForm.artist} onChange={(event) => setSongForm({ ...songForm, artist: event.target.value })} className={fieldClass} placeholder="例如：YOASOBI" /></div></div>
                    <div className="grid gap-5 md:grid-cols-3"><div><label className={labelClass}>級別</label><select value={songForm.level} onChange={(event) => setSongForm({ ...songForm, level: event.target.value as Level })} className={fieldClass}>{levels.map((item) => <option key={item.level} value={item.level}>{item.level}｜{item.label}</option>)}</select></div><div><label className={labelClass}>分類／氛圍</label><input value={songForm.mood} onChange={(event) => setSongForm({ ...songForm, mood: event.target.value })} className={fieldClass} placeholder="例如：抒情、動畫歌、快歌" /></div><div><label className={labelClass}>頻道名稱</label><input value={songForm.channel} onChange={(event) => setSongForm({ ...songForm, channel: event.target.value })} className={fieldClass} placeholder="官方或授權頻道" /></div></div>
                    <div className="grid gap-5 md:grid-cols-2"><div><label className={labelClass}>原頻道網址</label><input value={songForm.channelUrl} onChange={(event) => setSongForm({ ...songForm, channelUrl: event.target.value })} className={fieldClass} placeholder="https://www.youtube.com/@official" /></div><div><label className={labelClass}>官方歌詞／授權歌詞網址</label><input value={songForm.lyricsUrl} onChange={(event) => setSongForm({ ...songForm, lyricsUrl: event.target.value })} className={fieldClass} placeholder="請放官方或授權歌詞頁連結" /></div></div>
                    <div><label className={labelClass}>推薦理由</label><textarea value={songForm.reason} onChange={(event) => setSongForm({ ...songForm, reason: event.target.value })} className={`${fieldClass} min-h-20`} placeholder="例如：副歌清楚，適合練習長音與情緒語調。" /></div>
                    <div><label className={labelClass}>歌詞備註</label><textarea value={songForm.lyricsNote} onChange={(event) => setSongForm({ ...songForm, lyricsNote: event.target.value })} className={`${fieldClass} min-h-20`} placeholder="可寫：請參考官方歌詞連結；或貼上你有授權／自行整理的短句備註。" /></div>
                    <div className="grid gap-5 md:grid-cols-2"><div><label className={labelClass}>單字重點</label><textarea value={songForm.vocabularyNotes} onChange={(event) => setSongForm({ ...songForm, vocabularyNotes: event.target.value })} className={`${fieldClass} min-h-24`} placeholder="例如：常見動詞、情緒形容詞、片假名外來語。" /></div><div><label className={labelClass}>文法重點</label><textarea value={songForm.grammarNotes} onChange={(event) => setSongForm({ ...songForm, grammarNotes: event.target.value })} className={`${fieldClass} min-h-24`} placeholder="例如：て形、ない形、引用表現、口語省略。" /></div></div>
                    <div><label className={labelClass}>聽力練習提示</label><textarea value={songForm.listeningPrompt} onChange={(event) => setSongForm({ ...songForm, listeningPrompt: event.target.value })} className={`${fieldClass} min-h-20`} placeholder="例如：先聽 0:45–1:15 副歌，標記聽不清楚的助詞。" /></div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Button type="submit" disabled={isMutating} className="h-12 rounded-none bg-[#21392f] px-7 text-base font-bold text-[#fff7e6] shadow-[5px_5px_0_#b7442e] transition hover:-translate-y-1 hover:bg-[#2f5d46]"><Plus className="mr-2 h-4 w-4" /> {addSongMutation.isPending ? "新增中……" : "新增歌曲"}</Button><p className="text-sm font-semibold text-[#314a40]">{songMessage}</p></div>
                  </form>

                  <div className="border-t border-[#21392f]/20 pt-6">
                    <h3 className="mb-4 font-serif text-2xl font-black">管理員維護的歌曲</h3>
                    {songsLoading ? <p className="border border-[#21392f]/20 bg-[#fff8e9] p-4 text-sm font-semibold text-[#314a40]">正在載入歌曲……</p> : songs.length === 0 ? <p className="border border-[#21392f]/20 bg-[#fff8e9] p-4 text-sm font-semibold text-[#314a40]">目前尚未新增歌曲。</p> : (
                      <div className="space-y-3">{songs.map((song) => <div key={song.id} className="border border-[#21392f]/20 bg-[#fff8e9] p-4">{editingSongId === song.id ? (
                        <form onSubmit={(event) => handleUpdateSong(event, song.id)} className="space-y-4"><div className="flex justify-between gap-3"><div><p className="text-sm font-black text-[#b7442e]">編輯中｜{song.level}｜{song.mood}</p><p className="mt-1 text-sm text-[#314a40]">YouTube ID：{song.id}</p></div><button type="button" disabled={isMutating} onClick={() => { setEditingSongId(null); setEditSongForm(emptySongForm); }} className="inline-flex items-center gap-2 border border-[#21392f]/30 px-3 py-2 text-sm font-black transition hover:bg-[#21392f] hover:text-[#fff7e6]"><X className="h-4 w-4" /> 取消</button></div><div className="grid gap-4 md:grid-cols-2"><input value={editSongForm.title} onChange={(event) => setEditSongForm({ ...editSongForm, title: event.target.value })} className={fieldClass} /><input value={editSongForm.artist} onChange={(event) => setEditSongForm({ ...editSongForm, artist: event.target.value })} className={fieldClass} /></div><div className="grid gap-4 md:grid-cols-3"><select value={editSongForm.level} onChange={(event) => setEditSongForm({ ...editSongForm, level: event.target.value as Level })} className={fieldClass}>{levels.map((item) => <option key={item.level} value={item.level}>{item.level}｜{item.label}</option>)}</select><input value={editSongForm.mood} onChange={(event) => setEditSongForm({ ...editSongForm, mood: event.target.value })} className={fieldClass} /><input value={editSongForm.channel} onChange={(event) => setEditSongForm({ ...editSongForm, channel: event.target.value })} className={fieldClass} /></div><div className="grid gap-4 md:grid-cols-2"><input value={editSongForm.channelUrl} onChange={(event) => setEditSongForm({ ...editSongForm, channelUrl: event.target.value })} className={fieldClass} placeholder="原頻道網址" /><input value={editSongForm.lyricsUrl} onChange={(event) => setEditSongForm({ ...editSongForm, lyricsUrl: event.target.value })} className={fieldClass} placeholder="官方歌詞網址" /></div><textarea value={editSongForm.reason} onChange={(event) => setEditSongForm({ ...editSongForm, reason: event.target.value })} className={`${fieldClass} min-h-20`} /><textarea value={editSongForm.lyricsNote} onChange={(event) => setEditSongForm({ ...editSongForm, lyricsNote: event.target.value })} className={`${fieldClass} min-h-20`} /><div className="grid gap-4 md:grid-cols-2"><textarea value={editSongForm.vocabularyNotes} onChange={(event) => setEditSongForm({ ...editSongForm, vocabularyNotes: event.target.value })} className={`${fieldClass} min-h-24`} /><textarea value={editSongForm.grammarNotes} onChange={(event) => setEditSongForm({ ...editSongForm, grammarNotes: event.target.value })} className={`${fieldClass} min-h-24`} /></div><textarea value={editSongForm.listeningPrompt} onChange={(event) => setEditSongForm({ ...editSongForm, listeningPrompt: event.target.value })} className={`${fieldClass} min-h-20`} /><Button type="submit" disabled={isMutating} className="h-11 rounded-none bg-[#21392f] px-6 text-sm font-bold text-[#fff7e6] shadow-[4px_4px_0_#b7442e] transition hover:-translate-y-0.5 hover:bg-[#2f5d46]"><Pencil className="mr-2 h-4 w-4" /> 儲存歌曲</Button></form>
                      ) : (
                        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black text-[#b7442e]">{song.level}｜{song.mood}</p><p className="mt-1 font-bold">{song.title}</p><p className="mt-1 text-sm text-[#314a40]">{song.artist}｜{song.channel}</p>{song.lyricsUrl ? <a href={song.lyricsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#24628f] underline decoration-[#24628f]/40 underline-offset-4">歌詞來源 <ExternalLink className="h-3 w-3" /></a> : null}<p className="mt-2 text-sm leading-6 text-[#314a40]/80">{song.reason}</p><p className="mt-2 text-xs leading-5 text-[#314a40]/70">歌詞備註：{song.lyricsNote}</p></div><div className="flex shrink-0 gap-2"><button disabled={isMutating} onClick={() => startEditSong(song)} className="border border-[#21392f]/30 p-2 text-[#24628f] transition hover:bg-[#24628f] hover:text-[#fff7e6]" aria-label="編輯歌曲"><Pencil className="h-4 w-4" /></button><button disabled={isMutating} onClick={() => deleteSongMutation.mutate({ youtubeId: song.id })} className="border border-[#21392f]/30 p-2 text-[#b7442e] transition hover:bg-[#b7442e] hover:text-[#fff7e6]" aria-label="移除歌曲"><Trash2 className="h-4 w-4" /></button></div></div>
                      )}</div>)}</div>
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
