import { useSelector } from "react-redux";
import { Settings as SettingsIcon, Palette, Bell, Users, Shield, ChevronRight, UserCircle } from "lucide-react";
import { useTranslation } from "../i18n";
import { useState } from "react";
import ProfileEditor from "../components/ProfileEditor";
export default function Settings() {
  const {
    t
  } = useTranslation();
  const {
    currentWorkspace
  } = useSelector(state => state.workspace);
  const [activeSection, setActiveSection] = useState("profile");
  const sections = [{
    id: "profile",
    label: t('profile.title'),
    icon: UserCircle,
    description: t('profile.bioPlaceholder')
  }, {
    id: "general",
    label: t('settings.general'),
    icon: SettingsIcon,
    description: t('settings.generalDesc')
  }, {
    id: "appearance",
    label: t('settings.appearance'),
    icon: Palette,
    description: t('settings.appearanceDesc')
  }, {
    id: "notifications",
    label: t('settings.notifications'),
    icon: Bell,
    description: t('settings.notificationsDesc')
  }, {
    id: "team",
    label: t('settings.team'),
    icon: Users,
    description: t('settings.teamDesc')
  }, {
    id: "security",
    label: t('settings.security'),
    icon: Shield,
    description: t('settings.securityDesc')
  }];
  return <div className="max-w-5xl mx-auto space-y-8">       <div>         <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">{t('settings.title')}</h1>         <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">           {t('settings.subtitle')}         </p>       </div>        <div className="grid lg:grid-cols-[240px_1fr] gap-8">         <div className="space-y-1">           {sections.map(section => {
          const Icon = section.icon;
          return <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all ${activeSection === section.id ? "bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 font-medium" : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100"}`}>                 <Icon size={18} strokeWidth={1.5} />                 <span>{section.label}</span>                 <ChevronRight size={14} className="ml-auto text-surface-300 dark:text-surface-600" />               </button>;
        })}         </div>          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-8">           {activeSection === "profile" && <ProfileEditor />}            {activeSection === "general" && <div className="space-y-6">               <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{t('settings.general')}</h2>               <p className="text-sm text-surface-500 dark:text-surface-400">{t('settings.generalDesc')}</p>               {currentWorkspace ? <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700">                   <p className="text-sm text-surface-700 dark:text-surface-300">                     <span className="font-medium">{t('settings.currentWorkspace')}:</span>{" "}                     <span className="text-primary-600 dark:text-primary-400">{currentWorkspace.name}</span>                   </p>                   <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">                     {currentWorkspace.members?.length || 0} {t('settings.members')} · {currentWorkspace.projects?.length || 0} {t('settings.projects')}                   </p>                 </div> : <div className="p-6 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-center">                   <SettingsIcon size={24} className="mx-auto mb-2 text-surface-300 dark:text-surface-600" />                   <p className="text-sm text-surface-500 dark:text-surface-400">{t('settings.noWorkspace')}</p>                   <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">{t('settings.noWorkspaceDesc')}</p>                 </div>}             </div>}            {activeSection === "appearance" && <div className="space-y-6">               <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{t('settings.appearance')}</h2>               <p className="text-sm text-surface-500 dark:text-surface-400">{t('settings.appearanceDesc')}</p>               <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700">                 <p className="text-sm text-surface-500 dark:text-surface-400">{t('settings.appearanceInfo')}</p>               </div>             </div>}            {activeSection === "notifications" && <div className="space-y-6">               <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{t('settings.notifications')}</h2>               <p className="text-sm text-surface-500 dark:text-surface-400">{t('settings.notificationsDesc')}</p>               <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700">                 <p className="text-sm text-surface-500 dark:text-surface-400">{t('settings.notificationsInfo')}</p>               </div>             </div>}            {activeSection === "team" && <div className="space-y-6">               <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{t('settings.team')}</h2>               <p className="text-sm text-surface-500 dark:text-surface-400">{t('settings.teamDesc')}</p>               {currentWorkspace?.members?.length > 0 ? <div className="space-y-2">                   {currentWorkspace.members.map((member, i) => <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700">                       <div className="flex items-center gap-3">                         <div className="size-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">                           {member?.name?.[0]?.toUpperCase() || member?.email?.[0]?.toUpperCase() || "?"}                         </div>                         <div>                           <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{member?.name || "Unknown"}</p>                           <p className="text-xs text-surface-400 dark:text-surface-500">{member?.email}</p>                         </div>                       </div>                       <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">                         {member.role || "MEMBER"}                       </span>                     </div>)}                 </div> : <div className="p-6 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-center">                   <Users size={24} className="mx-auto mb-2 text-surface-300 dark:text-surface-600" />                   <p className="text-sm text-surface-500 dark:text-surface-400">{t('settings.noMembers')}</p>                   <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">{t('settings.noMembersDesc')}</p>                 </div>}             </div>}            {activeSection === "security" && <div className="space-y-6">               <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{t('settings.security')}</h2>               <p className="text-sm text-surface-500 dark:text-surface-400">{t('settings.securityDesc')}</p>               <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700">                 <p className="text-sm text-surface-500 dark:text-surface-400">{t('settings.securityInfo')}</p>               </div>             </div>}         </div>       </div>     </div>;
}