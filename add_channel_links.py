from pathlib import Path
import json

root = Path('/home/ubuntu/nihongo-video-hub')
channels = json.loads((root / 'channel_urls.json').read_text())

# 1) Update database schema
schema_path = root / 'drizzle/schema.ts'
schema = schema_path.read_text()
schema = schema.replace('  channel: text("channel").notNull(),\n  level: mysqlEnum("level", ["N5", "N4", "N3", "N2", "N1"]).notNull(),', '  channel: text("channel").notNull(),\n  channelUrl: text("channelUrl"),\n  level: mysqlEnum("level", ["N5", "N4", "N3", "N2", "N1"]).notNull(),')
schema_path.write_text(schema)

# 2) Update server db helpers
db_path = root / 'server/db.ts'
db = db_path.read_text()
db = db.replace('        channel: video.channel,\n        level: video.level,', '        channel: video.channel,\n        channelUrl: video.channelUrl ?? null,\n        level: video.level,')
db = db.replace('  updates: Pick<InsertVideo, "title" | "level" | "reason">,', '  updates: Pick<InsertVideo, "title" | "channel" | "channelUrl" | "level" | "reason">,')
db = db.replace('      title: updates.title,\n      level: updates.level,', '      title: updates.title,\n      channel: updates.channel,\n      channelUrl: updates.channelUrl ?? null,\n      level: updates.level,')
db_path.write_text(db)

# 3) Update tRPC router validation and payloads
router_path = root / 'server/routers.ts'
router = router_path.read_text()
router = router.replace('const youtubeIdSchema = z\n  .string()\n  .trim()\n  .min(6, "影片 ID 太短")\n  .max(32, "影片 ID 太長")\n  .regex(/^[a-zA-Z0-9_-]+$/, "影片 ID 只能包含英數字、底線與連字號");\n\nconst editableVideoFieldsSchema = z.object({\n  title: z.string().trim().min(1, "請填寫影片標題").max(300, "影片標題過長"),\n  level: levelSchema,\n  reason: z.string().trim().max(800, "備註過長").optional(),\n});\n\nconst videoInputSchema = editableVideoFieldsSchema.extend({\n  youtubeId: youtubeIdSchema,\n  channel: z.string().trim().min(1, "請填寫頻道名稱").max(200, "頻道名稱過長"),\n  topic: topicSchema,\n});', 'const youtubeIdSchema = z\n  .string()\n  .trim()\n  .min(6, "影片 ID 太短")\n  .max(32, "影片 ID 太長")\n  .regex(/^[a-zA-Z0-9_-]+$/, "影片 ID 只能包含英數字、底線與連字號");\n\nconst optionalChannelUrlSchema = z.preprocess(\n  value => (typeof value === "string" && value.trim() === "" ? undefined : value),\n  z.string().trim().url("請填寫有效的頻道網址").max(500, "頻道網址過長").optional(),\n);\n\nconst editableVideoFieldsSchema = z.object({\n  title: z.string().trim().min(1, "請填寫影片標題").max(300, "影片標題過長"),\n  channel: z.string().trim().min(1, "請填寫頻道名稱").max(200, "頻道名稱過長"),\n  channelUrl: optionalChannelUrlSchema,\n  level: levelSchema,\n  reason: z.string().trim().max(800, "備註過長").optional(),\n});\n\nconst videoInputSchema = editableVideoFieldsSchema.extend({\n  youtubeId: youtubeIdSchema,\n  topic: topicSchema,\n});')
router = router.replace('        channel: input.channel,\n        level: input.level,', '        channel: input.channel,\n        channelUrl: input.channelUrl || null,\n        level: input.level,')
router = router.replace('        title: input.title,\n        level: input.level,', '        title: input.title,\n        channel: input.channel,\n        channelUrl: input.channelUrl || null,\n        level: input.level,')
router_path.write_text(router)

