import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  User as UserIcon, 
  Clock, 
  Filter, 
  ShieldCheck, 
  FileText,
  Activity,
  Terminal,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';
import { useNotifications } from '@/context/NotificationsContext';

export default function ActivityLogs() {
  const { language } = useSettings();
  const t = useTranslation(language);
  const { addNotification } = useNotifications();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterAction, setFilterAction] = useState('');
  const limit = 20;

  useEffect(() => {
    fetchLogs();
  }, [page, filterAction]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * limit;
      const response = await api.get(`/logs?limit=${limit}&skip=${skip}&action=${filterAction}`);
      setLogs(response.data.logs);
      setTotal(response.data.total);
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('DELETE')) return 'bg-red-50 text-red-600 border-red-100';
    if (action.includes('CREATE') || action.includes('ADD')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (action.includes('UPDATE')) return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className={cn("space-y-6 animate-in fade-in duration-500 pb-10", language === 'ar' ? "font-cairo" : "font-sans")} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
             <ShieldCheck className="w-8 h-8 text-primary" />
             {t('system_activity_logs')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{t('logs_desc')}</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Total Logs: {total}
           </div>
        </div>
      </div>

      <div className="glass rounded-[2rem] overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 group">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors", language === 'ar' ? "right-4" : "left-4")} />
            <input 
              type="text" 
              placeholder={language === 'ar' ? 'البحث في السجلات...' : 'Search logs...'}
              className={cn(
                "w-full h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900 dark:text-white",
                language === 'ar' ? "pr-12 pl-4" : "pl-12 pr-4"
              )}
            />
          </div>
          
          <div className="flex gap-2">
            {['', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'].map(act => (
              <button
                key={act}
                onClick={() => { setFilterAction(act); setPage(1); }}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  filterAction === act 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl scale-105" 
                    : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                )}
              >
                {act || 'ALL'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          <table className={cn("w-full border-collapse", language === 'ar' ? "text-right" : "text-left")}>
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-border dark:border-slate-800">
                <th className="px-8 py-5 whitespace-nowrap">{t('user_action')}</th>
                <th className="px-8 py-5 whitespace-nowrap">User</th>
                <th className="px-8 py-5 whitespace-nowrap">{t('target_record')}</th>
                <th className="px-8 py-5 whitespace-nowrap">{t('timestamp')}</th>
                <th className="px-8 py-5 whitespace-nowrap text-center">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                       <p className="text-xs font-bold text-muted-foreground">{t('loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length > 0 ? logs.map((log) => (
                <tr key={log._id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg border text-[9px] font-black uppercase tracking-tighter", getActionColor(log.action))}>
                        {log.action}
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{log.details || '-'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-[10px] font-black">
                        {log.user?.name?.[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{log.user?.name || 'System'}</span>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{log.user?.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{log.target}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap font-mono text-xs text-slate-500">
                     {formatTime(log.timestamp)}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-center">
                     <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black text-slate-400 dark:text-slate-500">{log.ipAddress || '127.0.0.1'}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-32 text-center opacity-30">
                     <div className="flex flex-col items-center gap-3">
                        <Activity className="w-12 h-12" />
                        <p className="font-black text-xl uppercase tracking-widest">{t('no_data')}</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-border dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Showing {(page-1)*limit + 1} - {Math.min(page*limit, total)} of {total} entries
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-10 h-10 flex items-center justify-center font-black text-sm text-primary">{page}</span>
            <button 
              disabled={page * limit >= total}
              onClick={() => setPage(p => p + 1)}
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
