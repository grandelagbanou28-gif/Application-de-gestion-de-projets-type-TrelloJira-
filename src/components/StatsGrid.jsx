import { FolderOpen, CheckCircle, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "../i18n";
export default function StatsGrid() {
  const {
    t
  } = useTranslation();
  const currentWorkspace = useSelector(state => state?.workspace?.currentWorkspace || null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    myTasks: 0,
    overdueIssues: 0
  });
  const statCards = [{
    icon: FolderOpen,
    title: t('dashboard.totalProjects'),
    value: stats.totalProjects,
    subtitle: t('statsGrid.projects', {
      name: currentWorkspace?.name
    }),
    gradient: "from-primary-500/10 to-primary-600/5",
    iconBg: "bg-primary-500/10",
    iconColor: "text-primary-600 dark:text-primary-400"
  }, {
    icon: CheckCircle,
    title: t('dashboard.completed'),
    value: stats.completedProjects,
    subtitle: t('statsGrid.completedOf', {
      count: stats.totalProjects
    }),
    gradient: "from-emerald-500/10 to-emerald-600/5",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400"
  }, {
    icon: Users,
    title: t('dashboard.myTasks'),
    value: stats.myTasks,
    subtitle: t('statsGrid.myTasks'),
    gradient: "from-violet-500/10 to-violet-600/5",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400"
  }, {
    icon: AlertTriangle,
    title: t('dashboard.overdue'),
    value: stats.overdueIssues,
    subtitle: t('statsGrid.overdue'),
    gradient: "from-amber-500/10 to-amber-600/5",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400"
  }];
  useEffect(() => {
    if (currentWorkspace) {
      setStats({
        totalProjects: currentWorkspace.projects.length,
        activeProjects: currentWorkspace.projects.filter(p => p.status !== "CANCELLED" && p.status !== "COMPLETED").length,
        completedProjects: currentWorkspace.projects.filter(p => p.status === "COMPLETED").reduce((acc, project) => acc + project.tasks.length, 0),
        myTasks: currentWorkspace.projects.reduce((acc, project) => acc + project.tasks.filter(t => t.assignee?.email === currentWorkspace.owner?.email).length, 0),
        overdueIssues: currentWorkspace.projects.reduce((acc, project) => acc + project.tasks.filter(t => t.due_date < new Date()).length, 0)
      });
    }
  }, [currentWorkspace]);
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">       {statCards.map(({
      icon: Icon,
      title,
      value,
      subtitle,
      gradient,
      iconBg,
      iconColor
    }, i) => <div key={i} className="group relative bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 card-hover">           <div className="flex items-start justify-between">             <div className="space-y-1">               <p className="text-sm text-surface-500 dark:text-surface-400">{title}</p>               <div className="flex items-baseline gap-1.5">                 <span className="text-3xl font-bold text-surface-900 dark:text-white tracking-tight">{value}</span>                 {i === 0 && value > 0 && <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">                     <TrendingUp size={12} />                     +12%                   </span>}               </div>               {subtitle && <p className="text-xs text-surface-400 dark:text-surface-500">{subtitle}</p>}             </div>             <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>               <Icon size={20} strokeWidth={1.5} />             </div>           </div>           <div className={`absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />         </div>)}     </div>;
}