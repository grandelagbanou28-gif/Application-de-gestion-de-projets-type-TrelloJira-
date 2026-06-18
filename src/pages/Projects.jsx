import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Plus, Search, FolderOpen, SlidersHorizontal, RotateCcw } from "lucide-react";
import { useTranslation } from "../i18n";
import ProjectCard from "../components/ProjectCard";
import CreateProjectDialog from "../components/CreateProjectDialog";
export default function Projects() {
  const {
    t
  } = useTranslation();
  const projects = useSelector(state => state?.workspace?.currentWorkspace?.projects || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "ALL",
    priority: "ALL"
  });
  const filteredProjects = useMemo(() => {
    let filtered = projects;
    if (searchTerm) {
      filtered = filtered.filter(project => project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filters.status !== "ALL") filtered = filtered.filter(project => project.status === filters.status);
    if (filters.priority !== "ALL") filtered = filtered.filter(project => project.priority === filters.priority);
    return filtered;
  }, [projects, searchTerm, filters]);
  const hasFilters = filters.status !== "ALL" || filters.priority !== "ALL";
  return <div className="max-w-7xl mx-auto space-y-8">       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">         <div>           <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">{t('projects.title')}</h1>           <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">{t('projects.subtitle')}</p>         </div>         <button onClick={() => setIsDialogOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 shadow-lg shadow-primary-500/25 transition-all active:scale-[0.97]">           <Plus size={16} strokeWidth={2.5} />           {t('projects.newProject')}         </button>         <CreateProjectDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />       </div>        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">         <div className="relative flex-1 max-w-md w-full">           <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500" />           <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('projects.search')} className="w-full pl-10 pr-4 py-2.5 bg-surface-100 dark:bg-surface-800 border-0 rounded-xl text-sm text-surface-900 dark:text-surface-100 placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:bg-white dark:focus:bg-surface-850 transition-all" />         </div>          <div className="flex items-center gap-2">           <SlidersHorizontal size={16} className="text-surface-400 dark:text-surface-500" />           <select value={filters.status} onChange={e => setFilters({
          ...filters,
          status: e.target.value
        })} className="px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all">             <option value="ALL">{t('projects.allStatus')}</option>             {["ACTIVE", "PLANNING", "ON_HOLD", "COMPLETED", "CANCELLED"].map(s => <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}           </select>           <select value={filters.priority} onChange={e => setFilters({
          ...filters,
          priority: e.target.value
        })} className="px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all">             <option value="ALL">{t('projects.allPriority')}</option>             {["HIGH", "MEDIUM", "LOW"].map(p => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}           </select>           {hasFilters && <button onClick={() => setFilters({
          status: "ALL",
          priority: "ALL"
        })} className="p-2.5 rounded-xl text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">               <RotateCcw size={16} />             </button>}         </div>       </div>        {filteredProjects.length === 0 ? <div className="text-center py-20">           <div className="w-20 h-20 mx-auto mb-6 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center">             <FolderOpen size={40} className="text-surface-400 dark:text-surface-500" />           </div>           <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-1">{t('projects.noProjects')}</h3>           <p className="text-surface-500 dark:text-surface-400 mb-6 text-sm">             {searchTerm || hasFilters ? t('projects.adjustSearch') : t('projects.noProjectsDesc')}           </p>           {!searchTerm && !hasFilters && <button onClick={() => setIsDialogOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 shadow-lg shadow-primary-500/20 transition-all">               <Plus size={16} />               {t('projects.createProject')}             </button>}         </div> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">           {filteredProjects.map(project => <ProjectCard key={project.id} project={project} />)}         </div>}     </div>;
}