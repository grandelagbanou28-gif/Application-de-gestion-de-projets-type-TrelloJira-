import { useEffect, useState } from "react";
import { ArrowRight, Clock, AlertTriangle, User, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { useTranslation } from "../i18n";
export default function TasksSummary() {
  const {
    t
  } = useTranslation();
  const {
    currentWorkspace
  } = useSelector(state => state.workspace);
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    if (currentWorkspace) {
      setTasks(currentWorkspace.projects.flatMap(project => project.tasks));
    }
  }, [currentWorkspace]);
  const myTasks = tasks;
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'DONE');
  const inProgressIssues = tasks.filter(i => i.status === 'IN_PROGRESS');
  const summaryCards = [{
    title: t('dashboard.myTasks'),
    count: myTasks.length,
    icon: User,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    badgeBg: "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300",
    items: myTasks.slice(0, 3)
  }, {
    title: t('dashboard.overdue'),
    count: overdueTasks.length,
    icon: AlertTriangle,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600 dark:text-red-400",
    badgeBg: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
    items: overdueTasks.slice(0, 3)
  }, {
    title: t('projectDetail.inProgress'),
    count: inProgressIssues.length,
    icon: Clock,
    iconBg: "bg-primary-500/10",
    iconColor: "text-primary-600 dark:text-primary-400",
    badgeBg: "bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300",
    items: inProgressIssues.slice(0, 3)
  }];
  return <div className="space-y-5">       {summaryCards.map(card => <div key={card.title} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">           <div className="px-5 py-4 border-b border-surface-100 dark:border-surface-800">             <div className="flex items-center gap-3">               <div className={`p-2 rounded-xl ${card.iconBg}`}>                 <card.icon size={16} className={card.iconColor} strokeWidth={1.5} />               </div>               <div className="flex items-center justify-between flex-1">                 <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">{card.title}</h3>                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${card.badgeBg}`}>                   {card.count}                 </span>               </div>             </div>           </div>           <div className="px-5 py-4">             {card.items.length === 0 ? <p className="text-sm text-surface-400 dark:text-surface-500 text-center py-3">                 {t('common.noDescription')}               </p> : <div className="space-y-2">                 {card.items.map(issue => <div key={issue.id} className="p-3 rounded-xl bg-surface-50 dark:bg-surface-850 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer group">                     <div className="flex items-start justify-between gap-2">                       <h4 className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate flex-1">                         {issue.title}                       </h4>                       <ChevronRight size={14} className="shrink-0 text-surface-300 dark:text-surface-600 opacity-0 group-hover:opacity-100 transition-opacity" />                     </div>                     <p className="text-xs text-surface-400 dark:text-surface-500 capitalize mt-1">                       {issue.type?.toLowerCase()} · {issue.priority?.toLowerCase()} {t('common.priority').toLowerCase()}                     </p>                   </div>)}                 {card.count > 3 && <button className="flex items-center justify-center w-full text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 pt-2 transition-colors">                     {t('sidebar.viewAll')} {card.count - 3} {t('projectDetail.tasks').toLowerCase()} <ArrowRight size={14} className="ml-1.5" />                   </button>}               </div>}           </div>         </div>)}     </div>;
}