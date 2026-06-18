import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "../i18n";
import { updateProfile } from "../features/authSlice";
import toast from "react-hot-toast";
import { Camera, X } from "lucide-react";
export default function ProfileEditor() {
  const {
    t
  } = useTranslation();
  const dispatch = useDispatch();
  const {
    user
  } = useSelector(state => state.auth);
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    nickname: user?.nickname || "",
    avatar: user?.avatar || "",
    bio: user?.bio || ""
  });
  const [preview, setPreview] = useState(user?.avatar || "");
  const handleSave = () => {
    dispatch(updateProfile({
      nickname: form.nickname.trim(),
      avatar: preview,
      bio: form.bio.trim()
    }));
    toast.success(t('common.save'));
  };
  const handleFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result;
      setPreview(dataUrl);
      setForm(f => ({
        ...f,
        avatar: dataUrl
      }));
    };
    reader.readAsDataURL(file);
  };
  const removeAvatar = () => {
    setPreview("");
    setForm(f => ({
      ...f,
      avatar: ""
    }));
  };
  return <div className="space-y-6">       <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Profile</h2>        <div className="flex items-center gap-5">         <div className="relative group">           <div className="size-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-4 ring-surface-100 dark:ring-surface-800">             {preview ? <img src={preview} alt="" className="size-full object-cover" /> : (form.nickname?.[0] || user?.name?.[0] || "?").toUpperCase()}           </div>           <button onClick={() => fileRef.current?.click()} className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">             <Camera size={18} className="text-white" />           </button>           {preview && <button onClick={removeAvatar} className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-white flex items-center justify-center"><X size={10} /></button>}           <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />         </div>         <div>           <p className="font-medium text-surface-900 dark:text-surface-100">{user?.name}</p>           <p className="text-sm text-surface-400 dark:text-surface-500">{user?.email}</p>         </div>       </div>        <div className="space-y-4 max-w-md">         <div>           <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Surnom / Nickname</label>           <input type="text" value={form.nickname} onChange={e => setForm(f => ({
          ...f,
          nickname: e.target.value
        }))} placeholder="Your nickname" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />         </div>         <div>           <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Bio</label>           <textarea value={form.bio} onChange={e => setForm(f => ({
          ...f,
          bio: e.target.value
        }))} placeholder="A short bio about yourself" rows={3} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all resize-none" />         </div>         <div>           <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Avatar URL</label>           <input type="url" value={form.avatar} onChange={e => {
          setForm(f => ({
            ...f,
            avatar: e.target.value
          }));
          setPreview(e.target.value);
        }} placeholder="https://example.com/avatar.jpg" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />         </div>       </div>        <button onClick={handleSave} className="px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 transition-all">         {t('common.save')}       </button>     </div>;
}