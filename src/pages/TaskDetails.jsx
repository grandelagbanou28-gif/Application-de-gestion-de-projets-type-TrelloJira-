import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, MessageCircle, Pen, ArrowLeft, Bug, Square, Zap, GitCommit, MessageSquare, CheckSquare, Plus, Trash2, Paperclip } from "lucide-react";
import { useTranslation } from "../i18n";
import { addComment, addSubtask, updateSubtask, deleteSubtask } from "../features/workspaceSlice";
import AttachmentList from "../components/AttachmentList";
import { nanoid } from "nanoid";
const typeConfig = {
  BUG: {
    icon: Bug,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10"
  },
  FEATURE: {
    icon: Zap,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10"
  },
  TASK: {
    icon: Square,
    color: "text-primary-600 dark:text-primary-400",
    bg: "bg-primary-500/10"
  },
  IMPROVEMENT: {
    icon: GitCommit,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10"
  },
  OTHER: {
    icon: MessageSquare,
    color: "text-surface-600 dark:text-surface-400",
    bg: "bg-surface-500/10"
  }
};
const statusStyles = {
  TODO: "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300",
  IN_PROGRESS: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
};
const priorityStyles = {
  LOW: "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  HIGH: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
};
const TaskDetails = () => {
  const {
    t
  } = useTranslation();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const taskId = searchParams.get("taskId");
  const {
    user
  } = useSelector(state => state.auth);
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [loading, setLoading] = useState(true);
  const {
    currentWorkspace
  } = useSelector(state => state.workspace);
  useEffect(() => {
    setLoading(true);
    if (!projectId || !taskId || !currentWorkspace) return;
    const proj = currentWorkspace.projects.find(p => p.id === projectId);
    if (!proj) return;
    const tsk = proj.tasks.find(t => t.id === taskId);
    if (!tsk) return setTask(tsk);
    setProject(proj);
    setLoading(false);
  }, [taskId, currentWorkspace]);
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: nanoid(),
      user: {
        id: user?.id,
        name: user?.name || t('common.you')
      },
      content: newComment,
      createdAt: new Date().toISOString()
    };
    dispatch(addComment({
      projectId,
      taskId,
      comment
    }));
    setNewComment("");
    toast.success(t('taskDetails.commentAdded'));
  };
  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const subtask = {
      id: nanoid(),
      title: newSubtask,
      done: false
    };
    dispatch(addSubtask({
      projectId,
      taskId,
      subtask
    }));
    setNewSubtask("");
  };
  const toggleSubtask = subtask => {
    dispatch(updateSubtask({
      projectId,
      taskId,
      subtask: {
        ...subtask,
        done: !subtask.done
      }
    }));
  };
  const handleDeleteSubtask = subtaskId => {
    dispatch(deleteSubtask({
      projectId,
      taskId,
      subtaskId
    }));
  };
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]">       <div className="size-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />     </div>;
  if (!task) return <div className="text-center py-20">       <p className="text-surface-600 dark:text-surface-400 font-medium">{t('taskDetails.taskNotFound')}</p>     </div>;
  const TypeIcon = typeConfig[task.type]?.icon || Square;
  const typeColor = typeConfig[task.type]?.color || "text-surface-500";
  const typeBg = typeConfig[task.type]?.bg || "bg-surface-500/10";
  return <div className="max-w-7xl mx-auto">       <div className="flex flex-col-reverse lg:flex-row gap-6">         <div className="flex-1 space-y-6">           <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden flex flex-col min-h-[60vh]">             <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800 flex items-center gap-2">               <MessageCircle size={18} className="text-surface-400" />               <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">{t('taskDetails.discussion')} ({task.comments?.length || 0})</h2>             </div>              <div className="flex-1 p-6 overflow-y-auto space-y-4">               {task.comments?.length > 0 ? task.comments.map(comment => <div key={comment.id} className={`flex gap-3 ${comment.user.id === user?.id ? "flex-row-reverse" : ""}`}>                     <div className="size-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">                       {comment.user.name[0].toUpperCase()}                     </div>                     <div className={`max-w-[75%] ${comment.user.id === user?.id ? "items-end" : "items-start"}`}>                       <div className={`p-3 rounded-2xl text-sm ${comment.user.id === user?.id ? "bg-primary-500 text-white rounded-tr-sm" : "bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded-tl-sm"}`}>                         <p className="font-medium text-xs mb-1 opacity-80">{comment.user.name}</p>                         {comment.content}                       </div>                       <p className="text-xs text-surface-400 dark:text-surface-500 mt-1 px-1">                         {format(new Date(comment.createdAt), "MMM d, HH:mm")}                       </p>                     </div>                   </div>) : <div className="text-center py-12">                   <div className="w-16 h-16 mx-auto mb-4 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center">                     <MessageCircle size={28} className="text-surface-400" />                   </div>                   <p className="text-surface-600 dark:text-surface-400 font-medium">{t('taskDetails.noComments')}</p>                   <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">{t('taskDetails.startDiscussion')}</p>                 </div>}             </div>              <div className="p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-850">               <div className="flex gap-3">                 <div className="size-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">                   {user?.name?.[0]?.toUpperCase() || "U"}                 </div>                 <div className="flex-1 flex gap-2">                   <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder={t('taskDetails.writeComment')} rows={2} className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm placeholder-surface-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />                   <button onClick={handleAddComment} className="self-end px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 shadow-lg shadow-primary-500/20 transition-all">                     {t('taskDetails.post')}                   </button>                 </div>               </div>             </div>           </div>            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">             <div className="flex items-center gap-2 mb-4">               <CheckSquare size={18} className="text-surface-400" />               <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">Subtasks ({task.subtasks?.filter(s => s.done).length || 0}/{task.subtasks?.length || 0})</h2>             </div>             <div className="space-y-2 mb-4">               {task.subtasks?.map(sub => <div key={sub.id} className="flex items-center gap-3 group">                   <button onClick={() => toggleSubtask(sub)} className={`size-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${sub.done ? "bg-primary-500 border-primary-500" : "border-surface-300 dark:border-surface-600"}`}>                     {sub.done && <CheckSquare size={12} className="text-white" />}                   </button>                   <span className={`text-sm flex-1 ${sub.done ? "line-through text-surface-400 dark:text-surface-500" : "text-surface-900 dark:text-surface-100"}`}>{sub.title}</span>                   <button onClick={() => handleDeleteSubtask(sub.id)} className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>                 </div>)}             </div>             <div className="flex gap-2">               <input type="text" value={newSubtask} onChange={e => setNewSubtask(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddSubtask()} placeholder="Add subtask..." className="flex-1 px-3.5 py-2 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />               <button onClick={handleAddSubtask} className="px-4 py-2 text-sm font-medium rounded-xl text-white bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 transition-all"><Plus size={16} /></button>             </div>           </div>            <AttachmentList projectId={projectId} taskId={taskId} attachments={task.attachments || []} />         </div>          <div className="w-full lg:w-[380px] space-y-5">           <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">             <div className="mb-4">               <h1 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">{task.title}</h1>               <div className="flex flex-wrap gap-2">                 <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyles[task.status]}`}>{task.status.replace("_", " ")}</span>                 <div className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${typeBg} ${typeColor}`}>                   <TypeIcon size={12} /> {task.type}                 </div>                 <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${priorityStyles[task.priority]}`}>{task.priority}</span>               </div>             </div>              {task.description && <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-5">{task.description}</p>}              {task.storyPoints && <div className="mb-5">                 <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">{task.storyPoints} SP</span>               </div>}              <hr className="border-surface-200 dark:border-surface-800 my-4" />              <div className="space-y-3 text-sm">               <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">                 <div className="size-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">                   {task.assignee?.name?.[0] || "?"}                 </div>                 <span className="text-surface-900 dark:text-surface-100">{task.assignee?.name || t('taskDetails.unassigned')}</span>               </div>               <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400">                 <Calendar size={16} />                 <span>{t('taskDetails.due')}: {task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : t('taskDetails.noDate')}</span>               </div>             </div>           </div>            {project && <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">               <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2 mb-4">                 <Pen size={16} /> {t('taskDetails.projectDetails')}               </h2>               <p className="text-surface-900 dark:text-surface-100 font-medium mb-1">{project.name}</p>               <p className="text-xs text-surface-400 dark:text-surface-500 mb-4">Started {format(new Date(project.start_date), "MMM d, yyyy")}</p>               <div className="flex flex-wrap gap-3 text-xs text-surface-500 dark:text-surface-400">                 <span className="bg-surface-100 dark:bg-surface-800 px-2.5 py-1 rounded-full">Status: {project.status?.replace("_", " ")}</span>                 <span className="bg-surface-100 dark:bg-surface-800 px-2.5 py-1 rounded-full">Priority: {project.priority}</span>                 <span className="bg-surface-100 dark:bg-surface-800 px-2.5 py-1 rounded-full">Progress: {project.progress}%</span>               </div>             </div>}         </div>       </div>     </div>;
};
export default TaskDetails;