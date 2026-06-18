import { memo, useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, Building2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
const WorkspaceDropdown = memo(function WorkspaceDropdown({
  isCollapsed
}) {
  const {
    t
  } = useTranslation();
  const {
    workspaces
  } = useSelector(state => state.workspace);
  const currentWorkspace = useSelector(state => state.workspace?.currentWorkspace || null);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onSelectWorkspace = organizationId => {
    dispatch(setCurrentWorkspace(organizationId));
    setIsOpen(false);
    navigate('/');
  };
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return <div className={`relative ${isCollapsed ? 'px-2 pt-5 pb-3' : 'px-4 pt-5 pb-3'}`} ref={dropdownRef}>       <button onClick={() => setIsOpen(prev => !prev)} className={`w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors group ${isCollapsed ? 'justify-center px-0' : ''}`} title={isCollapsed ? currentWorkspace?.name || t('sidebar.selectWorkspace') : undefined}>         <div className="size-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">           {currentWorkspace?.name?.[0]?.toUpperCase() || "W"}         </div>         {!isCollapsed && <>             <div className="flex-1 min-w-0 text-left">               <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">                 {currentWorkspace?.name || t('sidebar.selectWorkspace')}               </p>               <p className="text-xs text-surface-400 dark:text-surface-500 truncate">                 {t('sidebar.workspaceCount', {
              count: workspaces.length
            })}               </p>             </div>             <ChevronDown size={16} className="text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300 transition-colors" />           </>}       </button>        {isOpen && <div className={`absolute z-50 ${isCollapsed ? 'left-full ml-2 top-0' : 'w-[calc(100%-2rem)] left-4'} mt-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 ${isCollapsed ? 'w-56' : ''}`}>           <div className="p-2">             {!isCollapsed && <p className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider px-3 py-1.5">                 {t('sidebar.workspaces')}               </p>}             {workspaces.length === 0 ? <div className="px-3 py-4 text-center">                 <Building2 size={24} className="mx-auto mb-2 text-surface-300 dark:text-surface-600" />                 <p className="text-sm text-surface-400 dark:text-surface-500">{t('sidebar.noWorkspaces')}</p>                 <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{t('sidebar.createOne')}</p>               </div> : workspaces.map(ws => <div key={ws.id} onClick={() => onSelectWorkspace(ws.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${currentWorkspace?.id === ws.id ? "bg-primary-50 dark:bg-primary-500/10" : "hover:bg-surface-100 dark:hover:bg-surface-800"}`}>                   <div className="size-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">                     {ws.name?.[0]?.toUpperCase()}                   </div>                   <div className="flex-1 min-w-0">                     <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">                       {ws.name}                     </p>                     <p className="text-xs text-surface-400 dark:text-surface-500">                       {ws.membersCount || 0} {t('settings.members')}                     </p>                   </div>                   {currentWorkspace?.id === ws.id && <Check size={16} className="shrink-0 text-primary-600 dark:text-primary-400" />}                 </div>)}           </div>            <div className="border-t border-surface-100 dark:border-surface-800 p-2">             <button onClick={() => {
          setIsOpen(false);
          setShowCreateDialog(true);
        }} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors">               <Plus size={16} />               {t('sidebar.createWorkspace')}             </button>           </div>         </div>}       <CreateWorkspaceDialog isOpen={showCreateDialog} setIsOpen={setShowCreateDialog} />     </div>;
});
export default WorkspaceDropdown;