import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Shield, UserCog, Activity, ListTodo, UserPlus, FolderKanban, Rocket, Search, Crown, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "../i18n";
import { updateWorkspace } from "../features/workspaceSlice";
const activityIcons = {
  task_created: {
    icon: ListTodo,
    color: "text-primary-500",
    bg: "bg-primary-500/10"
  },
  task_updated: {
    icon: ListTodo,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  task_completed: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  member_joined: {
    icon: UserPlus,
    color: "text-violet-500",
    bg: "bg-violet-500/10"
  },
  project_created: {
    icon: FolderKanban,
    color: "text-sky-500",
    bg: "bg-sky-500/10"
  },
  sprint_created: {
    icon: Rocket,
    color: "text-rose-500",
    bg: "bg-rose-500/10"
  },
  sprint_completed: {
    icon: Rocket,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  }
};
const roleInfo = [{
  roleKey: "adminRoles.admin",
  descKey: "adminRoles.adminDesc",
  permissions: ["adminRoles.permFullAccess", "adminRoles.permManageWorkspace", "adminRoles.permManageProjects"]
}, {
  roleKey: "adminRoles.manager",
  descKey: "adminRoles.managerDesc",
  permissions: ["adminRoles.permManageProjects", "adminRoles.permManageTasks", "adminRoles.permViewAnalytics"]
}, {
  roleKey: "adminRoles.member",
  descKey: "adminRoles.memberDesc",
  permissions: ["adminRoles.permViewProjects", "adminRoles.permManageAssigned"]
}];
const AdminPage = () => {
  const {
    t
  } = useTranslation();
  const dispatch = useDispatch();
  const currentWorkspace = useSelector(state => state.workspace.currentWorkspace);
  const user = useSelector(state => state.auth.user);
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const members = currentWorkspace?.members || [];
  const activities = currentWorkspace?.activities || [];
  const filteredMembers = members.filter(m => m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleRoleChange = (memberId, newRole) => {
    const updatedMembers = members.map(m => m.id === memberId ? {
      ...m,
      role: newRole
    } : m);
    dispatch(updateWorkspace({
      ...currentWorkspace,
      members: updatedMembers
    }));
  };
  const tabs = [{
    id: "users",
    label: t("admin.users"),
    icon: UserCog
  }, {
    id: "permissions",
    label: t("admin.permissions"),
    icon: Shield
  }, {
    id: "activityLog",
    label: t("admin.activityLog"),
    icon: Activity
  }];
  const statCards = [{
    label: t("admin.totalUsers"),
    value: members.length,
    icon: UserCog,
    color: "text-primary-600 dark:text-primary-400",
    bg: "bg-primary-500/10"
  }, {
    label: t("admin.activeSessions"),
    value: members.length,
    icon: Activity,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10"
  }, {
    label: t("admin.storageUsed"),
    value: t('common.na'),
    icon: Shield,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10"
  }];
  return <div className="max-w-7xl mx-auto space-y-8">       <div>         <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">{t("admin.title")}</h1>         <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">{t("admin.subtitle")}</p>       </div>        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">         {statCards.map(card => {
        const Icon = card.icon;
        return <div key={card.label} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5">               <div className="flex items-center justify-between">                 <div>                   <p className="text-sm text-surface-500 dark:text-surface-400 mb-0.5">{card.label}</p>                   <p className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">{card.value}</p>                 </div>                 <div className={`p-3 rounded-xl ${card.bg}`}>                   <Icon size={20} className={card.color} strokeWidth={1.5} />                 </div>               </div>             </div>;
      })}       </div>        <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit">         {tabs.map(tab => {
        const Icon = tab.icon;
        return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm" : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"}`}>               <Icon size={16} strokeWidth={1.5} />               {tab.label}             </button>;
      })}       </div>        {activeTab === "users" && <div>           <div className="relative max-w-md mb-5">             <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500" />             <input placeholder={t("team.search")} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-surface-100 dark:bg-surface-800 border-0 rounded-xl text-sm text-surface-900 dark:text-surface-100 placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:bg-white dark:focus:bg-surface-850 transition-all" />           </div>            {filteredMembers.length === 0 ? <div className="text-center py-20">               <div className="w-20 h-20 mx-auto mb-6 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center">                 <UserCog size={40} className="text-surface-400 dark:text-surface-500" />               </div>               <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-1">                 {members.length === 0 ? t("team.noMembers") : t("team.noMatch")}               </h3>               <p className="text-surface-500 dark:text-surface-400 text-sm">                 {members.length === 0 ? t("team.noMembersDesc") : t("team.adjustSearch")}               </p>             </div> : <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">               <div className="overflow-x-auto">                 <table className="w-full text-sm">                   <thead>                     <tr className="bg-surface-50 dark:bg-surface-850 border-b border-surface-200 dark:border-surface-800">                       <th className="text-left px-6 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t("team.name")}</th>                       <th className="text-left px-6 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t("team.email")}</th>                       <th className="text-left px-6 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t("admin.role")}</th>                       <th className="text-left px-6 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t("admin.joined")}</th>                     </tr>                   </thead>                   <tbody className="divide-y divide-surface-100 dark:divide-surface-800">                     {filteredMembers.map(member => <tr key={member.id} className="hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors">                         <td className="px-6 py-3.5 whitespace-nowrap">                           <div className="flex items-center gap-3">                             <div className="size-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">                               {member?.name?.[0]?.toUpperCase() || member?.email?.[0]?.toUpperCase() || "?"}                             </div>                             <span className="font-medium text-surface-900 dark:text-surface-100">{member?.name || "Unknown User"}</span>                           </div>                         </td>                         <td className="px-6 py-3.5 whitespace-nowrap text-surface-500 dark:text-surface-400">{member?.email || "-"}</td>                         <td className="px-6 py-3.5 whitespace-nowrap">                           <div className="flex items-center gap-1.5">                             {member.role === "ADMIN" && <Crown size={12} className="text-violet-600 dark:text-violet-400" />}                             <select value={member.role || "MEMBER"} onChange={e => handleRoleChange(member.id, e.target.value)} className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${member.role === "ADMIN" ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300" : member.role === "MANAGER" ? "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300" : "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300"}`}>                               <option value="ADMIN">Admin</option>                               <option value="MANAGER">Manager</option>                               <option value="MEMBER">Member</option>                             </select>                           </div>                         </td>                         <td className="px-6 py-3.5 whitespace-nowrap text-surface-500 dark:text-surface-400">                           {member.joinedAt ? format(new Date(member.joinedAt), "MMM d, yyyy") : "-"}                         </td>                       </tr>)}                   </tbody>                 </table>               </div>             </div>}         </div>}        {activeTab === "permissions" && <div className="grid grid-cols-1 md:grid-cols-3 gap-5">           {roleInfo.map(role => <div key={role.role} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">               <div className="flex items-center gap-3 mb-4">                 <div className={`p-2.5 rounded-xl ${role.role === "Admin" ? "bg-violet-500/10" : role.role === "Manager" ? "bg-sky-500/10" : "bg-surface-500/10"}`}>                   <Shield size={18} className={role.role === "Admin" ? "text-violet-600 dark:text-violet-400" : role.role === "Manager" ? "text-sky-600 dark:text-sky-400" : "text-surface-600 dark:text-surface-400"} strokeWidth={1.5} />                 </div>                 <div>                   <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">{role.role}</h3>                   <p className="text-xs text-surface-500 dark:text-surface-400">{role.description}</p>                 </div>               </div>               <ul className="space-y-2.5">                 {role.permissions.map(perm => <li key={perm} className="flex items-center gap-2.5 text-sm text-surface-600 dark:text-surface-400">                     <CheckCircle size={14} className="text-emerald-500 shrink-0" />                     {perm}                   </li>)}               </ul>             </div>)}         </div>}        {activeTab === "activityLog" && <div>           {activities.length === 0 ? <div className="text-center py-20">               <div className="w-20 h-20 mx-auto mb-6 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center">                 <Activity size={40} className="text-surface-400 dark:text-surface-500" />               </div>               <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-1">{t("admin.noActivity")}</h3>               <p className="text-surface-500 dark:text-surface-400 text-sm">{t("admin.noActivityDesc")}</p>             </div> : <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">               <div className="divide-y divide-surface-100 dark:divide-surface-800">                 {activities.map((activity, index) => {
            const typeStyle = activityIcons[activity.type] || activityIcons.task_created;
            const Icon = typeStyle.icon;
            return <div key={activity.id || index} className="px-6 py-4 hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors">                       <div className="flex items-start gap-4">                         <div className={`p-2 rounded-xl ${typeStyle.bg} shrink-0`}>                           <Icon size={14} className={typeStyle.color} />                         </div>                         <div className="flex-1 min-w-0">                           <div className="flex items-center justify-between gap-4">                             <p className="text-sm text-surface-900 dark:text-surface-100">                               <span className="font-medium">{activity.userName || t('common.unknown')}</span>{" "}                               <span className="text-surface-500 dark:text-surface-400">{activity.message}</span>                             </p>                             <span className="shrink-0 text-xs text-surface-400 dark:text-surface-500">                               {format(new Date(activity.timestamp), "MMM d, h:mm a")}                             </span>                           </div>                         </div>                       </div>                     </div>;
          })}               </div>             </div>}         </div>}     </div>;
};
export default AdminPage;