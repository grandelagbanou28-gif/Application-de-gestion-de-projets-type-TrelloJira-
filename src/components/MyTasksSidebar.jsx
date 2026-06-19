import { useEffect, useState } from 'react';
import { CheckSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
function MyTasksSidebar() {
  const { t } = useTranslation();
  const {
    currentWorkspace
  } = useSelector(state => state.workspace);
  const [showMyTasks, setShowMyTasks] = useState(true);
  const [myTasks, setMyTasks] = useState([]);
  const toggleMyTasks = () => setShowMyTasks(prev => !prev);
  const getTaskStatusColor = status => {
    switch (status) {
      case 'DONE':
        return 'bg-emerald-500';
      case 'IN_PROGRESS':
        return 'bg-amber-500';
      case 'TODO':
        return 'bg-surface-400 dark:bg-surface-600';
      default:
        return 'bg-surface-400 dark:bg-surface-600';
    }
  };
  useEffect(() => {
    if (!currentWorkspace) return;
    const tasks = currentWorkspace.projects.flatMap(project => project.tasks);
    setMyTasks(tasks);
  }, [currentWorkspace]);
  return <div className="mt-2">       <button onClick={toggleMyTasks} className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors group">         <div className="flex items-center gap-2">           <CheckSquare size={16} className="text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300" />           <span className="text-sm font-medium text-surface-600 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-100">{t('sidebar.myTasks')}</span>           <span className="text-[11px] font-medium bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-400 px-1.5 py-0.5 rounded-full">             {myTasks.length}           </span>         </div>         {showMyTasks ? <ChevronDown size={14} className="text-surface-400" /> : <ChevronRight size={14} className="text-surface-400" />}       </button>        {showMyTasks && <div className="mt-1 pl-2 space-y-0.5">           {myTasks.length === 0 ? <p className="px-3 py-2 text-xs text-surface-400 dark:text-surface-500 text-center">{t('sidebar.noTasksAssigned')}</p> : myTasks.map((task, index) => <Link key={index} to={`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-colors">                 <div className={`size-2 rounded-full shrink-0 ${getTaskStatusColor(task.status)}`} />                 <div className="flex-1 min-w-0">                   <p className="text-xs font-medium truncate">{task.title}</p>                   <p className="text-[11px] text-surface-400 dark:text-surface-500 lowercase truncate">{task.status?.replace('_', ' ')}</p>                 </div>               </Link>)}         </div>}     </div>;
}
export default MyTasksSidebar;