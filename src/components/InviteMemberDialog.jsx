import { useState } from "react";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { useTranslation } from "../i18n";
import toast from "react-hot-toast";
import { addMember } from "../features/workspaceSlice";
const InviteMemberDialog = ({
  isOpen,
  setIsOpen
}) => {
  const {
    t
  } = useTranslation();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "member"
  });
  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.email.trim()) return dispatch(addMember({
      id: "mem_" + Date.now(),
      name: formData.email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      email: formData.email.trim(),
      role: formData.role,
      joinedAt: new Date().toISOString()
    }));
    toast.success(t('common.save'));
    setIsOpen(false);
    setFormData({
      email: "",
      role: "member"
    });
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">       <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-2xl w-full max-w-md">         <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-800">           <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{t('inviteMember.title')}</h2>           <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"><X size={18} /></button>         </div>         <form onSubmit={handleSubmit} className="p-6 space-y-5">           <div>             <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('inviteMember.email')}</label>             <input type="email" value={formData.email} onChange={e => setFormData({
            ...formData,
            email: e.target.value
          })} placeholder={t('inviteMember.emailPlaceholder')} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" required autoFocus />           </div>           <div>             <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t('inviteMember.role')}</label>             <select value={formData.role} onChange={e => setFormData({
            ...formData,
            role: e.target.value
          })} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all">               <option value="member">{t('settings.member')}</option>               <option value="admin">{t('settings.admin')}</option>               <option value="viewer">{t('settings.viewer')}</option>             </select>           </div>           <div className="flex justify-end gap-3 pt-2 border-t border-surface-100 dark:border-surface-800">             <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2.5 text-sm font-medium rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">{t('common.cancel')}</button>             <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all">{isSubmitting ? t('common.creating') : t('common.invite')}</button>           </div>         </form>       </div>     </div>;
};
export default InviteMemberDialog;