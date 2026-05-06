import { useEffect, useState } from "react";

export type BookmarkItem = {
  id: string;
  type: "video" | "song" | "podcast";
  title: string;
  addedAt: string;
};

const STORAGE_KEY = "nihongo-bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初始化：從 LocalStorage 讀取收藏
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error("載入收藏失敗:", error);
    }
    setIsLoaded(true);
  }, []);

  // 儲存到 LocalStorage
  const saveToStorage = (newBookmarks: BookmarkItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
    } catch (error) {
      console.error("儲存收藏失敗:", error);
    }
  };

  // 新增收藏
  const addBookmark = (id: string, type: "video" | "song" | "podcast", title: string) => {
    const exists = bookmarks.some(b => b.id === id && b.type === type);
    if (!exists) {
      const newBookmarks = [
        ...bookmarks,
        {
          id,
          type,
          title,
          addedAt: new Date().toISOString(),
        },
      ];
      setBookmarks(newBookmarks);
      saveToStorage(newBookmarks);
      return true;
    }
    return false;
  };

  // 移除收藏
  const removeBookmark = (id: string, type: "video" | "song" | "podcast") => {
    const newBookmarks = bookmarks.filter(b => !(b.id === id && b.type === type));
    setBookmarks(newBookmarks);
    saveToStorage(newBookmarks);
  };

  // 檢查是否已收藏
  const isBookmarked = (id: string, type: "video" | "song" | "podcast"): boolean => {
    return bookmarks.some(b => b.id === id && b.type === type);
  };

  // 取得所有收藏
  const getBookmarks = (type?: "video" | "song" | "podcast") => {
    if (type) {
      return bookmarks.filter(b => b.type === type);
    }
    return bookmarks;
  };

  // 清除所有收藏
  const clearAllBookmarks = () => {
    setBookmarks([]);
    saveToStorage([]);
  };

  return {
    bookmarks,
    isLoaded,
    addBookmark,
    removeBookmark,
    isBookmarked,
    getBookmarks,
    clearAllBookmarks,
  };
}
