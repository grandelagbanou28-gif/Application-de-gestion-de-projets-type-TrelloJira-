import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "../i18n";
import { addSprint, updateSprint, updateTask } from "../features/workspaceSlice";
import toast from "react-hot-toast";
import { Plus, X, Target, Calendar, CheckCircle, Clock, Timer, Zap, ListTodo } from "lucide-react";
import { format } from "date-fns";
import { nanoid } from "nanoid";
const SprintPlanning = ({
  tasks,
  project
}) => {
  const {
    t
  } = useTranslation();
  const dispatch = useDispatch();
  const [showCreate, setShowCreate] = useState(false);
  const [sprintForm, setSprintForm] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: ""
  });
  const [selectedSprint, setSelectedSprint] = useState(null);
  const sprints = project?.sprints || [];
  const backlogTasks = tasks.filter(t => t.inBacklog);
  const unscheduledTasks = tasks.filter(t => {
    if (t.inBacklog) return false;
    return !sprints.some(s => s.tasks?.includes(t.id));
  });
  const handleCreateSprint = e => {
    e.preventDefault();
    if (!sprintForm.name.trim()) return dispatch(addSprint({
      projectId: project.id,
      sprint: {
        id: "sprint_" + Date.now(),
        name: sprintForm.name,
        goal: sprintForm.goal,
        startDate: sprintForm.startDate || new Date().toISOString(),
        endDate: sprintForm.endDate || "",
        tasks: [],
        createdAt: new Date().toISOString()
      }
    }));
    toast.success(t('common.save'));
    setShowCreate(false);
    setSprintForm({
      name: "",
      goal: "",
      startDate: "",
      endDate: ""
    });
  };
  const getSprintProgress = sprint => {
    const sprintTasks = tasks.filter(t => sprint.tasks?.includes(t.id));
    if (sprintTasks.length === 0) return 0;
    return Math.round(sprintTasks.filter(t => t.status === "DONE").length / sprintTasks.length * 100);
  };
  const getSprintPoints = sprint => {
    const sprintTasks = tasks.filter(t => sprint.tasks?.includes(t.id));
    const total = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const done = sprintTasks.filter(t => t.status === "DONE").reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    return {
      total,
      done
    };
  };
  const addTaskToSprint = (sprintId, taskId) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return dispatch(updateSprint({
      projectId: project.id,
      sprint: {
        ...sprint,
        tasks: [...(sprint.tasks || []), taskId]
      }
    }));
    toast.success("Task added to sprint");
  };
  const removeTaskFromSprint = (sprintId, taskId) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return dispatch(updateSprint({
      projectId: project.id,
      sprint: {
        ...sprint,
        tasks: (sprint.tasks || []).filter(id => id !== taskId)
      }
    }));
  };
  const toggleBacklog = taskId => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return dispatch(updateTask({
      ...task,
      inBacklog: !task.inBacklog
    }));
  };
  if (!project) return null;
  return <div className="space-y-6">       <div className="flex items-center justify-between">         <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Sprints</h2>         <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-white bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 transition-all">           <Plus size={14} /> New Sprint         </button>       </div>        {sprints.length === 0 && !showCreate && <div className="text-center py-12">           <Timer size={40} className="mx-auto mb-3 text-surface-300 dark:text-surface-600" />           <p className="text-surface-500 dark:text-surface-400 text-sm">No sprints yet. Create your first sprint to start planning.</p>         </div>}        {showCreate && <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">           <form onSubmit={handleCreateSprint} className="space-y-4">             <div className="grid grid-cols-2 gap-4">               <div className="col-span-2">                 <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Sprint Name</label>                 <input value={sprintForm.name} onChange={e => setSprintForm({
              ...sprintForm,
              name: e.target.value
            })} placeholder="e.g. Sprint 1" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" required />               </div>               <div className="col-span-2">                 <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Sprint Goal</label>                 <input value={sprintForm.goal} onChange={e => setSprintForm({
              ...sprintForm,
              goal: e.target.value
            })} placeholder="What will this sprint achieve?" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />               </div>               <div>                 <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Start Date</label>                 <input type="date" value={sprintForm.startDate} onChange={e => setSprintForm({
              ...sprintForm,
              startDate: e.target.value
            })} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />               </div>               <div>                 <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">End Date</label>                 <input type="date" value={sprintForm.endDate} onChange={e => setSprintForm({
              ...sprintForm,
              endDate: e.target.value
            })} className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />               </div>             </div>             <div className="flex justify-end gap-3 pt-2 border-t border-surface-100 dark:border-surface-800">               <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">{t('common.cancel')}</button>               <button type="submit" className="px-5 py-2 text-sm font-medium rounded-xl text-white bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 transition-all">{t('common.create')}</button>             </div>           </form>         </div>}        {sprints.map(sprint => {
      const progress = getSprintProgress(sprint);
      const points = getSprintPoints(sprint);
      const sprintTasks = tasks.filter(t => sprint.tasks?.includes(t.id));
      const isExpanded = selectedSprint === sprint.id;
      return <div key={sprint.id} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">             <div className="flex items-start justify-between mb-4">               <div>                 <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">{sprint.name}</h3>                 {sprint.goal && <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 flex items-center gap-1.5">                     <Target size={14} /> {sprint.goal}                   </p>}               </div>               <div className="flex items-center gap-3">                 {points.total > 0 && <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">                     {points.done}/{points.total} SP                   </span>}                 <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{progress}%</span>               </div>             </div>              <div className="w-full h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden mb-4">               <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all" style={{
            width: `${progress}%`
          }} />             </div>              <div className="flex items-center gap-4 text-xs text-surface-400 dark:text-surface-500 mb-3">               {sprint.startDate && <span className="flex items-center gap-1"><Calendar size={12} /> {format(new Date(sprint.startDate), "MMM d")}</span>}               {sprint.endDate && <>                   <span>ÔåÆ</span>                   <span className="flex items-center gap-1"><Calendar size={12} /> {format(new Date(sprint.endDate), "MMM d")}</span>                 </>}               <span className="flex items-center gap-1">                 <CheckCircle size={12} /> {sprintTasks.filter(t => t.status === "DONE").length}/{sprintTasks.length} done               </span>             </div>              <button onClick={() => setSelectedSprint(isExpanded ? null : sprint.id)} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">               {isExpanded ? "Hide tasks" : `Show tasks (${sprintTasks.length})`}             </button>              {isExpanded && <div className="mt-4 space-y-2">                 {sprintTasks.map(task => <div key={task.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 text-sm">                     <div className="flex items-center gap-3">                       <span className="text-surface-900 dark:text-surface-100">{task.title}</span>                       {task.storyPoints && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">{task.storyPoints} SP</span>}                       <span className={`text-xs px-2 py-0.5 rounded-full ${task.status === "DONE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : task.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" : "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300"}`}>{task.status.replace("_", " ")}</span>                     </div>                     <button onClick={() => removeTaskFromSprint(sprint.id, task.id)} className="text-surface-400 hover:text-red-500 transition-colors"><X size={14} /></button>                   </div>)}                 {sprintTasks.length === 0 && <p className="text-sm text-surface-400 text-center py-4">No tasks in this sprint. Add tasks from below.</p>}               </div>}           </div>;
    })}        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">         <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">           <ListTodo size={16} /> Unscheduled Tasks         </h3>         <div className="space-y-2">           {unscheduledTasks.map(task => <div key={task.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 text-sm">               <div className="flex items-center gap-3">                 <button onClick={() => toggleBacklog(task.id)} className={`text-xs px-2 py-0.5 rounded-full transition-colors ${task.inBacklog ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" : "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400"}`}>                   Backlog                 </button>                 <span className="text-surface-900 dark:text-surface-100">{task.title}</span>                 {task.storyPoints && <span className="text-xs text-surface-400">{task.storyPoints} SP</span>}               </div>               <div className="flex items-center gap-2">                 <select value="" onChange={e => {
              if (e.target.value) addTaskToSprint(e.target.value, task.id);
            }} className="text-xs px-2 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400">                   <option value="">Add to sprint...</option>                   {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}                 </select>               </div>             </div>)}           {unscheduledTasks.length === 0 && <p className="text-sm text-surface-400 text-center py-4">All tasks are scheduled</p>}         </div>       </div>     </div>;
};
export default SprintPlanning;