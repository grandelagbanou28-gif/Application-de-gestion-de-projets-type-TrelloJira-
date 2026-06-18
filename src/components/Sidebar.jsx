import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import MyTasksSidebar from './MyTasksSidebar';
import ProjectSidebar from './ProjectsSidebar';
import WorkspaceDropdown from './WorkspaceDropdown';
import { LayoutDashboard, FolderKanban, Users, Settings, ChevronLeft, ChevronRight, BookOpen, Calendar, Search, Bot, ShieldCheck } from 'lucide-react';
const Sidebar = memo(({
  isSidebarOpen,
  setIsSidebarOpen
}) => {
  const {
    t
  } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const menuItems = useMemo(() => [{
    name: t('sidebar.dashboard'),
    href: '/',
    icon: LayoutDashboard
  }, {
    name: t('sidebar.projects'),
    href: '/projects',
    icon: FolderKanban
  }, {
    name: t('sidebar.backlog'),
    href: '/backlog',
    icon: BookOpen
  }, {
    name: t('sidebar.calendar'),
    href: '/calendar',
    icon: Calendar
  }, {
    name: t('sidebar.team'),
    href: '/team',
    icon: Users
  }, {
    name: t('sidebar.search'),
    href: '/search',
    icon: Search
  }, {
    name: t('sidebar.ai'),
    href: '/ai',
    icon: Bot
  }, {
    name: t('sidebar.admin'),
    href: '/admin',
    icon: ShieldCheck
  }], [t]);
  const sidebarRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsSidebarOpen]);
  return <>       {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" />}       <aside ref={sidebarRef} className={`           z-40 bg-white dark:bg-surface-900 flex flex-col h-screen           border-r border-surface-200 dark:border-surface-800           fixed lg:sticky top-0 left-0           transition-all duration-300 ease-in-out           ${isCollapsed ? 'w-16' : 'w-64'}           ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}         `}>         <div className={isCollapsed ? 'px-2 pt-5 pb-3' : ''}>           <WorkspaceDropdown isCollapsed={isCollapsed} />         </div>          <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-3 space-y-1">           {menuItems.map(item => {
          const Icon = item.icon;
          return <NavLink to={item.href} key={item.name} onClick={() => setIsSidebarOpen(false)} className={({
            isActive
          }) => `flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${isActive ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 font-medium' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'} ${isCollapsed ? 'justify-center px-0' : ''}`} title={isCollapsed ? item.name : undefined}>                 <Icon size={18} strokeWidth={1.5} />                 <span className={isCollapsed ? 'hidden' : ''}>{item.name}</span>               </NavLink>;
        })}           <Link to="/settings" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 ${isCollapsed ? 'justify-center px-0' : ''}`} title={isCollapsed ? t('sidebar.settings') : undefined}>             <Settings size={18} strokeWidth={1.5} />             <span className={isCollapsed ? 'hidden' : ''}>{t('sidebar.settings')}</span>           </Link>            <div className={`my-4 border-t border-surface-200 dark:border-surface-800 ${isCollapsed ? 'mx-2' : ''}`} />            {!isCollapsed && <>               <MyTasksSidebar />               <ProjectSidebar />             </>}         </nav>          <button onClick={() => setIsCollapsed(prev => !prev)} className="hidden lg:flex items-center justify-center gap-2 px-4 py-3 text-xs text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-400 border-t border-surface-200 dark:border-surface-800 transition-colors">           {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}           <span className={isCollapsed ? 'hidden' : ''}>{t('sidebar.collapse')}</span>         </button>       </aside>     </>;
});
export default Sidebar;