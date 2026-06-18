import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "../i18n";
import { updateTask } from "../features/workspaceSlice";
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
const COLUMNS = [{
  key: "TODO",
  label: "To Do",
  color: "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300"
}, {
  key: "IN_PROGRESS",
  label: "In Progress",
  color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
}, {
  key: "DONE",
  label: "Done",
  color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
}];
function SortableTask({
  task
}) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  const priorityColors = {
    LOW: "border-l-surface-300 dark:border-l-surface-600",
    MEDIUM: "border-l-amber-400 dark:border-l-amber-500",
    HIGH: "border-l-red-400 dark:border-l-red-500"
  };
  return <div ref={setNodeRef} style={style} className={`bg-white dark:bg-surface-850 rounded-xl border border-surface-200 dark:border-surface-700 p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 ${priorityColors[task.priority] || priorityColors.LOW}`} onClick={() => navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)}>       <div className="flex items-start gap-2">         <button {...attributes} {...listeners} className="mt-0.5 shrink-0 text-surface-300 dark:text-surface-600 hover:text-surface-500 dark:hover:text-surface-400 cursor-grab active:cursor-grabbing">           <GripVertical size={14} />         </button>         <div className="flex-1 min-w-0">           <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">{task.title}</p>           {task.assignee?.name && <p className="text-xs text-surface-400 dark:text-surface-500 mt-1 truncate">{task.assignee.name}</p>}           <div className="flex items-center gap-2 mt-2">             <span className="text-[10px] font-medium uppercase text-surface-400 dark:text-surface-500 bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">               {task.type}             </span>             {task.priority && <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${task.priority === "HIGH" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300" : task.priority === "MEDIUM" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" : "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300"}`}>                 {task.priority}               </span>}           </div>         </div>       </div>     </div>;
}
;
const KanbanBoard = ({
  tasks,
  projectId
}) => {
  const {
    t
  } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8
    }
  }), useSensor(KeyboardSensor));
  const getTasksByStatus = status => tasks.filter(t => t.status === status);
  const handleDragEnd = event => {
    const {
      active,
      over
    } = event;
    if (!over) return;
    const taskId = active.id;
    const overId = over.id;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    let newStatus;
    if (COLUMNS.find(c => c.key === overId)) {
      newStatus = overId;
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }
    ;
    if (newStatus && newStatus !== task.status) {
      dispatch(updateTask({
        ...task,
        status: newStatus
      }));
    }
  };
  return <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">         {COLUMNS.map(column => {
        const columnTasks = getTasksByStatus(column.key);
        return <div key={column.key} className="bg-surface-50 dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 p-4">               <div className="flex items-center justify-between mb-4">                 <div className="flex items-center gap-2">                   <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${column.color}`}>                     {column.label}                   </span>                   <span className="text-xs text-surface-400 dark:text-surface-500">{columnTasks.length}</span>                 </div>                 <button onClick={() => navigate(`/projectsDetail?id=${projectId}&tab=tasks&createTask=true`)} className="p-1 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">                   <Plus size={14} />                 </button>               </div>               <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>                 <div className="space-y-2 min-h-[100px]">                   {columnTasks.length === 0 ? <p className="text-xs text-surface-400 dark:text-surface-500 text-center py-6">{t('dashboard.noActivity')}</p> : columnTasks.map(task => <SortableTask key={task.id} task={task} />)}                 </div>               </SortableContext>             </div>;
      })}       </div>     </DndContext>;
};
export default KanbanBoard;