# 4) Update Admin page
admin_path = root / 'client/src/pages/Admin.tsx'
admin = admin_path.read_text()
admin = admin.replace('import { Lock, LogOut, Pencil, Plus, ShieldCheck, Train, Trash2, X } from "lucide-react";', 'import { ExternalLink, Lock, LogOut, Pencil, Plus, ShieldCheck, Train, Trash2, X } from "lucide-react";')
admin = admin.replace('  channel: string;\n  level: Level;', '  channel: string;\n  channelUrl?: string | null;\n  level: Level;')
admin = admin.replace('  channel: string;\n  level: Level;', '  channel: string;\n  channelUrl: string;\n  level: Level;')
admin = admin.replace('  channel: "",\n  level: "N5",', '  channel: "",\n  channelUrl: "",\n  level: "N5",')
admin = admin.replace('      channel: video.channel,\n      level: video.level as Level,', '      channel: video.channel,\n      channelUrl: video.channelUrl,\n      level: video.level as Level,')
admin = admin.replace('      channel: form.channel.trim() || "自訂來源",\n      level: form.level,', '      channel: form.channel.trim() || "自訂來源",\n      channelUrl: form.channelUrl.trim() || undefined,\n      level: form.level,')
admin = admin.replace('      channel: video.channel,\n      level: video.level,', '      channel: video.channel,\n      channelUrl: video.channelUrl || "",\n      level: video.level,')
admin = admin.replace('      title: editForm.title.trim(),\n      level: editForm.level,', '      title: editForm.title.trim(),\n      channel: editForm.channel.trim() || "自訂來源",\n      channelUrl: editForm.channelUrl.trim() || undefined,\n      level: editForm.level,')
admin = admin.replace('                  <div>\n                    <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">頻道名稱</label>\n                    <input value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" placeholder="例如：Elsaの放送" />\n                  </div>', '                  <div>\n                    <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">頻道名稱</label>\n                    <input value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" placeholder="例如：Elsaの放送" />\n                  </div>\n                  <div>\n                    <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">原頻道網址</label>\n                    <input value={form.channelUrl} onChange={(event) => setForm({ ...form, channelUrl: event.target.value })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" placeholder="例如：https://www.youtube.com/@ElsaJapanese" />\n                    <p className="mt-2 text-xs font-semibold leading-5 text-[#314a40]/75">填入後公開影片卡片會顯示「前往原頻道」按鈕，協助創作者增加曝光。</p>\n                  </div>')
admin = admin.replace('                              <div>\n                                <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">JLPT 級別</label>\n                                <select value={editForm.level} onChange={(event) => setEditForm({ ...editForm, level: event.target.value as Level })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]">\n                                  {levels.map((item) => <option key={item.level} value={item.level}>{item.level}｜{item.label}</option>)}\n                                </select>\n                              </div>', '                              <div className="grid gap-4 md:grid-cols-2">\n                                <div>\n                                  <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">頻道名稱</label>\n                                  <input value={editForm.channel} onChange={(event) => setEditForm({ ...editForm, channel: event.target.value })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" />\n                                </div>\n                                <div>\n                                  <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">JLPT 級別</label>\n                                  <select value={editForm.level} onChange={(event) => setEditForm({ ...editForm, level: event.target.value as Level })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]">\n                                    {levels.map((item) => <option key={item.level} value={item.level}>{item.level}｜{item.label}</option>)}\n                                  </select>\n                                </div>\n                              </div>\n                              <div>\n                                <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">原頻道網址</label>\n                                <input value={editForm.channelUrl} onChange={(event) => setEditForm({ ...editForm, channelUrl: event.target.value })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]" placeholder="https://www.youtube.com/@channel" />\n                              </div>')
admin = admin.replace('                                <p className="mt-1 text-sm text-[#314a40]">{video.channel}</p>', '                                <p className="mt-1 text-sm text-[#314a40]">{video.channel}</p>\n                                {video.channelUrl ? (\n                                  <a href={video.channelUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#24628f] underline decoration-[#24628f]/40 underline-offset-4">\n                                    原頻道連結 <ExternalLink className="h-3 w-3" />\n                                  </a>\n                                ) : null}')
admin_path.write_text(admin)

