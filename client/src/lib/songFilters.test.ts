import { describe, expect, it } from "vitest";

import { ALL_SONG_ARTISTS, ALL_SONG_LEVELS, filterSongs, getSongArtists } from "./songFilters";

const songs = [
  { title: "Song A", artist: "Ado", level: "N3" },
  { title: "Song B", artist: "YOASOBI", level: "N4" },
  { title: "Song C", artist: "Ado", level: "N2" },
  { title: "Song D", artist: "米津玄師", level: "N3" },
];

describe("songFilters", () => {
  it("returns sorted unique artists", () => {
    expect(getSongArtists(songs)).toEqual(["Ado", "YOASOBI", "米津玄師"]);
  });

  it("keeps all songs when both filters are set to all", () => {
    expect(filterSongs(songs, ALL_SONG_ARTISTS, ALL_SONG_LEVELS)).toHaveLength(4);
  });

  it("filters songs by artist", () => {
    expect(filterSongs(songs, "Ado", ALL_SONG_LEVELS).map((song) => song.title)).toEqual(["Song A", "Song C"]);
  });

  it("filters songs by JLPT level", () => {
    expect(filterSongs(songs, ALL_SONG_ARTISTS, "N3").map((song) => song.title)).toEqual(["Song A", "Song D"]);
  });

  it("combines artist and JLPT level filters", () => {
    expect(filterSongs(songs, "Ado", "N2").map((song) => song.title)).toEqual(["Song C"]);
  });
});
