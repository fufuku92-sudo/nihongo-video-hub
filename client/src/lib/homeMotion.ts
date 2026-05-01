export const HOME_MOTION = {
  page: "motion-page-enter",
  nav: "motion-rise motion-delay-1",
  heroBadge: "motion-rise motion-delay-2",
  heroTitle: "motion-rise motion-delay-3",
  heroCopy: "motion-rise motion-delay-4",
  heroActions: "motion-rise motion-delay-5",
  heroImage: "motion-kenburns motion-delay-2",
  switchSection: "motion-section-enter",
  switchTabs: "motion-pop motion-delay-2",
  switchTrigger: "motion-switch-trigger",
  tabViewport: "motion-tab-viewport",
  videoTabPanel: "motion-tab-panel motion-tab-panel-videos",
  songTabPanel: "motion-tab-panel motion-tab-panel-songs",
  videoPanel: "motion-slide-ticket",
  videoGrid: "motion-stagger-grid",
  songPanel: "motion-slide-ticket",
  songNotes: "motion-stagger-grid motion-delay-2",
  songGrid: "motion-stagger-grid",
  mobileSwitcher: "motion-dock-enter",
  mobileSwitcherButton: "motion-switch-button",
  activeMobileSwitcherButton: "motion-switch-button-active",
} as const;

export const MOTION_REDUCED_MEDIA_QUERY = "prefers-reduced-motion: reduce";

export type HomeMotionKey = keyof typeof HOME_MOTION;
