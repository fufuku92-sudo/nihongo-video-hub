export type StudyMode = "videos" | "songs";

export type StudyModeOption = {
  value: StudyMode;
  label: string;
  description: string;
  accent: "ink" | "vermilion";
};

export const STUDY_MODE_OPTIONS: StudyModeOption[] = [
  {
    value: "videos",
    label: "影片學習",
    description: "依 JLPT 級別與主題找教學影片。",
    accent: "ink",
  },
  {
    value: "songs",
    label: "日文歌曲",
    description: "用歌曲練聽力、單字與語感。",
    accent: "vermilion",
  },
];

export function getStudyModeOption(mode: StudyMode) {
  return STUDY_MODE_OPTIONS.find((option) => option.value === mode);
}
