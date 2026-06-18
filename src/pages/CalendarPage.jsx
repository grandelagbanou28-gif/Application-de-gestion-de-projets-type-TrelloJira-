import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, parseISO, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle, ListTodo } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
const priorityStyles = {
  LOW: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
};
const statusStyles = {
  TODO: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  DONE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
};
const statusLabels = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done'
};
const CalendarPage = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const {
    currentWorkspace
  } = useSelector(state => state.workspace);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const today = new Date();
  const allTasks = useMemo(() => {
    if (!currentWorkspace?.projects) return [];
    return currentWorkspace.projects.flatMap(project => (project.tasks || []).map(task => ({
      ...task,
      projectName: project.name,
      projectId: project.id
    })));
  }, [currentWorkspace]);
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return eachDayOfInterval({
      start: startOfWeek(monthStart),
      end: endOfWeek(monthEnd)
    });
  }, [currentMonth]);
  const getTasksForDate = date => allTasks.filter(task => task.due_date && isSameDay(parseISO(task.due_date), date));
  const getDayCounts = date => {
    const dayTasks = getTasksForDate(date);
    const overdue = dayTasks.filter(t => t.status !== 'DONE' && isBefore(parseISO(t.due_date), today));
    const upcoming = dayTasks.filter(t => t.status !== 'DONE' && !isBefore(parseISO(t.due_date), today));
    return {
      total: dayTasks.length,
      overdue: overdue.length,
      upcoming: upcoming.length
    };
  };
  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now);
  };
  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  if (!currentWorkspace) {
    return <div className="max-w-3xl mx-auto text-center py-16">         <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/25">           <Calendar size={48} className="text-white" />         </div>         <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white mb-3">           {t('calendar.title')}         </h1>         <p className="text-lg text-surface-500 dark:text-surface-400 mb-10 max-w-lg mx-auto leading-relaxed">           {t('calendar.subtitle')}         </p>       </div>;
  }
  return <div className="max-w-7xl mx-auto space-y-6">       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">         <div>           <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">             {t('calendar.title')}           </h1>           <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">             {t('calendar.subtitle')}           </p>         </div>         <button onClick={goToToday} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/30 transition-all active:scale-[0.97]">           <Calendar size={16} strokeWidth={2.5} />           {t('calendar.today')}         </button>       </div>        <div className="grid lg:grid-cols-3 gap-6">         <div className={selectedDate ? 'lg:col-span-2' : 'lg:col-span-3'}>           <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">             <div className="flex items-center justify-between mb-6">               <button onClick={prevMonth} className="p-2 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">                 <ChevronLeft size={20} />               </button>               <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">                 {format(currentMonth, 'MMMM yyyy')}               </h2>               <button onClick={nextMonth} className="p-2 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">                 <ChevronRight size={20} />               </button>             </div>              <div className="grid grid-cols-7 gap-px mb-px">               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-xs font-medium text-surface-400 dark:text-surface-500 text-center py-2">                   {day}                 </div>)}             </div>              <div className="grid grid-cols-7 gap-1">               {days.map(day => {
              const counts = getDayCounts(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isDayToday = isToday(day);
              let cellClasses = 'min-h-[4.5rem] p-1.5 rounded-xl flex flex-col items-center justify-start text-sm transition-all';
              if (!isCurrentMonth) {
                cellClasses += ' opacity-40';
              } else if (isSelected) {
                cellClasses += ' bg-primary-50 dark:bg-primary-500/10 ring-2 ring-primary-500';
              } else if (isDayToday) {
                cellClasses += ' bg-white dark:bg-surface-900 ring-1 ring-primary-400 dark:ring-primary-500';
              } else {
                cellClasses += ' bg-surface-50 dark:bg-surface-850 hover:bg-surface-100 dark:hover:bg-surface-800';
              }
              return <button key={day.toISOString()} onClick={() => setSelectedDate(day)} className={cellClasses}>                     <span className={`text-sm font-medium ${isDayToday ? 'text-primary-600 dark:text-primary-400' : 'text-surface-700 dark:text-surface-300'}`}>                       {format(day, 'd')}                     </span>                     {counts.total > 0 && <div className="flex items-center gap-1 mt-1 flex-wrap justify-center">                         {counts.overdue > 0 && <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 px-1.5 py-0.5 rounded-full leading-none">                             {counts.overdue}                           </span>}                         {counts.upcoming > 0 && <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 px-1.5 py-0.5 rounded-full leading-none">                             {counts.upcoming}                           </span>}                       </div>}                   </button>;
            })}             </div>           </div>         </div>          {selectedDate && <div className="lg:col-span-1">             <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 sticky top-6">               <div className="flex items-center justify-between mb-5">                 <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">                   <ListTodo size={18} className="text-primary-500" />                   <span>{t('calendar.tasksDue')} &middot; {format(selectedDate, 'MMM d, yyyy')}</span>                 </h3>                 <button onClick={() => setSelectedDate(null)} className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">                   <span className="text-lg leading-none">&times;</span>                 </button>               </div>                {selectedTasks.length === 0 ? <div className="text-center py-10">                   <Calendar size={32} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" />                   <p className="text-sm text-surface-400 dark:text-surface-500">{t('calendar.noTasks')}</p>                 </div> : <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">                   {selectedTasks.map(task => <button key={task.id} onClick={() => navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)} className="w-full text-left p-4 rounded-xl bg-surface-50 dark:bg-surface-850 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors group">                       <h4 className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate mb-1">                         {task.title}                       </h4>                       <div className="text-xs text-surface-400 dark:text-surface-500 mb-2 truncate">                         {task.projectName}                       </div>                       <div className="flex items-center gap-2 flex-wrap">                         <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${priorityStyles[task.priority] || priorityStyles.LOW}`}>                           {task.priority}                         </span>                         <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyles[task.status] || statusStyles.TODO}`}>                           {statusLabels[task.status] || task.status}                         </span>                       </div>                     </button>)}                 </div>}             </div>           </div>}       </div>     </div>;
};
export default CalendarPage;