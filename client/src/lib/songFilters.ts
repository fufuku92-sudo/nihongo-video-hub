export type SongFilterLevel = "全部難度" | "N5" | "N4" | "N3" | "N2" | "N1";

export type SongFilterItem = {
  artist: string;
  level: string;
};

export const ALL_SONG_ARTISTS = "全部歌手";
export const ALL_SONG_LEVELS: SongFilterLevel = "全部難度";

export function getSongArtists<TSong extends SongFilterItem>(songs: TSong[]) {
  return Array.from(new Set(songs.map((song) => song.artist).filter(Boolean))).sort((a, b) => a.localeCompare(b, "zh-Hant"));
}

export function filterSongs<TSong extends SongFilterItem>(songs: TSong[], artist: string, level: SongFilterLevel) {
  return songs.filter((song) => {
    const artistMatched = artist === ALL_SONG_ARTISTS || song.artist === artist;
    const levelMatched = level === ALL_SONG_LEVELS || song.level === level;
    return artistMatched && levelMatched;
  });
}
