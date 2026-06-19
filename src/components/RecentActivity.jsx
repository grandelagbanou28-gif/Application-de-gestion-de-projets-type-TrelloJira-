import { useEffect, useState } from "react";
import { GitCommit, MessageSquare, Clock, Bug, Zap, Square } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { useTranslation } from "../i18n";
const typeIcons = {
  BUG: {
    icon: Bug,
    color: "text-red-500",
    bg: "bg-red-500/10"
  },
  FEATURE: {
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  TASK: {
    icon: Square,
    color: "text-primary-500",
    bg: "bg-primary-500/10"
  },
  IMPROVEMENT: {
    icon: MessageSquare,
    color: "text-violet-500",
    bg: "bg-violet-500/10"
  },
  OTHER: {
    icon: GitCommit,
    color: "text-surface-500",
    bg: "bg-surface-500/10"
  }
};
const statusColors = {
  TODO: "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300",
  IN_PROGRESS: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
};
const RecentActivity = () => {
  const {
    t
  } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const {
    currentWorkspace
  } = useSelector(state => state.workspace);
  useEffect(() => {
    if (currentWorkspace) {
      const allTasks = currentWorkspace.projects.flatMap(project => project.tasks.map(task => task));
      setTasks(allTasks);
    }
  }, [currentWorkspace]);
  if (tasks.length === 0) {
    return <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">         <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800">           <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">{t('dashboard.recentActivity')}</h2>         </div>         <div className="py-16 text-center">           <div className="w-16 h-16 mx-auto mb-4 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center">             <Clock size={28} className="text-surface-400 dark:text-surface-500" />           </div>           <p className="text-surface-600 dark:text-surface-400 font-medium">{t('dashboard.noActivity')}</p>           <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">{t('dashboard.activityDesc')}</p>         </div>       </div>;
  }
  return <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">       <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800">         <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">{t('dashboard.recentActivity')}</h2>       </div>       <div className="divide-y divide-surface-100 dark:divide-surface-800">         {tasks.map(task => {
        const TypeIcon = typeIcons[task.type]?.icon || Square;
        const iconColor = typeIcons[task.type]?.color || "text-surface-500";
        const iconBg = typeIcons[task.type]?.bg || "bg-surface-500/10";
        return <div key={task.id} className="px-6 py-4 hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors">               <div className="flex items-start gap-4">                 <div className={`p-2 rounded-xl ${iconBg} shrink-0`}>                   <TypeIcon size={14} className={iconColor} />                 </div>                 <div className="flex-1 min-w-0">                   <div className="flex items-start justify-between gap-4">                     <h4 className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">                       {task.title}                     </h4>                     <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[task.status] || "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300"}`}>                       {task.status.replace("_", " ")}                     </span>                   </div>                   <div className="flex items-center gap-3 mt-1.5 text-xs text-surface-400 dark:text-surface-500">                     <span className="capitalize">{task.type?.toLowerCase()}</span>                     {task.assignee && <div className="flex items-center gap-1">                         <div className="size-5 bg-surface-200 dark:bg-surface-700 rounded-full flex items-center justify-center text-[10px] font-medium text-surface-600 dark:text-surface-300">                           {task.assignee?.name?.[0]?.toUpperCase() || "?"}                         </div>                         {task.assignee?.name}                       </div>}                     <span>{task.updatedAt ? format(new Date(task.updatedAt), "MMM d, h:mm a") : ""}</span>                   </div>                 </div>               </div>             </div>;
      })}       </div>     </div>;
};
export default RecentActivity;