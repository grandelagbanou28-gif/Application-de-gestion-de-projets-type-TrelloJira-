import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../features/authSlice";
import { useTranslation } from "../i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { Rocket, Mail, Lock, Eye, EyeOff } from "lucide-react";
export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      setError(t("login.fillFields"));
      return;
    }
    ;
    const user = {
      id: "user_" + Date.now(),
      name: formData.email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      email: formData.email
    };
    dispatch(login(user));
    navigate("/");
  };
  return <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4 relative">       <div className="absolute top-4 right-4"><LanguageSwitcher /></div>       <div className="w-full max-w-md">         <div className="text-center mb-8">           <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/25"><Rocket size={32} className="text-white" /></div>           <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t("login.welcome")}</h1>           <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">{t("login.subtitle")}</p>         </div>         <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-8 shadow-xl space-y-5">           <div>             <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t("login.email")}</label>             <div className="relative">               <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />               <input type="email" value={formData.email} onChange={e => {
              setFormData({
                ...formData,
                email: e.target.value
              });
              setError("");
            }} placeholder={t("login.emailPlaceholder")} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" />             </div>           </div>           <div>             <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{t("login.password")}</label>             <div className="relative">               <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />               <input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => {
              setFormData({
                ...formData,
                password: e.target.value
              });
              setError("");
            }} placeholder={t("login.passwordPlaceholder")} className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 text-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" />               <button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>             </div>           </div>           {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}           <button type="submit" className="w-full py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/30 transition-all active:scale-[0.97]">{t("login.signIn")}</button>           <p className="text-xs text-center text-surface-400 dark:text-surface-500">{t("login.noAccount")}</p>         </form>       </div>     </div>;
}