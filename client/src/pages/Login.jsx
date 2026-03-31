import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Mail, 
  Lock, 
  AlertCircle,
  ShieldCheck,
  Zap,
  Globe,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationsContext';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import loginBg from '@/assets/login-bg.png';
import { useTranslation } from '@/lib/translations';

export default function Login() {
  const [email, setEmail] = useState('admin@erp.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { addNotification } = useNotifications();
  const { language, toggleLanguage } = useSettings();
  const t = useTranslation(language);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      addNotification({ 
        type: 'auth', 
        title: t('success'), 
        body: t('success') 
      });
      navigate('/');
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: ShieldCheck, label: t('enterprise_security'), color: 'text-emerald-400' },
    { icon: Zap, label: t('real_time_analytics'), color: 'text-amber-400' },
    { icon: Globe, label: t('multilingual_support'), color: 'text-blue-400' },
    { icon: Stethoscope, label: t('clinical_intelligence'), color: 'text-primary' }
  ];

  return (
    <div className={cn(
      "min-h-screen w-full flex bg-white dark:bg-slate-950 overflow-hidden",
      language === 'ar' ? "font-cairo" : "font-sans"
    )} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Visual Side (Desktop) */}
      <div className={cn(
        "hidden lg:flex lg:w-3/5 h-screen relative items-center justify-center overflow-hidden bg-slate-900 border-white/5",
        language === 'ar' ? "border-l" : "border-r"
      )}>
        <img 
          src={loginBg} 
          alt="Medical Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity scale-110 animate-pulse duration-[10s]"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-transparent to-primary/20" />
        
        <div className="relative z-10 p-12 max-w-2xl animate-in slide-in-from-right-10 duration-1000">
           <div className="flex items-center gap-4 mb-10">
             <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center border border-white/20 animate-float shadow-2xl shadow-primary/20">
               <Stethoscope className="w-8 h-8 text-white" />
             </div>
             <div className={cn("h-px w-20 bg-gradient-to-r from-primary to-transparent", language === 'ar' && "rotate-180")} />
           </div>
           
           <h1 className="text-6xl font-black text-white leading-tight mb-6 pb-2 tracking-tighter">
             {language === 'ar' ? (
               <>مستقبل <span className="text-primary italic">الذكاء</span> العيادي المتطور.</>
             ) : (
               <>Future of <span className="text-primary italic">Clinical</span> Intelligence.</>
             )}
           </h1>
           <p className="text-lg text-slate-300 font-medium leading-relaxed mb-12 max-w-lg">
             {t('login_subtitle')}
           </p>

           <div className="grid grid-cols-2 gap-6">
              {features.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-default group">
                  <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", item.color)} />
                  <span className="text-xs font-bold text-white/80">{item.label}</span>
                </div>
              ))}
           </div>
        </div>

        <div className={cn("absolute bottom-12 flex items-center gap-2", language === 'ar' ? 'left-12' : 'right-12')}>
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
           <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t('system_version')} 4.2.0-STABLE</span>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-2/5 h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 relative">
        
        <button 
          onClick={toggleLanguage}
          className={cn(
            "absolute top-8 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all font-black text-[10px] text-primary tracking-widest uppercase",
            language === 'ar' ? "left-8" : "right-8"
          )}
        >
          {language === 'ar' ? 'English' : 'العربية'}
        </button>

        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
           
           <div className="lg:hidden flex justify-center mb-10">
              <div className="w-16 h-16 bg-primary rounded-[2.5rem] flex items-center justify-center text-white shadow-xl shadow-primary/30">
                <Stethoscope className="w-8 h-8" />
              </div>
           </div>

           <div className={cn("mb-10 text-center", language === 'ar' ? "lg:text-right" : "lg:text-left")}>
             <h2 className="text-4xl font-[1000] text-slate-900 dark:text-white tracking-tighter mb-2">{t('welcome_back')}</h2>
             <p className="text-sm font-bold text-muted-foreground">{t('login_subtitle')}</p>
           </div>

           {error && (
             <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border-red-500 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-300 border">
               <AlertCircle className="w-5 h-5 text-red-500" />
               <p className="text-xs font-bold text-red-700 dark:text-red-400">{error}</p>
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pr-1">{t('email_label')}</label>
                <div className="relative group">
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors",
                    language === 'ar' ? "right-4" : "left-4"
                  )}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="email" 
                    required
                    className={cn(
                      "w-full h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-slate-700 dark:text-white placeholder:font-medium",
                      language === 'ar' ? "pr-12 pl-4" : "pl-12 pr-4"
                    )}
                    placeholder="admin@erp.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
             </div>

             <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('password_label')}</label>
                </div>
                <div className="relative group">
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors",
                    language === 'ar' ? "right-4" : "left-4"
                  )}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    type="password" 
                    required
                    className={cn(
                      "w-full h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-slate-700 dark:text-white placeholder:font-medium",
                      language === 'ar' ? "pr-12 pl-4" : "pl-12 pr-4"
                    )}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
             </div>

             <button 
               type="submit"
               disabled={loading}
               className="w-full h-16 bg-primary text-white font-black rounded-[1.5rem] shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-4 disabled:opacity-70 group mt-8"
             >
               {loading ? (
                 <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 <>
                   <span className="text-base">{t('enter_dashboard')}</span>
                   {language === 'ar' ? <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                 </>
               )}
             </button>
           </form>

           <div className="mt-10 flex flex-col items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('trusted_access')} • {t('enterprise_security')}</span>
           </div>
        </div>
      </div>
    </div>
  );
}
