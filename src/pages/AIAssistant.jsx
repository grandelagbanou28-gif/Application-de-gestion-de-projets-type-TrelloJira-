import { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from '../i18n';
import { addTask, addUserStory } from '../features/workspaceSlice';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import { Bot, Sparkles, Send, Key, Eye, EyeOff, Mic, Square, StopCircle, BarChart3, ListTodo, BookOpen, AlertTriangle, CheckCircle, Clock, Users, TrendingUp, Zap, Lightbulb } from 'lucide-react';
import { chatWithMemory, hasApiKey, getApiKey, setApiKey } from '../services/aiService';
const QUICK_ACTIONS = [{
  id: 'tasks',
  label: 'G├®n├®rer des t├óches',
  icon: ListTodo,
  color: 'from-primary-500 to-violet-600'
}, {
  id: 'story',
  label: 'User Story',
  icon: BookOpen,
  color: 'from-emerald-500 to-teal-600'
}, {
  id: 'sprint',
  label: 'Analyse sprint',
  icon: BarChart3,
  color: 'from-amber-500 to-orange-600'
}, {
  id: 'dashboard',
  label: 'Dashboard',
  icon: TrendingUp,
  color: 'from-pink-500 to-rose-600'
}];
const AIAssistant = () => {
  const {
    t
  } = useTranslation();
  const dispatch = useDispatch();
  const {
    currentWorkspace
  } = useSelector(state => state.workspace);
  const user = useSelector(state => state.auth.user);
  const projects = currentWorkspace?.projects || [];
  const allSprints = useMemo(() => {
    const result = [];
    projects.forEach(p => {
      (p.sprints || []).forEach(s => {
        result.push({
          ...s,
          projectId: p.id,
          projectName: p.name
        });
      });
    });
    return result;
  }, [projects]);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Bonjour ! Je suis **Graden IA**, votre assistant de gestion de projet. Posez-moi une question ou utilisez les actions rapides ci-dessous.'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [recording, setRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);
  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      toast.error('Entrez une cl├® valide');
      return;
    }
    setApiKey(apiKeyInput.trim());
    setShowApiKeyInput(false);
    toast.success('Cl├® API sauvegard├®e');
  };
  const addMessage = (role, content) => {
    setMessages(prev => [...prev, {
      role,
      content
    }]);
  };
  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return setInput('');
    addMessage('user', text);
    setLoading(true);
    try {
      if (!hasApiKey()) {
        await new Promise(r => setTimeout(r, 800));
        addMessage('assistant', getFallbackResponse(text));
      } else {
        const context = {
          projects: currentWorkspace?.projects || [],
          user: user?.name
        };
        const allMessages = [...messages, {
          role: 'user',
          content: text
        }];
        const response = await chatWithMemory(allMessages, context);
        addMessage('assistant', response);
      }
    } catch (err) {
      console.error('AI error:', err);
      addMessage('assistant', 'D├®sol├®, une erreur est survenue. Veuillez r├®essayer.');
    }
    setLoading(false);
  };
  const getFallbackResponse = text => {
    const lower = text.toLowerCase();
    if (lower.includes('t├óche') || lower.includes('task')) return 'Configurez votre token GitHub (bouton ­ƒöæ) pour utiliser GitHub Models (gratuit). Sinon, utilisez les actions rapides.';
    if (lower.includes('sprint') || lower.includes('analyse')) return 'Pour une analyse de sprint d├®taill├®e, configurez votre token GitHub avec le bouton ­ƒöæ.';
    if (lower.includes('story') || lower.includes('user')) return 'Configurez votre token GitHub pour g├®n├®rer des user stories professionnelles.';
    return 'Configurez votre token GitHub (bouton ­ƒöæ) pour d├®bloquer toutes mes capacit├®s via GitHub Models !';
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleQuickAction = async actionId => {
    switch (actionId) {
      case 'tasks':
        addMessage('user', 'G├®n├¿re des t├óches pour mon projet');
        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        const projectNames = projects.map(p => `"${p.name}"`).join(', ');
        addMessage('assistant', `Je peux g├®n├®rer des t├óches ! Dites-moi ce que vous voulez r├®aliser.\n\nProjets disponibles : ${projectNames || 'Aucun projet'}\n\nExemple : *"G├®n├¿re 5 t├óches pour le module d'authentification"*`);
        setLoading(false);
        break;
      case 'story':
        addMessage('user', 'G├®n├¿re une User Story');
        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        addMessage('assistant', `D├®crivez la fonctionnalit├® que vous voulez transformer en User Story.\n\nExemple : *"En tant qu'utilisateur, je veux pouvoir r├®initialiser mon mot de passe"*`);
        setLoading(false);
        break;
      case 'sprint':
        handleSprintAnalysis();
        break;
      case 'dashboard':
        setActiveTab('dashboard');
        break;
    }
  };
  const handleSprintAnalysis = async () => {
    if (allSprints.length === 0) {
      addMessage('user', 'Analyse les sprints');
      addMessage('assistant', 'Aucun sprint trouv├®. Cr├®ez d\'abord un sprint dans un projet.');
      return;
    }
    addMessage('user', 'Analyse tous les sprints');
    setLoading(true);
    try {
      if (!hasApiKey()) {
        await new Promise(r => setTimeout(r, 1000));
        const total = allSprints.length;
        const active = allSprints.filter(s => s.status === 'ACTIVE').length;
        addMessage('assistant', `­ƒôè **Analyse des sprints**\n\nTotal: ${total} sprint${total > 1 ? 's' : ''}\nActifs: ${active}\n\nConfigurez une cl├® API pour une analyse d├®taill├®e avec recommandations.`);
      } else {
        const context = {
          projects: currentWorkspace?.projects || []
        };
        const prompt = `Analyse tous les sprints du workspace "${currentWorkspace?.name}" et donne un rapport d├®taill├® avec statistiques, risques et recommandations.`;
        const response = await chatWithMemory([...messages, {
          role: 'user',
          content: prompt
        }], context);
        addMessage('assistant', response);
      }
    } catch (err) {
      addMessage('assistant', 'Erreur lors de l\'analyse des sprints.');
    }
    setLoading(false);
  };
  const startRecording = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error('Reconnaissance vocale non support├®e par ce navigateur');
        return;
      }
      ;
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.interimResults = true;
      recognitionRef.current = recognition;
      setRecording(true);
      recognition.onresult = e => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        setInput(transcript);
      };
      recognition.onerror = () => {
        setRecording(false);
        toast.error('Erreur de reconnaissance vocale');
      };
      recognition.onend = () => setRecording(false);
      recognition.start();
    } catch {
      toast.error('Reconnaissance vocale indisponible');
    }
  };
  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };
  const formatMessage = content => {
    return content.replace(/### (.*)/g, '<h3 class="text-sm font-bold mt-3 mb-1">$1</h3>').replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>').replace(/\n/g, '<br/>');
  };
  const dashboardMetrics = useMemo(() => {
    let totalTasks = 0,
      completedTasks = 0,
      overdueTasks = 0,
      unassignedTasks = 0;
    const now = new Date();
    projects.forEach(p => {
      (p.tasks || []).forEach(t => {
        totalTasks++;
        if (t.status === 'COMPLETED' || t.status === 'DONE') completedTasks++;
        if (t.dueDate && new Date(t.dueDate) < now && t.status !== 'COMPLETED' && t.status !== 'DONE') overdueTasks++;
        if (!t.assignee) unassignedTasks++;
      });
    });
    const activeSprints = allSprints.filter(s => s.status === 'ACTIVE').length;
    const completionRate = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
    const health = completionRate >= 70 ? 'good' : completionRate >= 40 ? 'medium' : 'low';
    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      unassignedTasks,
      activeSprints,
      completionRate,
      health,
      projectsCount: projects.length,
      sprintsCount: allSprints.length
    };
  }, [projects, allSprints]);
  if (!currentWorkspace) {
    return <div className="max-w-3xl mx-auto text-center py-16">         <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/25">           <Bot size={48} className="text-white" />         </div>         <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white mb-3">{t('ai.title')}</h1>         <p className="text-lg text-surface-500 dark:text-surface-400 mb-10 max-w-lg mx-auto leading-relaxed">{t('ai.subtitle')}</p>       </div>;
  }
  return <div className="max-w-7xl mx-auto">       <div className="flex items-start justify-between mb-6">         <div>           <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">{t('ai.title')}</h1>           <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">{t('ai.subtitle')}</p>         </div>         <div className="relative">           <button onClick={() => setShowApiKeyInput(!showApiKeyInput)} className={`p-2 rounded-xl transition-all ${hasApiKey() ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'}`} title={hasApiKey() ? 'Cl├® API configur├®e' : 'Configurer cl├® API'}>             <Key size={18} />           </button>           {showApiKeyInput && <div className="absolute right-0 top-12 w-80 p-4 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xl z-50 space-y-3">               <p className="text-xs font-medium text-surface-600 dark:text-surface-400">Token GitHub (gratuit via GitHub Models)</p>               <p className="text-xs text-surface-400 dark:text-surface-500">Utilisez votre token GitHub ÔÇö <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary-500 underline">github.com/settings/tokens</a></p>               <div className="relative">                 <input type={showApiKey ? 'text' : 'password'} value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} placeholder="ghp_..." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 pr-10" />                 <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">                   {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}                 </button>               </div>               <div className="flex gap-2">                 <button onClick={handleSaveApiKey} className="flex-1 px-4 py-2 text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-500 transition-all">Sauvegarder</button>                 <button onClick={() => {
              setShowApiKeyInput(false);
              setApiKeyInput('');
            }} className="px-4 py-2 text-sm font-medium rounded-xl text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all">Annuler</button>               </div>             </div>}         </div>       </div>        <div className="flex gap-2 mb-6">         <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'chat' ? 'bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-200/30' : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'}`}>           <Bot size={16} className="inline mr-1.5" />Chat         </button>         <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-200/30' : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'}`}>           <TrendingUp size={16} className="inline mr-1.5" />Dashboard         </button>       </div>        {activeTab === 'chat' && <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">           {projects.length === 0 && <div className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200/20 px-6 py-3 text-sm text-amber-700 dark:text-amber-400">               Aucun projet ÔÇö cr├®ez un projet pour que Graden IA ait du contexte             </div>}            <div ref={chatContainerRef} className="h-[400px] overflow-y-auto p-6 space-y-4">             {messages.map((msg, i) => <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>                 {msg.role === 'assistant' ? <div className="size-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-emerald-500/20">                     <Bot size={18} className="text-white" />                   </div> : <div className="size-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-primary-500/20">                     <span className="text-white text-xs font-bold">{(user?.nickname || user?.name || 'U')[0].toUpperCase()}</span>                   </div>}                 <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>                   <p className={`text-[11px] font-medium mb-1 px-1 ${msg.role === 'user' ? 'text-right text-surface-400 dark:text-surface-500' : 'text-emerald-600 dark:text-emerald-400'}`}>                     {msg.role === 'user' ? user?.nickname || user?.name || 'Vous' : 'Graden IA'}                   </p>                   <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-tr-sm' : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-tl-sm'}`}>                     {msg.role === 'assistant' ? <span dangerouslySetInnerHTML={{
                __html: formatMessage(msg.content)
              }} /> : msg.content}                   </div>                 </div>               </div>)}              {loading && <div className="flex gap-3">                 <div className="size-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-emerald-500/20">                   <Bot size={18} className="text-white" />                 </div>                 <div className="px-4 py-3 rounded-2xl bg-surface-100 dark:bg-surface-800 rounded-tl-sm">                   <div className="flex gap-1.5">                     <span className="size-2 bg-surface-400 rounded-full animate-bounce" style={{
                animationDelay: '0ms'
              }} />                     <span className="size-2 bg-surface-400 rounded-full animate-bounce" style={{
                animationDelay: '150ms'
              }} />                     <span className="size-2 bg-surface-400 rounded-full animate-bounce" style={{
                animationDelay: '300ms'
              }} />                   </div>                 </div>               </div>}              <div ref={messagesEndRef} />           </div>            <div className="px-6 py-3 border-t border-surface-200 dark:border-surface-800">             <div className="flex flex-wrap gap-2 mb-3">               {QUICK_ACTIONS.map(action => <button key={action.id} onClick={() => handleQuickAction(action.id)} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all disabled:opacity-50">                   <action.icon size={12} />                   {action.label}                 </button>)}             </div>              <div className="flex items-end gap-2">               <button onClick={recording ? stopRecording : startRecording} className={`p-2.5 rounded-xl transition-all shrink-0 ${recording ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800'}`}>                 {recording ? <Square size={18} /> : <Mic size={18} />}               </button>               <div className="flex-1 relative">                 <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={recording ? 'Parlez...' : 'Posez une question ├á Graden IA...'} rows={1} className="w-full px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm placeholder-surface-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all max-h-32" style={{
              minHeight: 40
            }} />               </div>               <button onClick={handleSend} disabled={!input.trim() || loading} className="p-2.5 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white hover:from-primary-500 hover:to-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-lg shadow-primary-500/20">                 <Send size={16} />               </button>             </div>           </div>         </div>}        {activeTab === 'dashboard' && <div className="space-y-6">           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">             <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5">               <div className="flex items-center gap-3 mb-3">                 <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-500/10">                   <ListTodo size={18} className="text-primary-600 dark:text-primary-400" />                 </div>                 <span className="text-xs font-medium text-surface-500 dark:text-surface-400">Total T├óches</span>               </div>               <p className="text-3xl font-bold text-surface-900 dark:text-white">{dashboardMetrics.totalTasks}</p>             </div>              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5">               <div className="flex items-center gap-3 mb-3">                 <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/10">                   <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />                 </div>                 <span className="text-xs font-medium text-surface-500 dark:text-surface-400">Compl├®t├®es</span>               </div>               <p className="text-3xl font-bold text-surface-900 dark:text-white">{dashboardMetrics.completedTasks}</p>               <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{dashboardMetrics.completionRate}% taux d'ach├¿vement</p>             </div>              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5">               <div className="flex items-center gap-3 mb-3">                 <div className="p-2 rounded-xl bg-red-100 dark:bg-red-500/10">                   <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />                 </div>                 <span className="text-xs font-medium text-surface-500 dark:text-surface-400">En retard</span>               </div>               <p className="text-3xl font-bold text-red-600 dark:text-red-400">{dashboardMetrics.overdueTasks}</p>             </div>              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5">               <div className="flex items-center gap-3 mb-3">                 <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/10">                   <Users size={18} className="text-amber-600 dark:text-amber-400" />                 </div>                 <span className="text-xs font-medium text-surface-500 dark:text-surface-400">Non assign├®es</span>               </div>               <p className="text-3xl font-bold text-surface-900 dark:text-white">{dashboardMetrics.unassignedTasks}</p>             </div>           </div>            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">             <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">               <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Sant├® du projet</h3>               <div className="space-y-4">                 <div>                   <div className="flex justify-between text-sm mb-1.5">                     <span className="text-surface-600 dark:text-surface-400">T├óches compl├®t├®es</span>                     <span className="font-medium text-surface-900 dark:text-white">{dashboardMetrics.completionRate}%</span>                   </div>                   <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-2.5">                     <div className={`h-2.5 rounded-full transition-all duration-700 ${dashboardMetrics.health === 'good' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : dashboardMetrics.health === 'medium' ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-red-500 to-red-400'}`} style={{
                  width: `${dashboardMetrics.completionRate}%`
                }} />                   </div>                 </div>                  <div className="grid grid-cols-2 gap-3 text-sm">                   <div className="bg-surface-50 dark:bg-surface-850 rounded-xl p-3 text-center">                     <p className="text-2xl font-bold text-surface-900 dark:text-white">{dashboardMetrics.projectsCount}</p>                     <p className="text-xs text-surface-500 dark:text-surface-400">Projets</p>                   </div>                   <div className="bg-surface-50 dark:bg-surface-850 rounded-xl p-3 text-center">                     <p className="text-2xl font-bold text-surface-900 dark:text-white">{dashboardMetrics.sprintsCount}</p>                     <p className="text-xs text-surface-500 dark:text-surface-400">Sprints</p>                   </div>                   <div className="bg-surface-50 dark:bg-surface-850 rounded-xl p-3 text-center">                     <p className="text-2xl font-bold text-surface-900 dark:text-white">{dashboardMetrics.activeSprints}</p>                     <p className="text-xs text-surface-500 dark:text-surface-400">Sprints actifs</p>                   </div>                   <div className="bg-surface-50 dark:bg-surface-850 rounded-xl p-3 text-center">                     <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{dashboardMetrics.completedTasks}</p>                     <p className="text-xs text-surface-500 dark:text-surface-400">Termin├®es</p>                   </div>                 </div>               </div>             </div>              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">               <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Recommandations IA</h3>               <div className="space-y-3">                 {dashboardMetrics.overdueTasks > 0 && <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-sm">                     <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />                     <span className="text-surface-700 dark:text-surface-300">{dashboardMetrics.overdueTasks} t├óche{dashboardMetrics.overdueTasks > 1 ? 's' : ''} en retard ÔÇö priorisez-les !</span>                   </div>}                 {dashboardMetrics.unassignedTasks > 0 && <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-sm">                     <Users size={16} className="text-amber-500 mt-0.5 shrink-0" />                     <span className="text-surface-700 dark:text-surface-300">{dashboardMetrics.unassignedTasks} t├óche{dashboardMetrics.unassignedTasks > 1 ? 's' : ''} non assign├®e{dashboardMetrics.unassignedTasks > 1 ? 's' : ''}</span>                   </div>}                 {dashboardMetrics.activeSprints === 0 && dashboardMetrics.projectsCount > 0 && <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-sm">                     <Zap size={16} className="text-blue-500 mt-0.5 shrink-0" />                     <span className="text-surface-700 dark:text-surface-300">Aucun sprint actif ÔÇö d├®marrez un sprint pour suivre le progr├¿s</span>                   </div>}                 {dashboardMetrics.completionRate === 100 && dashboardMetrics.totalTasks > 0 && <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-sm">                     <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />                     <span className="text-surface-700 dark:text-surface-300">Toutes les t├óches sont termin├®es ! Bravo ­ƒÄë</span>                   </div>}                 {dashboardMetrics.completionRate < 30 && dashboardMetrics.totalTasks > 0 && <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-sm">                     <TrendingUp size={16} className="text-red-500 mt-0.5 shrink-0" />                     <span className="text-surface-700 dark:text-surface-300">Faible taux d'ach├¿vement ({dashboardMetrics.completionRate}%) ÔÇö concentrez-vous sur les t├óches critiques</span>                   </div>}                 {dashboardMetrics.overdueTasks === 0 && dashboardMetrics.unassignedTasks === 0 && dashboardMetrics.activeSprints > 0 && <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-sm">                     <Lightbulb size={16} className="text-emerald-500 mt-0.5 shrink-0" />                     <span className="text-surface-700 dark:text-surface-300">Tout est sous contr├┤le ! Continuez ├á avancer sur les sprints actifs.</span>                   </div>}                 {dashboardMetrics.totalTasks === 0 && <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-100 dark:bg-surface-800 text-sm text-surface-500 dark:text-surface-400">                     <Lightbulb size={16} className="mt-0.5 shrink-0" />                     <span>Ajoutez des t├óches et des sprints pour voir les analyses ici.</span>                   </div>}               </div>                <button onClick={() => setActiveTab('chat')} className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/20">                 <Sparkles size={16} />                 Demander une analyse d├®taill├®e ├á Graden IA               </button>             </div>           </div>         </div>}     </div>;
};
export default AIAssistant;