# 5) Update Home page type, seed data, custom mapping and card UI
home_path = root / 'client/src/pages/Home.tsx'
home = home_path.read_text()
home = home.replace('  channel: string;\n  level: Level;', '  channel: string;\n  channelUrl?: string | null;\n  level: Level;')
# Add channelUrl to seed video object literals by id
for vid, data in channels.items():
    url = data.get('author_url')
    if not url:
        continue
    old = f'{{ id: "{vid}", '
    new = f'{{ id: "{vid}", channelUrl: "{url}", '
    home = home.replace(old, new)
home = home.replace('      channel: video.channel,\n      level: video.level as Level,', '      channel: video.channel,\n      channelUrl: video.channelUrl,\n      level: video.level as Level,')
home = home.replace('                    <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-[#24628f]">來源頻道：{selectedVideo.channel}</p>', '                    <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-[#24628f]">來源頻道：{selectedVideo.channel}</p>')
home = home.replace('                    <a href={`https://www.youtube.com/watch?v=${selectedVideo.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#21392f] bg-[#21392f] px-4 py-2 text-sm font-bold text-[#fff7e6] transition hover:-translate-y-0.5">\n                      到 YouTube 原頁 <ExternalLink className="h-4 w-4" />\n                    </a>\n                    <span className="inline-flex items-center border border-[#21392f]/25 px-4 py-2 text-sm font-bold text-[#21392f]/80">標記：{selectedVideo.confidence}</span>', '                    <a href={`https://www.youtube.com/watch?v=${selectedVideo.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#21392f] bg-[#21392f] px-4 py-2 text-sm font-bold text-[#fff7e6] transition hover:-translate-y-0.5">\n                      到 YouTube 原頁 <ExternalLink className="h-4 w-4" />\n                    </a>\n                    {selectedVideo.channelUrl ? (\n                      <a href={selectedVideo.channelUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#24628f] bg-[#f8f0de] px-4 py-2 text-sm font-bold text-[#24628f] transition hover:-translate-y-0.5 hover:bg-[#24628f] hover:text-[#fff7e6]">\n                        前往原頻道 <ExternalLink className="h-4 w-4" />\n                      </a>\n                    ) : null}\n                    <span className="inline-flex items-center border border-[#21392f]/25 px-4 py-2 text-sm font-bold text-[#21392f]/80">標記：{selectedVideo.confidence}</span>')
old_card = '''                  <button
                    key={`${video.custom ? "custom" : "seed"}-${video.id}`}
                    onClick={() => setSelectedVideoId(video.id)}
                    className={`group min-h-[230px] border-2 bg-[#fff8e9] p-5 text-left transition duration-200 ${selectedVideo.id === video.id ? "border-[#b7442e] shadow-[7px_7px_0_#b7442e]" : "border-[#21392f]/20 hover:-translate-y-1 hover:border-[#21392f] hover:shadow-[7px_7px_0_#21392f]"}`}
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 bg-[#2f5d46] px-3 py-1 text-sm font-black text-[#fff7e6]">
                        {topicIcon(video.topic)} {video.level}｜{video.topic}
                      </span>
                      <PlayCircle className="h-7 w-7 text-[#b7442e] transition group-hover:scale-110" />
                    </div>
                    <h4 className="font-serif text-xl font-black leading-snug text-[#21392f]">{video.title}</h4>
                    <p className="mt-3 text-sm font-bold text-[#24628f]">{video.channel}</p>
                    <p className="mt-4 text-sm leading-6 text-[#314a40]">{video.reason}</p>
                  </button>'''
