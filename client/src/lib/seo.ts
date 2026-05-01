export const HOME_SEO = {
  title: "Nihongo Video Hub｜JLPT N5-N1 日文學習影片與歌曲",
  description: "免費非營利日文學習平台，整理 JLPT N5 到 N1 的 YouTube 教學影片與日文歌曲，協助學習者依程度練習文法、單字、聽解與讀解。",
  keywords: [
    "日文學習",
    "JLPT",
    "N5",
    "N4",
    "N3",
    "N2",
    "N1",
    "YouTube 日文影片",
    "日文歌曲",
    "日語文法",
    "日語單字",
    "日語聽解",
    "日語讀解",
  ],
} as const;

export function applySeoMetadata(seo: typeof HOME_SEO, documentRef: Document = document) {
  documentRef.title = seo.title;

  const description = ensureMetaTag(documentRef, "description");
  description.setAttribute("content", seo.description);

  const keywords = ensureMetaTag(documentRef, "keywords");
  keywords.setAttribute("content", seo.keywords.join(", "));
}

function ensureMetaTag(documentRef: Document, name: string) {
  const existing = documentRef.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (existing) return existing;

  const created = documentRef.createElement("meta");
  created.setAttribute("name", name);
  documentRef.head.appendChild(created);
  return created;
}
