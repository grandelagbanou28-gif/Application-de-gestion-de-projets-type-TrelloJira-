import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "../i18n";
import { Paperclip, Image, FileText, Link, Trash2, Plus, Upload } from "lucide-react";
import { nanoid } from "nanoid";
import { format } from "date-fns";
import { addAttachment, deleteAttachment } from "../features/workspaceSlice";
const typeIcons = {
  image: Image,
  pdf: FileText,
  link: Link,
  other: Paperclip
};
function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
;
const AttachmentList = ({
  projectId,
  taskId,
  attachments
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const fileInputRef = useRef(null);
  const handleAttachUrl = () => {
    if (!url.trim() || !name.trim()) return dispatch(addAttachment({
      projectId,
      taskId,
      attachment: {
        id: nanoid(),
        name: name.trim(),
        url: url.trim(),
        type: "link",
        size: 0,
        uploadedBy: user?.name || t('attachment.unknown'),
        uploadedAt: new Date().toISOString()
      }
    }));
    setUrl("");
    setName("");
    setShowForm(false);
  };
  const handleFileUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let type = "other";
      if (["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"].includes(ext)) type = "image";else if (ext === "pdf") type = "pdf";
      dispatch(addAttachment({
        projectId,
        taskId,
        attachment: {
          id: nanoid(),
          name: file.name,
          url: reader.result,
          type,
          size: file.size,
          uploadedBy: user?.name || t('attachment.unknown'),
          uploadedAt: new Date().toISOString()
        }
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const handleDelete = attachmentId => {
    if (window.confirm(t('attachment.deleteConfirm'))) {
      dispatch(deleteAttachment({
        projectId,
        taskId,
        attachmentId
      }));
    }
  };
  const handleAttachmentClick = attachment => {
    if (attachment.url) {
      window.open(attachment.url, "_blank", "noopener,noreferrer");
    }
  };
  return <div>       <div className="flex items-center justify-between mb-4">                 <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          {t('attachment.title', { count: attachments?.length || 0 })}
        </h3>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors">
          <Plus size={14} className={showForm ? "rotate-45" : ""} />
          {showForm ? t('attachment.close') : t('attachment.add')}
        </button>       </div>        {showForm && <div className="mb-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 space-y-3">           <div className="flex gap-2">                         <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder={t('attachment.url')} className="flex-1 px-3 py-2 text-sm rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('attachment.name')} className="flex-1 px-3 py-2 text-sm rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
            <button onClick={handleAttachUrl} disabled={!url.trim() || !name.trim()} className="px-3 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 disabled:opacity-50 transition-all">
              {t('attachment.attach')}
            </button>           </div>           <div className="flex items-center gap-3">             <span className="text-xs text-surface-400 dark:text-surface-500">or</span>             <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700 cursor-pointer transition-colors">               <Upload size={14} />               Upload File               <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />             </label>           </div>         </div>}        {!attachments || attachments.length === 0 ? <div className="text-center py-8">           <div className="w-12 h-12 mx-auto mb-3 bg-surface-100 dark:bg-surface-800 rounded-xl flex items-center justify-center">             <Paperclip size={20} className="text-surface-400" />           </div>           <p className="text-sm text-surface-500 dark:text-surface-400">No attachments yet</p>         </div> : <div className="space-y-2">           {attachments.map(attachment => {
        const TypeIcon = typeIcons[attachment.type] || Paperclip;
        return <div key={attachment.id} onClick={() => handleAttachmentClick(attachment)} className="group flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer">                 <div className="p-2 rounded-lg bg-surface-100 dark:bg-surface-800 shrink-0">                   <TypeIcon size={16} className="text-surface-500 dark:text-surface-400" />                 </div>                 <div className="flex-1 min-w-0">                   <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">                     {attachment.name}                   </p>                   <div className="flex items-center gap-2 mt-0.5 text-xs text-surface-400 dark:text-surface-500">                     {attachment.size > 0 && <span>{formatFileSize(attachment.size)}</span>}                     {attachment.uploadedAt && <span>{format(new Date(attachment.uploadedAt), "MMM d, yyyy")}</span>}                     {attachment.uploadedBy && <span>{attachment.uploadedBy}</span>}                   </div>                 </div>                 <button onClick={e => {
            e.stopPropagation();
            handleDelete(attachment.id);
          }} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">                   <Trash2 size={14} />                 </button>               </div>;
      })}         </div>}     </div>;
};
export default AttachmentList;