new_card = '''                  <article
                    key={`${video.custom ? "custom" : "seed"}-${video.id}`}
                    className={`group flex min-h-[250px] flex-col border-2 bg-[#fff8e9] p-5 text-left transition duration-200 ${selectedVideo.id === video.id ? "border-[#b7442e] shadow-[7px_7px_0_#b7442e]" : "border-[#21392f]/20 hover:-translate-y-1 hover:border-[#21392f] hover:shadow-[7px_7px_0_#21392f]"}`}
                  >
                    <button type="button" onClick={() => setSelectedVideoId(video.id)} className="flex flex-1 flex-col text-left">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 bg-[#2f5d46] px-3 py-1 text-sm font-black text-[#fff7e6]">
                          {topicIcon(video.topic)} {video.level}｜{video.topic}
                        </span>
                        <PlayCircle className="h-7 w-7 text-[#b7442e] transition group-hover:scale-110" />
                      </div>
                      <h4 className="font-serif text-xl font-black leading-snug text-[#21392f]">{video.title}</h4>
                      <p className="mt-3 text-sm font-bold text-[#24628f]">{video.channel}</p>
                      <p className="mt-4 text-sm leading-6 text-[#314a40]">{video.reason}</p>
                    </button>
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-[#21392f]/15 pt-4">
                      <button type="button" onClick={() => setSelectedVideoId(video.id)} className="inline-flex items-center gap-2 border border-[#21392f] bg-[#21392f] px-3 py-2 text-xs font-black text-[#fff7e6] transition hover:-translate-y-0.5">
                        播放影片 <PlayCircle className="h-3.5 w-3.5" />
                      </button>
                      {video.channelUrl ? (
                        <a href={video.channelUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#24628f] bg-[#f8f0de] px-3 py-2 text-xs font-black text-[#24628f] transition hover:-translate-y-0.5 hover:bg-[#24628f] hover:text-[#fff7e6]">
                          前往原頻道 <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </article>'''
home = home.replace(old_card, new_card)
home_path.write_text(home)

# 6) Update router tests
test_path = root / 'server/videos.router.test.ts'
test = test_path.read_text()
test = test.replace('        channel: "Nihongo Channel",\n        level: "N5",', '        channel: "Nihongo Channel",\n        channelUrl: "https://www.youtube.com/@nihongo",\n        level: "N5",')
test = test.replace('      channel: "Elsaの放送",\n      level: "N3",', '      channel: "Elsaの放送",\n      channelUrl: "https://www.youtube.com/@ElsaJapanese",\n      level: "N3",')
test = test.replace('        createdByUserId: 7,\n', '        channelUrl: "https://www.youtube.com/@ElsaJapanese",\n        createdByUserId: 7,\n', 1)
test = test.replace('        channel: "Nihongo Channel",\n        level: "N2",', '        channel: "Nihongo Channel",\n        channelUrl: "https://www.youtube.com/@nihongo",\n        level: "N2",')
test = test.replace('  it("allows admins to update persisted video title, level and reason", async () => {', '  it("allows admins to update persisted video title, channel link, level and reason", async () => {')
test = test.replace('      channel: "Existing Channel",\n      level: input.level,', '      channel: input.channel,\n      channelUrl: input.channelUrl,\n      level: input.level,')
test = test.replace('      title: "N4 文法整理更新版",\n      level: "N4",', '      title: "N4 文法整理更新版",\n      channel: "更新後頻道",\n      channelUrl: "https://www.youtube.com/@updated-channel",\n      level: "N4",')
test = test.replace('    expect(result?.level).toBe("N4");\n    expect(result?.reason).toBe("更新後的備註資訊。");', '    expect(result?.level).toBe("N4");\n    expect(result?.channel).toBe("更新後頻道");\n    expect(result?.channelUrl).toBe("https://www.youtube.com/@updated-channel");\n    expect(result?.reason).toBe("更新後的備註資訊。");')
test = test.replace('        title: "N4 文法整理更新版",\n        level: "N4",', '        title: "N4 文法整理更新版",\n        channel: "更新後頻道",\n        channelUrl: "https://www.youtube.com/@updated-channel",\n        level: "N4",')
test = test.replace('        title: "未授權更新",\n        level: "N4",', '        title: "未授權更新",\n        channel: "未授權頻道",\n        channelUrl: "https://www.youtube.com/@unauthorized",\n        level: "N4",')
test_path.write_text(test)
print('done')
