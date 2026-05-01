import { FormEvent, useMemo, useState } from "react";

import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Lock, LogOut, Pencil, Plus, ShieldCheck, Train, Trash2, X } from "lucide-react";

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

type FormState = {
  url: string;
  title: string;
  channel: string;
  channelUrl: string;
  level: Level;
  topic: Topic;
  note: string;
};

const levels: Array<{ level: Level; label: string }> = [
  { level: "N5", label: "初級入門" },
  { level: "N4", label: "基礎學習" },
  { level: "N3", label: "中級前半" },
  { level: "N2", label: "中級後半" },
  { level: "N1", label: "上級到達" },
];

const topics: Topic[] = ["文法", "單字", "聽解", "讀解", "綜合"];

const emptyForm: FormState = {
  url: "",
  title: "",
  channel: "",
  channelUrl: "",
  level: "N5",
  topic: "文法",
  note: "",
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
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [formMessage, setFormMessage] = useState("請以管理員帳號登入後維護資料庫影片。");

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

  const addVideoMutation = trpc.videos.add.useMutation({
    onSuccess: async () => {
      await utils.videos.list.invalidate();
      setForm(emptyForm);
      setFormMessage("已新增到資料庫。公開頁面的影片清單會同步顯示這支影片。");
    },
    onError: (mutationError) => {
      setFormMessage(mutationError.message || "新增失敗，請確認你已登入且具有管理員權限。");
    },
  });

  const updateVideoMutation = trpc.videos.update.useMutation({
    onSuccess: async () => {
      await utils.videos.list.invalidate();
      setEditingVideoId(null);
      setEditForm(emptyForm);
      setFormMessage("已更新影片資訊。標題、級別與備註會同步到資料庫。");
    },
    onError: (mutationError) => {
      setFormMessage(mutationError.message || "更新失敗，請確認你已登入且具有管理員權限。");
    },
  });

  const deleteVideoMutation = trpc.videos.delete.useMutation({
    onSuccess: async (_result, variables) => {
      await utils.videos.list.invalidate();
      if (editingVideoId === variables.youtubeId) setEditingVideoId(null);
      setFormMessage("已從資料庫移除自訂影片。預設影片不會被刪除。");
    },
    onError: (mutationError) => {
      setFormMessage(mutationError.message || "刪除失敗，請確認你已登入且具有管理員權限。");
    },
  });

  const isAdmin = user?.role === "admin";
  const isMutating = addVideoMutation.isPending || updateVideoMutation.isPending || deleteVideoMutation.isPending;

  function handleLogin() {
    window.location.href = getLoginUrl("/admin");
  }

  function handleLogout() {
    logout();
    setForm(emptyForm);
    setEditingVideoId(null);
    setFormMessage("已登出。請以管理員帳號登入後再維護影片。");
  }

  function handleAddVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAdmin) {
      setFormMessage(isAuthenticated ? "此帳號不是管理員，無法新增影片。" : "請先登入管理員帳號，才能新增影片。");
      return;
    }

    const id = extractYouTubeId(form.url);
    if (!id) {
      setFormMessage("找不到影片 ID。請貼上 YouTube 影片網址、Shorts 網址、嵌入網址，或直接貼影片 ID。");
      return;
    }

    if (!form.title.trim()) {
      setFormMessage("請填寫影片標題，這樣之後比較好搜尋與辨識。");
      return;
    }

    addVideoMutation.mutate({
      youtubeId: id,
      title: form.title.trim(),
      channel: form.channel.trim() || "自訂來源",
      channelUrl: form.channelUrl.trim() || undefined,
      level: form.level,
      topic: form.topic,
      reason: form.note.trim() || "由管理員新增的學習影片。",
    });
  }

  function startEditVideo(video: VideoItem) {
    if (!isAdmin) {
      setFormMessage(isAuthenticated ? "此帳號不是管理員，無法編輯影片。" : "請先登入管理員帳號，才能編輯影片。");
      return;
    }

    setEditingVideoId(video.id);
    setEditForm({
      url: video.id,
      title: video.title,
      channel: video.channel,
      channelUrl: video.channelUrl ?? "",
      level: video.level,
      topic: video.topic,
      note: video.reason,
    });
    setFormMessage("正在編輯影片資訊；可修改標題、JLPT 級別與備註。");
  }

  function cancelEditVideo() {
    setEditingVideoId(null);
    setEditForm(emptyForm);
    setFormMessage("已取消編輯，尚未變更資料庫內容。");
  }

  function handleUpdateVideo(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();

    if (!isAdmin) {
      setFormMessage(isAuthenticated ? "此帳號不是管理員，無法編輯影片。" : "請先登入管理員帳號，才能編輯影片。");
      return;
    }

    if (!editForm.title.trim()) {
      setFormMessage("請填寫影片標題，才能儲存編輯結果。");
      return;
    }

    updateVideoMutation.mutate({
      youtubeId: id,
      title: editForm.title.trim(),
      channel: editForm.channel.trim() || "自訂來源",
      channelUrl: editForm.channelUrl.trim() || undefined,
      level: editForm.level,
      reason: editForm.note.trim() || "由管理員新增的學習影片。",
    });
  }

  function removeCustomVideo(id: string) {
    if (!isAdmin) {
      setFormMessage(isAuthenticated ? "此帳號不是管理員，無法刪除影片。" : "請先登入管理員帳號，才能刪除影片。");
      return;
    }

    deleteVideoMutation.mutate({ youtubeId: id });
  }

  return (
    <main className="min-h-screen bg-[#f4ecd8] text-[#21392f]">
      <section className="relative border-b border-[#21392f]/15 px-5 py-8 md:px-10 lg:px-16">
        <div className="absolute inset-0 bg-[url('https://d2xsxph8kpxj0f.cloudfront.net/310519663615536359/Eo5zKxPE3r647x6NkNQoe5/nihongo_paper_pattern-2qjVZvdvYrMsj2KwtsxgWV.webp')] bg-cover bg-center opacity-80" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center border-2 border-[#21392f] bg-[#f8f0de] shadow-[4px_4px_0_#b7442e]">
              <Train className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#b7442e]">Nihongo Video Hub</p>
              <p className="text-sm tracking-wide text-[#21392f]/70">管理員資料維護頁</p>
            </div>
          </div>
          <a href="/" className="w-fit border border-[#21392f]/30 bg-[#f8f0de]/80 px-4 py-2 text-sm font-semibold tracking-wide shadow-[3px_3px_0_#21392f] transition hover:-translate-y-0.5">
            回到影片索引
          </a>
        </div>
      </section>

      <section className="px-5 py-14 md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.32em] text-[#b7442e]">Admin Route</p>
            <h1 className="font-serif text-4xl font-black tracking-[-0.03em] md:text-6xl">站務資料維護。</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#314a40]">
              此頁面不會在公開首頁提供入口；需要維護影片時，請直接輸入 <span className="font-black">/admin</span> 並使用具備管理員角色的帳號登入。
            </p>
            <div className="mt-8 inline-flex items-center gap-2 border border-[#21392f]/25 bg-[#f8f0de]/90 px-3 py-2 text-sm font-semibold shadow-[3px_3px_0_#24628f]">
              <ShieldCheck className="h-4 w-4 text-[#2f5d46]" />
              管理員限定：新增、編輯、刪除資料庫影片
            </div>
            <img src={ticketImage} alt="JLPT 分級票券插畫" className="mt-8 hidden w-full border border-[#21392f]/20 shadow-[12px_12px_0_#b7442e] lg:block" />
          </div>

          <div className="border-2 border-[#21392f] bg-[#f8f0de] p-5 text-[#21392f] shadow-[10px_10px_0_#24628f] md:p-7">
            {!isAuthenticated ? (
              <div className="space-y-5">
                <div className="flex items-start gap-4 border border-[#21392f]/20 bg-[#fff8e9] p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#21392f] bg-[#21392f] text-[#fff7e6] shadow-[4px_4px_0_#b7442e]">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-black">管理員登入</h2>
                    <p className="mt-2 text-sm leading-6 text-[#314a40]">此頁提供內容維護使用。若需要維護資料，請登入具備管理員權限的帳號。</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="button" onClick={handleLogin} className="h-12 rounded-none bg-[#21392f] px-7 text-base font-bold text-[#fff7e6] shadow-[5px_5px_0_#b7442e] transition hover:-translate-y-1 hover:bg-[#2f5d46]">
                    <Lock className="mr-2 h-4 w-4" /> 登入管理員帳號
                  </Button>
                  <p className="text-sm font-semibold text-[#314a40]">{authLoading ? "正在確認登入狀態……" : "登入後系統會依帳號角色開放管理功能。"}</p>
                </div>
              </div>
            ) : !isAdmin ? (
              <div className="space-y-5">
                <div className="flex items-start gap-4 border border-[#b7442e]/30 bg-[#fff8e9] p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#b7442e] bg-[#b7442e] text-[#fff7e6] shadow-[4px_4px_0_#21392f]">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-black">目前帳號沒有管理員權限</h2>
                    <p className="mt-2 text-sm leading-6 text-[#314a40]">你已登入為 {user?.name || "一般使用者"}，但此帳號角色為 {user?.role || "user"}。請使用管理員帳號，或在資料庫將此帳號角色調整為 admin。</p>
                  </div>
                </div>
                <Button type="button" onClick={handleLogout} className="h-12 rounded-none bg-[#21392f] px-7 text-base font-bold text-[#fff7e6] shadow-[5px_5px_0_#24628f] transition hover:-translate-y-1 hover:bg-[#2f5d46]">
                  <LogOut className="mr-2 h-4 w-4" /> 登出並切換帳號
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-col gap-3 border border-[#2f5d46]/30 bg-[#fff8e9] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-black text-[#2f5d46]">管理員模式使用中：{user?.name || "管理員"} 可以新增、編輯與刪除資料庫影片。</p>
                  <button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 border border-[#21392f]/30 px-3 py-2 text-sm font-black transition hover:bg-[#21392f] hover:text-[#fff7e6]">
                    <LogOut className="h-4 w-4" /> 登出
                  </button>
                </div>

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
                        {topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
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
                    <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">原頻道網址</label>
                    <input value={form.channelUrl} onChange={(event) => setForm({ ...form, channelUrl: event.target.value })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" placeholder="例如：https://www.youtube.com/@ElsaJapanese" />
                    <p className="mt-2 text-xs font-semibold leading-5 text-[#314a40]/75">填入後公開影片卡片會顯示「前往原頻道」按鈕，協助創作者增加曝光。</p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">備註</label>
                    <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} className="min-h-24 w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" placeholder="例如：適合考前複習，老師講解速度清楚。" />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="submit" disabled={isMutating} className="h-12 rounded-none bg-[#21392f] px-7 text-base font-bold text-[#fff7e6] shadow-[5px_5px_0_#b7442e] transition hover:-translate-y-1 hover:bg-[#2f5d46] disabled:cursor-not-allowed disabled:opacity-70">
                      <Plus className="mr-2 h-4 w-4" /> {addVideoMutation.isPending ? "新增中……" : "新增到資料庫"}
                    </Button>
                    <p className="text-sm font-semibold text-[#314a40]">{formMessage}</p>
                  </div>
                </form>

                <div className="mt-8 border-t border-[#21392f]/20 pt-6">
                  <h2 className="mb-4 font-serif text-2xl font-black">管理員維護的影片</h2>
                  {videosLoading ? (
                    <p className="border border-[#21392f]/20 bg-[#fff8e9] p-4 text-sm font-semibold text-[#314a40]">正在載入資料庫影片……</p>
                  ) : customVideos.length === 0 ? (
                    <p className="border border-[#21392f]/20 bg-[#fff8e9] p-4 text-sm font-semibold text-[#314a40]">目前尚未新增資料庫影片。</p>
                  ) : (
                    <div className="space-y-3">
                      {customVideos.map((video) => (
                        <div key={video.id} className="border border-[#21392f]/20 bg-[#fff8e9] p-4">
                          {editingVideoId === video.id ? (
                            <form onSubmit={(event) => handleUpdateVideo(event, video.id)} className="space-y-4">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-sm font-black text-[#b7442e]">編輯中｜{video.topic}</p>
                                  <p className="mt-1 text-sm text-[#314a40]">YouTube ID：{video.id}</p>
                                </div>
                                <button type="button" disabled={isMutating} onClick={cancelEditVideo} className="inline-flex items-center gap-2 border border-[#21392f]/30 px-3 py-2 text-sm font-black transition hover:bg-[#21392f] hover:text-[#fff7e6] disabled:cursor-not-allowed disabled:opacity-50">
                                  <X className="h-4 w-4" /> 取消
                                </button>
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">影片標題</label>
                                <input value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" />
                              </div>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">頻道名稱</label>
                                  <input value={editForm.channel} onChange={(event) => setEditForm({ ...editForm, channel: event.target.value })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" />
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">JLPT 級別</label>
                                  <select value={editForm.level} onChange={(event) => setEditForm({ ...editForm, level: event.target.value as Level })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]">
                                    {levels.map((item) => <option key={item.level} value={item.level}>{item.level}｜{item.label}</option>)}
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">原頻道網址</label>
                                <input value={editForm.channelUrl} onChange={(event) => setEditForm({ ...editForm, channelUrl: event.target.value })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" placeholder="https://www.youtube.com/@channel" />
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">備註</label>
                                <textarea value={editForm.note} onChange={(event) => setEditForm({ ...editForm, note: event.target.value })} className="min-h-24 w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" />
                              </div>
                              <Button type="submit" disabled={isMutating} className="h-11 rounded-none bg-[#21392f] px-6 text-sm font-bold text-[#fff7e6] shadow-[4px_4px_0_#b7442e] transition hover:-translate-y-0.5 hover:bg-[#2f5d46] disabled:cursor-not-allowed disabled:opacity-70">
                                <Pencil className="mr-2 h-4 w-4" /> {updateVideoMutation.isPending ? "儲存中……" : "儲存編輯"}
                              </Button>
                            </form>
                          ) : (
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-black text-[#b7442e]">{video.level}｜{video.topic}</p>
                                <p className="mt-1 font-bold">{video.title}</p>
                                <p className="mt-1 text-sm text-[#314a40]">{video.channel}</p>
                                {video.channelUrl ? (
                                  <a href={video.channelUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#24628f] underline decoration-[#24628f]/40 underline-offset-4">
                                    原頻道連結 <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : null}
                                <p className="mt-2 text-sm leading-6 text-[#314a40]/80">{video.reason}</p>
                              </div>
                              <div className="flex shrink-0 gap-2">
                                <button disabled={isMutating} onClick={() => startEditVideo(video)} className="border border-[#21392f]/30 p-2 text-[#24628f] transition hover:bg-[#24628f] hover:text-[#fff7e6] disabled:cursor-not-allowed disabled:opacity-50" aria-label="編輯自訂影片">
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button disabled={isMutating} onClick={() => removeCustomVideo(video.id)} className="border border-[#21392f]/30 p-2 text-[#b7442e] transition hover:bg-[#b7442e] hover:text-[#fff7e6] disabled:cursor-not-allowed disabled:opacity-50" aria-label="移除自訂影片">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
