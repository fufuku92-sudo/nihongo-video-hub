import { useBookmarks } from "@/hooks/useBookmarks";
import { Heart, Train } from "lucide-react";
import { useState } from "react";

export default function Bookmarks() {
  const { bookmarks, removeBookmark, isLoaded } = useBookmarks();
  const [filterType, setFilterType] = useState<"all" | "video" | "song" | "podcast">("all");

  const filteredBookmarks =
    filterType === "all"
      ? bookmarks
      : bookmarks.filter(b => b.type === filterType);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#f4ecd8] text-[#21392f]">
        <div className="flex items-center justify-center py-20">
          <p className="text-xl font-semibold">正在載入收藏...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4ecd8] text-[#21392f]">
      {/* 頂部 */}
      <section className="relative border-b border-[#21392f]/15 px-5 py-8 md:px-10 lg:px-16">
        <div className="absolute inset-0 bg-[url('https://d2xsxph8kpxj0f.cloudfront.net/310519663615536359/Eo5zKxPE3r647x6NkNQoe5/nihongo_paper_pattern-2qjVZvdvYrMsj2KwtsxgWV.webp')] bg-cover bg-center opacity-80" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center border-2 border-[#21392f] bg-[#f8f0de] shadow-[4px_4px_0_#b7442e]"><Heart className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#b7442e]">My Library</p>
              <p className="text-sm tracking-wide text-[#21392f]/70">我的收藏</p>
            </div>
          </div>
          <a href="/" className="w-fit border border-[#21392f]/30 bg-[#f8f0de]/80 px-4 py-2 text-sm font-semibold tracking-wide shadow-[3px_3px_0_#21392f] transition hover:-translate-y-0.5">回到首頁</a>
        </div>
      </section>

      {/* 內容 */}
      <section className="px-5 py-14 md:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="font-serif text-5xl font-black tracking-[-0.03em] md:text-6xl">📌 我的收藏</h1>
            <p className="mt-4 text-lg text-[#314a40]">共 {bookmarks.length} 個項目</p>
          </div>

          {/* 篩選按鈕 */}
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={() => setFilterType("all")}
              className={`rounded-none border-2 px-5 py-3 font-bold transition ${
                filterType === "all"
                  ? "border-[#21392f] bg-[#21392f] text-white shadow-[4px_4px_0_#b7442e]"
                  : "border-[#21392f]/40 bg-white text-[#21392f] hover:border-[#21392f]"
              }`}
            >
              全部 ({bookmarks.length})
            </button>
            <button
              onClick={() => setFilterType("video")}
              className={`rounded-none border-2 px-5 py-3 font-bold transition ${
                filterType === "video"
                  ? "border-[#21392f] bg-[#21392f] text-white shadow-[4px_4px_0_#b7442e]"
                  : "border-[#21392f]/40 bg-white text-[#21392f] hover:border-[#21392f]"
              }`}
            >
              影片 ({bookmarks.filter(b => b.type === "video").length})
            </button>
            <button
              onClick={() => setFilterType("song")}
              className={`rounded-none border-2 px-5 py-3 font-bold transition ${
                filterType === "song"
                  ? "border-[#21392f] bg-[#21392f] text-white shadow-[4px_4px_0_#b7442e]"
                  : "border-[#21392f]/40 bg-white text-[#21392f] hover:border-[#21392f]"
              }`}
            >
              歌曲 ({bookmarks.filter(b => b.type === "song").length})
            </button>
            <button
              onClick={() => setFilterType("podcast")}
              className={`rounded-none border-2 px-5 py-3 font-bold transition ${
                filterType === "podcast"
                  ? "border-[#21392f] bg-[#21392f] text-white shadow-[4px_4px_0_#b7442e]"
                  : "border-[#21392f]/40 bg-white text-[#21392f] hover:border-[#21392f]"
              }`}
            >
              Podcast ({bookmarks.filter(b => b.type === "podcast").length})
            </button>
          </div>

          {/* 收藏列表 */}
          {filteredBookmarks.length === 0 ? (
            <div className="rounded-none border-2 border-[#21392f] bg-[#fff8e9] p-8 text-center">
              <p className="text-lg font-semibold text-[#314a40]">
                {filterType === "all" ? "還沒有收藏任何內容" : `這個類別沒有收藏`}
              </p>
              <p className="mt-3 text-sm text-[#314a40]/70">
                {filterType === "all" ? "去首頁或後台找到喜歡的影片、歌曲或 Podcast，點❤️ 加入收藏吧！" : "切換其他類別試試"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookmarks.map((bookmark) => (
                <div
                  key={`${bookmark.id}-${bookmark.type}`}
                  className="flex items-center justify-between rounded-none border-2 border-[#21392f]/20 bg-white p-4 shadow-[2px_2px_0_#21392f]/10 transition hover:shadow-[4px_4px_0_#21392f]/20"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="inline-block rounded-none bg-[#21392f] px-3 py-1 text-xs font-black text-white">
                        {bookmark.type === "video" ? "影片" : bookmark.type === "song" ? "歌曲" : "Podcast"}
                      </span>
                      <p className="font-bold text-[#21392f]">{bookmark.title}</p>
                    </div>
                    <p className="mt-2 text-xs text-[#314a40]/60">
                      新增於 {new Date(bookmark.addedAt).toLocaleDateString("zh-TW", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => removeBookmark(bookmark.id, bookmark.type)}
                    className="ml-4 flex h-10 w-10 items-center justify-center rounded-none border-2 border-[#b7442e] bg-white text-[#b7442e] transition hover:bg-[#b7442e] hover:text-white"
                    title="移除收藏"
                  >
                    <Heart className="h-5 w-5" fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
