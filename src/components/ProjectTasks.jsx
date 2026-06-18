import { format } from "date-fns";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { deleteTask, updateTask } from "../features/workspaceSlice";
import { Bug, Calendar, GitCommit, MessageSquare, Square, Trash2, X, Zap, Filter, RotateCcw } from "lucide-react";
import { useTranslation } from "../i18n";
const typeIcons = {
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
const priorityStyles = {
  LOW: "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  HIGH: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
};
const statusColors = {
  TODO: "bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300",
  IN_PROGRESS: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
};
const ProjectTasks = ({
  tasks
}) => {
  const {
    t
  } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    priority: "",
    assignee: ""
  });
  const assigneeList = useMemo(() => Array.from(new Set(tasks.map(t => t.assignee?.name).filter(Boolean))), [tasks]);
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const {
        status,
        type,
        priority,
        assignee
      } = filters;
      return (!status || task.status === status) && (!type || task.type === type) && (!priority || task.priority === priority) && (!assignee || task.assignee?.name === assignee);
    });
  }, [filters, tasks]);
  const handleFilterChange = e => {
    const {
      name,
      value
    } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleStatusChange = (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      dispatch(updateTask({
        ...task,
        status: newStatus
      }));
      toast.success(t('common.save'));
    }
  };
  const handleDelete = () => {
    const confirm = window.confirm(t('common.noDescription'));
    if (!confirm) return;
    const ids = selectedTasks;
    const projectId = tasks.find(t => ids.includes(t.id))?.projectId;
    if (projectId) {
      dispatch(deleteTask({
        ids,
        projectId
      }));
      setSelectedTasks([]);
      toast.success(t('common.save'));
    }
  };
  const hasFilters = filters.status || filters.type || filters.priority || filters.assignee;
  return <div>       <div className="flex flex-wrap items-center gap-3 mb-6">         <Filter size={16} className="text-surface-400 dark:text-surface-500" />         {["status", "type", "priority", "assignee"].map(name => {
        const options = {
          status: [{
            label: t('common.status'),
            value: ""
          }, {
            label: "To Do",
            value: "TODO"
          }, {
            label: t('projectDetail.inProgress'),
            value: "IN_PROGRESS"
          }, {
            label: "Done",
            value: "DONE"
          }],
          type: [{
            label: "All Types",
            value: ""
          }, {
            label: "Task",
            value: "TASK"
          }, {
            label: "Bug",
            value: "BUG"
          }, {
            label: "Feature",
            value: "FEATURE"
          }, {
            label: "Improvement",
            value: "IMPROVEMENT"
          }, {
            label: "Other",
            value: "OTHER"
          }],
          priority: [{
            label: t('common.priority'),
            value: ""
          }, {
            label: "Low",
            value: "LOW"
          }, {
            label: "Medium",
            value: "MEDIUM"
          }, {
            label: "High",
            value: "HIGH"
          }],
          assignee: [{
            label: "All Assignees",
            value: ""
          }, ...assigneeList.map(n => ({
            label: n,
            value: n
          }))]
        };
        return <select key={name} name={name} value={filters[name]} onChange={handleFilterChange} className="px-3.5 py-2 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all">               {options[name].map((opt, idx) => <option key={idx} value={opt.value}>{opt.label}</option>)}             </select>;
      })}          <div className="flex items-center gap-2 ml-auto">           {hasFilters && <button onClick={() => setFilters({
          status: "",
          type: "",
          priority: "",
          assignee: ""
        })} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">               <RotateCcw size={14} /> {t('projects.allStatus')}             </button>}           {selectedTasks.length > 0 && <button onClick={handleDelete} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">               <Trash2 size={14} /> Delete ({selectedTasks.length})             </button>}         </div>       </div>        {filteredTasks.length === 0 ? <div className="text-center py-12">           <div className="w-16 h-16 mx-auto mb-4 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center">             <Square size={28} className="text-surface-400" />           </div>           <p className="text-surface-600 dark:text-surface-400 font-medium">{t('projectDetail.totalTasks')}</p>           <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">{t('projects.adjustSearch')}</p>         </div> : <div className="overflow-hidden rounded-xl border border-surface-200 dark:border-surface-800">           <table className="w-full text-sm">             <thead>               <tr className="bg-surface-50 dark:bg-surface-850 border-b border-surface-200 dark:border-surface-800">                 <th className="w-10 px-3 py-3">                   <input type="checkbox" onChange={() => selectedTasks.length > 0 ? setSelectedTasks([]) : setSelectedTasks(tasks.map(t => t.id))} checked={selectedTasks.length === tasks.length && tasks.length > 0} className="size-3.5" />                 </th>                 <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Title</th>                 <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden md:table-cell">Type</th>                 <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden md:table-cell">Priority</th>                 <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>                 <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden lg:table-cell">Assignee</th>                 <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden lg:table-cell">Due Date</th>               </tr>             </thead>             <tbody className="divide-y divide-surface-100 dark:divide-surface-800">               {filteredTasks.map(task => {
            const TypeIcon = typeIcons[task.type]?.icon || Square;
            const iconColor = typeIcons[task.type]?.color || "text-surface-500";
            const iconBg = typeIcons[task.type]?.bg || "bg-surface-500/10";
            const priorityStyle = priorityStyles[task.priority] || priorityStyles.LOW;
            const statusStyle = statusColors[task.status] || statusColors.TODO;
            return <tr key={task.id} onClick={() => navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)} className="group cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors">                     <td className="px-3 py-3.5" onClick={e => e.stopPropagation()}>                       <input type="checkbox" onChange={() => selectedTasks.includes(task.id) ? setSelectedTasks(selectedTasks.filter(i => i !== task.id)) : setSelectedTasks(prev => [...prev, task.id])} checked={selectedTasks.includes(task.id)} className="size-3.5" />                     </td>                     <td className="px-4 py-3.5">                       <div className="md:hidden flex items-center gap-2 mb-1.5">                         <div className={`p-1 rounded-md ${iconBg}`}>                           <TypeIcon size={12} className={iconColor} />                         </div>                         <span className={`text-xs px-2 py-0.5 rounded-full ${priorityStyle}`}>{task.priority}</span>                       </div>                       <span className="font-medium text-surface-900 dark:text-surface-100">{task.title}</span>                     </td>                     <td className="px-4 py-3.5 hidden md:table-cell">                       <div className="flex items-center gap-2">                         <div className={`p-1.5 rounded-lg ${iconBg}`}>                           <TypeIcon size={14} className={iconColor} />                         </div>                         <span className={`text-xs font-medium uppercase ${iconColor}`}>{task.type?.toLowerCase()}</span>                       </div>                     </td>                     <td className="px-4 py-3.5 hidden md:table-cell">                       <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${priorityStyle}`}>{task.priority}</span>                     </td>                     <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>                       <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)} className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${statusStyle} focus:ring-2 focus:ring-primary-500/30`}>                         <option value="TODO">To Do</option>                         <option value="IN_PROGRESS">In Progress</option>                         <option value="DONE">Done</option>                       </select>                     </td>                     <td className="px-4 py-3.5 hidden lg:table-cell">                       <div className="flex items-center gap-2">                         <div className="size-7 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center text-xs font-medium text-surface-600 dark:text-surface-300">                           {task.assignee?.name?.[0]?.toUpperCase() || "?"}                         </div>                         <span className="text-surface-600 dark:text-surface-400">{task.assignee?.name || "-"}</span>                       </div>                     </td>                     <td className="px-4 py-3.5 hidden lg:table-cell">                       <div className="flex items-center gap-1.5 text-surface-400 dark:text-surface-500 text-xs">                         <Calendar size={14} />                         {task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "-"}                       </div>                     </td>                   </tr>;
          })}             </tbody>           </table>         </div>}     </div>;
};
export default ProjectTasks;