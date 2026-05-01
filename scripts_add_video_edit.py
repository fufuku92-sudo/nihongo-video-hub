from pathlib import Path
import re

path = Path('/home/ubuntu/nihongo-video-hub/client/src/pages/Home.tsx')
text = path.read_text()

text = text.replace(
    'import { BookOpen, ExternalLink, Headphones, Lock, LogOut, Map, PlayCircle, Plus, Search, ShieldCheck, Train, Trash2, Video } from "lucide-react";',
    'import { BookOpen, ExternalLink, Headphones, Lock, LogOut, Map, Pencil, PlayCircle, Plus, Search, ShieldCheck, Train, Trash2, Video, X } from "lucide-react";',
)

old_delete_block = '''  const deleteVideoMutation = trpc.videos.delete.useMutation({
    onSuccess: async (_result, variables) => {
      await utils.videos.list.invalidate();
      if (selectedVideoId === variables.youtubeId) setSelectedVideoId(seedVideos[0].id);
      setFormMessage("已從資料庫移除自訂影片。預設影片不會被刪除。");
    },
    onError: (mutationError) => {
      setFormMessage(mutationError.message || "刪除失敗，請確認你已登入且具有管理員權限。");
    },
  });
'''
new_delete_block = '''  const updateVideoMutation = trpc.videos.update.useMutation({
    onSuccess: async (video) => {
      await utils.videos.list.invalidate();
      if (video) {
        setSelectedVideoId(video.youtubeId);
        setActiveLevel(video.level as Level);
        setActiveTopic("全部");
      }
      setEditingVideoId(null);
      setFormMessage("已更新影片資訊。標題、級別與備註會同步到資料庫。");
    },
    onError: (mutationError) => {
      setFormMessage(mutationError.message || "更新失敗，請確認你已登入且具有管理員權限。");
    },
  });
  const deleteVideoMutation = trpc.videos.delete.useMutation({
    onSuccess: async (_result, variables) => {
      await utils.videos.list.invalidate();
      if (selectedVideoId === variables.youtubeId) setSelectedVideoId(seedVideos[0].id);
      if (editingVideoId === variables.youtubeId) setEditingVideoId(null);
      setFormMessage("已從資料庫移除自訂影片。預設影片不會被刪除。");
    },
    onError: (mutationError) => {
      setFormMessage(mutationError.message || "刪除失敗，請確認你已登入且具有管理員權限。");
    },
  });
'''
if 'trpc.videos.update.useMutation' not in text:
    if old_delete_block not in text:
        raise SystemExit('delete mutation block not found')
    text = text.replace(old_delete_block, new_delete_block)

old_state = '''  const [form, setForm] = useState<FormState>(emptyForm);
  const [formMessage, setFormMessage] = useState("請以管理員帳號登入後新增或刪除自訂影片。資料會同步到資料庫。");
'''
new_state = '''  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [formMessage, setFormMessage] = useState("請以管理員帳號登入後新增、編輯或刪除自訂影片。資料會同步到資料庫。");
'''
if 'const [editingVideoId, setEditingVideoId]' not in text:
    if old_state not in text:
        raise SystemExit('state block not found')
    text = text.replace(old_state, new_state)

text = text.replace(
    '  const isMutating = addVideoMutation.isPending || deleteVideoMutation.isPending;',
    '  const isMutating = addVideoMutation.isPending || updateVideoMutation.isPending || deleteVideoMutation.isPending;',
)

new_functions = '''  function startEditVideo(video: VideoItem) {
    if (!isAdmin) {
      setFormMessage(isAuthenticated ? "此帳號不是管理員，無法編輯影片。" : "請先登入管理員帳號，才能編輯影片。");
      return;
    }
    setEditingVideoId(video.id);
    setEditForm({
      url: video.id,
      title: video.title,
      channel: video.channel,
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
'''
if 'function startEditVideo' not in text:
    text = re.sub(
        r'  function removeCustomVideo\(id: string\) \{\n    if \(!isAdmin\) \{\n      setFormMessage\(isAuthenticated \? "此帳號不是管理員，無法刪除影片。" : "請先登入管理員帳號，才能刪除影片。"\);\n      return;\n    \}\n    deleteVideoMutation\.mutate\(\{ youtubeId: id \}\);\n  \}\n\n',
        new_functions + '\n',
        text,
        count=1,
    )
    if 'function startEditVideo' not in text:
        raise SystemExit('functions regex replacement failed')

old_list = '''                      {customVideos.map((video) => (
                        <div key={video.id} className="flex items-start justify-between gap-4 border border-[#21392f]/20 bg-[#fff8e9] p-4">
                          <div>
                            <p className="text-sm font-black text-[#b7442e]">{video.level}｜{video.topic}</p>
                            <p className="mt-1 font-bold">{video.title}</p>
                            <p className="mt-1 text-sm text-[#314a40]">{video.channel}</p>
                          </div>
                          <button disabled={isMutating} onClick={() => removeCustomVideo(video.id)} className="border border-[#21392f]/30 p-2 text-[#b7442e] transition hover:bg-[#b7442e] hover:text-[#fff7e6] disabled:cursor-not-allowed disabled:opacity-50" aria-label="移除自訂影片">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
'''
new_list = '''                      {customVideos.map((video) => (
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
                              <div>
                                <label className="mb-2 block text-sm font-black uppercase tracking-[0.18em]">JLPT 級別</label>
                                <select value={editForm.level} onChange={(event) => setEditForm({ ...editForm, level: event.target.value as Level })} className="w-full border-2 border-[#21392f]/40 bg-[#fff8e9] px-4 py-3 text-base outline-none focus:border-[#b7442e]">
                                  {levels.map((item) => <option key={item.level} value={item.level}>{item.level}｜{item.label}</option>)}
                                </select>
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
'''
if 'editingVideoId === video.id' not in text:
    if old_list not in text:
        raise SystemExit('custom video list block not found')
    text = text.replace(old_list, new_list)

path.write_text(text)
print('updated Home.tsx')
