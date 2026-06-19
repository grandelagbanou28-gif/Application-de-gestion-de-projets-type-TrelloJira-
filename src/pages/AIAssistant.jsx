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
  labelKey: 'ai.quickTasks',
  icon: ListTodo,
  color: 'from-primary-500 to-violet-600'
}, {
  id: 'story',
  labelKey: 'ai.quickStory',
  icon: BookOpen,
  color: 'from-emerald-500 to-teal-600'
}, {
  id: 'sprint',
  labelKey: 'ai.quickSprint',
  icon: BarChart3,
  color: 'from-amber-500 to-orange-600'
}, {
  id: 'dashboard',
  labelKey: 'ai.quickDashboard',
  icon: TrendingUp,
  color: 'from-pink-500 to-rose-600'
}];
const FRENCH_PATTERN = /[éèêëàâäùûüôöîïç]/i;
const isFrench = text => FRENCH_PATTERN.test(text) || /\b(je|tu|il|elle|nous|vous|ils|elles|le|la|les|un|une|des|pour|avec|dans|sur|par|pas|bonjour|salut|génère|crée|analyse|tâche|sprint|story|projet|aide|merci|svp|stp)\b/i.test(text);
const AIAssistant = () => {
  const { t, lang } = useTranslation();
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector(state => state.workspace);
  const user = useSelector(state => state.auth.user);
  const projects = currentWorkspace?.projects || [];
  const allSprints = useMemo(() => {
    const result = [];
    projects.forEach(p => {
      (p.sprints || []).forEach(s => {
        result.push({ ...s, projectId: p.id, projectName: p.name });
      });
    });
    return result;
  }, [projects]);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: t('ai.greeting')
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      toast.error(t('ai.invalidKey'));
      return;
    }
    setApiKey(apiKeyInput.trim());
    setShowApiKeyInput(false);
    toast.success(t('ai.keySaved'));
  };
  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
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
        const context = { projects: currentWorkspace?.projects || [], user: user?.name };
        const allMessages = [...messages, { role: 'user', content: text }];
        const response = await chatWithMemory(allMessages, context);
        addMessage('assistant', response);
      }
    } catch (err) {
      console.error('AI error:', err);
      addMessage('assistant', t('ai.error'));
    }
    setLoading(false);
  };
  const getFallbackResponse = text => {
    const french = isFrench(text);
    const lower = text.toLowerCase();
    if (lower.includes('tâche') || lower.includes('task')) return french ? t('ai.noTokenTasks') : t('ai.noTokenTasks');
    if (lower.includes('sprint') || lower.includes('analyse')) return french ? t('ai.noTokenSprint') : t('ai.noTokenSprint');
    if (lower.includes('story') || lower.includes('user')) return french ? t('ai.noTokenStory') : t('ai.noTokenStory');
    return french ? t('ai.noTokenDefault') : t('ai.noTokenDefault');
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
        addMessage('user', t('ai.generateTasksPrompt'));
        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        const projectNames = projects.map(p => `"${p.name}"`).join(', ');
        addMessage('assistant', t('ai.tasksResponse', { projects: projectNames || t('common.na') }));
        setLoading(false);
        break;
      case 'story':
        addMessage('user', t('ai.storyPrompt'));
        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        addMessage('assistant', t('ai.storyResponse'));
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
      addMessage('user', t('ai.sprintAnalysisPrompt'));
      addMessage('assistant', t('ai.noSprints'));
      return;
    }
    addMessage('user', t('ai.sprintAnalysisPrompt'));
    setLoading(true);
    try {
      if (!hasApiKey()) {
        await new Promise(r => setTimeout(r, 1000));
        const total = allSprints.length;
        const active = allSprints.filter(s => s.status === 'ACTIVE').length;
        addMessage('assistant', t('ai.sprintAnalysisResponse', { total, active }));
      } else {
        const context = { projects: currentWorkspace?.projects || [] };
        const prompt = `Analyse tous les sprints du workspace "${currentWorkspace?.name}" et donne un rapport détaillé avec statistiques, risques et recommandations.`;
        const response = await chatWithMemory([...messages, { role: 'user', content: prompt }], context);
        addMessage('assistant', response);
      }
    } catch (err) {
      addMessage('assistant', t('ai.sprintAnalysisError'));
    }
    setLoading(false);
  };
  const startRecording = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error(t('ai.speechNotSupported'));
        return;
      };
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
      recognition.interimResults = true;
      recognitionRef.current = recognition;
      setRecording(true);
      recognition.onresult = e => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        setInput(transcript);
      };
      recognition.onerror = () => {
        setRecording(false);
        toast.error(t('ai.speechError'));
      };
      recognition.onend = () => setRecording(false);
      recognition.start();
    } catch {
      toast.error(t('ai.speechUnavailable'));
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
    let totalTasks = 0, completedTasks = 0, overdueTasks = 0, unassignedTasks = 0;
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
    return { totalTasks, completedTasks, overdueTasks, unassignedTasks, activeSprints, completionRate, health, projectsCount: projects.length, sprintsCount: allSprints.length };
  }, [projects, allSprints]);
  if (!currentWorkspace) {
    return <div className="max-w-3xl mx-auto text-center py-16">         <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/25">           <Bot size={48} className="text-white" />         </div>         <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white mb-3">{t('ai.title')}</h1>         <p className="text-lg text-surface-500 dark:text-surface-400 mb-10 max-w-lg mx-auto leading-relaxed">{t('ai.subtitle')}</p>       </div>;
  }
  return <div className="max-w-7xl mx-auto">       <div className="flex items-start justify-between mb-6">         <div>           <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">{t('ai.title')}</h1>           <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">{t('ai.subtitle')}</p>         </div>         <div className="relative">           <button onClick={() => setShowApiKeyInput(!showApiKeyInput)} className={`p-2 rounded-xl transition-all ${hasApiKey() ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'}`} title={hasApiKey() ? t('ai.keyConfigured') : t('ai.keyNotConfigured')}>             <Key size={18} />           </button>           {showApiKeyInput && <div className="absolute right-0 top-12 w-80 p-4 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xl z-50 space-y-3">               <p className="text-xs font-medium text-surface-600 dark:text-surface-400">{t('ai.keyModalTitle')}</p>               <p className="text-xs text-surface-400 dark:text-surface-500">{t('ai.keyModalDesc')} <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary-500 underline">github.com/settings/tokens</a></p>               <div className="relative">                 <input type={showApiKey ? 'text' : 'password'} value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} placeholder="ghp_..." className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 pr-10" />                 <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200">                   {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}                 </button>               </div>               <button onClick={handleSaveApiKey} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-500 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/20">{t('common.save')}</button>               <button onClick={() => {                 setShowApiKeyInput(false);
                setApiKeyInput('');
              }} className="w-full px-4 py-2 text-sm font-medium rounded-xl text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all">{t('ai.cancel')}</button>             </div>}         </div>       </div>        <div className="flex gap-2 mb-6">         <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'chat' ? 'bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-200/30' : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'}`}>           <Bot size={16} className="inline mr-1.5" />{t('ai.chatTab')}         </button>         <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-200/30' : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'}`}>           <TrendingUp size={16} className="inline mr-1.5" />{t('ai.dashboardTab')}         </button>       </div>        {activeTab === 'chat' && <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">           {projects.length === 0 && <div className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200/20 px-6 py-3 text-sm text-amber-700 dark:text-amber-400">               {t('ai.noProjectWarning')}             </div>}            <div ref={chatContainerRef} className="h-[400px] overflow-y-auto p-6 space-y-4">             {messages.map((msg, i) => <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>                 {msg.role === 'assistant' ? <div className="size-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-emerald-500/20">                     <Bot size={18} className="text-white" />                   </div> : <div className="size-8 rounded-xl bg-primary-500 flex items-center justify-center shrink-0 mt-1">                     <User size={16} className="text-white" />                   </div>}                 <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-tr-sm' : 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 rounded-tl-sm'}`}>                   {msg.role === 'user' ? msg.content : <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{                     __html: formatMessage(msg.content)
                  }} />}                 </div>               </div>)}              {loading && <div className="flex gap-3">                 <div className="size-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-emerald-500/20">                   <Bot size={18} className="text-white" />                 </div>                 <div className="px-4 py-3 rounded-2xl bg-surface-100 dark:bg-surface-800 rounded-tl-sm">                   <div className="flex gap-1.5">                     <span className="size-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />                     <span className="size-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />                     <span className="size-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />                   </div>                 </div>               </div>}              <div ref={messagesEndRef} />           </div>            <div className="px-6 py-3 border-t border-surface-200 dark:border-surface-800">             <div className="flex flex-wrap gap-2 mb-3">               {QUICK_ACTIONS.map(action => <button key={action.id} onClick={() => handleQuickAction(action.id)} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all disabled:opacity-50">                   <action.icon size={12} />                   {t(action.labelKey)}                 </button>)}             </div>              <div className="flex items-end gap-2">               <button onClick={recording ? stopRecording : startRecording} className={`p-2.5 rounded-xl transition-all shrink-0 ${recording ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800'}`}>                 {recording ? <Square size={18} /> : <Mic size={18} />}               </button>               <div className="flex-1 relative">                 <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={recording ? t('ai.recordingPlaceholder') : t('ai.inputPlaceholder')} rows={1} className="w-full px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm placeholder-surface-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all max-h-32" style={{ minHeight: 40 }} />               </div>               <button onClick={handleSend} disabled={!input.trim() || loading} className="p-2.5 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white hover:from-primary-500 hover:to-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-lg shadow-primary-500/20">                 <Send size={16} />               </button>             </div>           </div>         </div>}        {activeTab === 'dashboard' && <div className="space-y-6">           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">             <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5">               <div className="flex items-center gap-3 mb-3">                 <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-500/10">                   <ListTodo size={18} className="text-primary-600 dark:text-primary-400" />                 </div>                 <span className="text-xs font-medium text-surface-500 dark:text-surface-400">{t('ai.totalTasks')}</span>               </div>               <p className="text-3xl font-bold text-surface-900 dark:text-white">{dashboardMetrics.totalTasks}</p>             </div>              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5">               <div className="flex items-center gap-3 mb-3">                 <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/10">                   <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />                 </div>                 <span className="text-xs font-medium text-surface-500 dark:text-surface-400">{t('ai.completed')}</span>               </div>               <p className="text-3xl font-bold text-surface-900 dark:text-white">{dashboardMetrics.completedTasks}</p>               <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{dashboardMetrics.completionRate}% {t('ai.completionRate')}</p>             </div>              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5">               <div className="flex items-center gap-3 mb-3">                 <div className="p-2 rounded-xl bg-red-100 dark:bg-red-500/10">                   <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />                 </div>                 <span className="text-xs font-medium text-surface-500 dark:text-surface-400">{t('ai.overdue')}</span>               </div>               <p className="text-3xl font-bold text-surface-900 dark:text-white">{dashboardMetrics.overdueTasks}</p>             </div>              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5">               <div className="flex items-center gap-3 mb-3">                 <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/10">                   <Users size={18} className="text-amber-600 dark:text-amber-400" />                 </div>                 <span className="text-xs font-medium text-surface-500 dark:text-surface-400">{t('ai.unassigned')}</span>               </div>               <p className="text-3xl font-bold text-surface-900 dark:text-white">{dashboardMetrics.unassignedTasks}</p>             </div>           </div>            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">             <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">               <h3 className="font-semibold text-surface-900 dark:text-white mb-4">{t('ai.completionRate')}</h3>               <div className="flex items-center gap-4">                 <div className="flex-1 h-3 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">                   <div className={`h-full rounded-full transition-all duration-700 ${dashboardMetrics.health === 'good' ? 'bg-emerald-500' : dashboardMetrics.health === 'medium' ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${dashboardMetrics.completionRate}%` }} />                 </div>                 <span className="text-lg font-bold text-surface-900 dark:text-white">{dashboardMetrics.completionRate}%</span>               </div>                <div className="grid grid-cols-2 gap-3 text-sm mt-4">                 <div className="bg-surface-50 dark:bg-surface-850 rounded-xl p-3 text-center">                   <p className="text-2xl font-bold text-surface-900 dark:text-white">{dashboardMetrics.projectsCount}</p>                   <p className="text-xs text-surface-500 dark:text-surface-400">{t('ai.projects')}</p>                 </div>                 <div className="bg-surface-50 dark:bg-surface-850 rounded-xl p-3 text-center">                   <p className="text-2xl font-bold text-surface-900 dark:text-white">{dashboardMetrics.sprintsCount}</p>                   <p className="text-xs text-surface-500 dark:text-surface-400">{t('ai.sprints')}</p>                 </div>                 <div className="bg-surface-50 dark:bg-surface-850 rounded-xl p-3 text-center">                   <p className="text-2xl font-bold text-surface-900 dark:text-white">{dashboardMetrics.activeSprints}</p>                   <p className="text-xs text-surface-500 dark:text-surface-400">{t('ai.activeSprints')}</p>                 </div>                 <div className="bg-surface-50 dark:bg-surface-850 rounded-xl p-3 text-center">                   <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{dashboardMetrics.completedTasks}</p>                   <p className="text-xs text-surface-500 dark:text-surface-400">{t('ai.done')}</p>                 </div>               </div>             </div>              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">               <h3 className="font-semibold text-surface-900 dark:text-white mb-4">{t('ai.aiRecommendations')}</h3>               <div className="space-y-3">                 {dashboardMetrics.overdueTasks > 0 && <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-sm">                     <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />                     <div>                       <p className="font-medium text-red-800 dark:text-red-300">{dashboardMetrics.overdueTasks} {t('ai.overdue').toLowerCase()}</p>                       <p className="text-red-600 dark:text-red-400 mt-0.5">{t('ai.done')}</p>                     </div>                   </div>}                 {dashboardMetrics.unassignedTasks > 0 && <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-sm">                     <Users size={16} className="text-amber-500 shrink-0 mt-0.5" />                     <div>                       <p className="font-medium text-amber-800 dark:text-amber-300">{dashboardMetrics.unassignedTasks} {t('ai.unassigned').toLowerCase()}</p>                       <p className="text-amber-600 dark:text-amber-400 mt-0.5">{t('ai.done')}</p>                     </div>                   </div>}                 {dashboardMetrics.completionRate < 50 && <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-sm">                     <Lightbulb size={16} className="text-blue-500 shrink-0 mt-0.5" />                     <div>                       <p className="font-medium text-blue-800 dark:text-blue-300">{t('ai.completionRate')}</p>                       <p className="text-blue-600 dark:text-blue-400 mt-0.5">{t('ai.done')}</p>                     </div>                   </div>}                 {dashboardMetrics.health === 'good' && <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-sm">                     <Zap size={16} className="text-emerald-500 shrink-0 mt-0.5" />                     <div>                       <p className="font-medium text-emerald-800 dark:text-emerald-300">Bon rythme !</p>                       <p className="text-emerald-600 dark:text-emerald-400 mt-0.5">Continuez comme ça.</p>                     </div>                   </div>}               </div>             </div>           </div>         </div>}     </div>;
};
export default AIAssistant;
