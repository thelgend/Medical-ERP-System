import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  Trash, 
  Clock, 
  Search, 
  CheckCircle2,
  Calendar,
  FlaskConical,
  Users,
  LogOut,
  Receipt,
  Package,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationsContext';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';

export default function Notifications() {
  const { language } = useSettings();
  const t = useTranslation(language);
  const { notifications, markOneRead, markAllRead, deleteNotifications, clearAll, markSelectedRead } = useNotifications();
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const notifIcon = (type) => {
    const icons = {
      appointment: <Calendar className="w-5 h-5" />,
      lab: <FlaskConical className="w-5 h-5" />,
      alert: <AlertCircle className="w-5 h-5" />,
      report: <FileText className="w-5 h-5" />,
      patient: <Users className="w-5 h-5" />,
      auth: <LogOut className="w-5 h-5" />,
      billing: <Receipt className="w-5 h-5" />,
      inventory: <Package className="w-5 h-5" />,
    };
    return icons[type] || <Bell className="w-5 h-5" />;
  };

  const notifColor = (type) => {
    const colors = {
      appointment: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      lab: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      alert: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      report: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      patient: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      auth: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
      billing: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      inventory: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    };
    return colors[type] || 'bg-muted dark:bg-slate-800 text-muted-foreground';
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           n.body.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || n.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [notifications, searchTerm, filterType]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  const handleDeleteSelected = () => {
    if (confirm(language === 'ar' ? `هل أنت متأكد من حذف ${selectedIds.length} إشعار؟` : `Are you sure you want to delete ${selectedIds.length} notifications?`)) {
      deleteNotifications(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleMarkSelectedRead = () => {
    markSelectedRead(selectedIds);
    setSelectedIds([]);
  };

  const handleClearAll = () => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من مسح جميع الإشعارات؟' : 'Are you sure you want to clear all notifications?')) {
      clearAll();
      setSelectedIds([]);
    }
  };

  return (
    <div className={cn("space-y-6 animate-in fade-in duration-500 pb-10", language === 'ar' ? "font-cairo" : "font-sans")} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">{t('notifications_mgmt')}</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{t('notifications_desc')}</p>
        </div>
        <div className={cn("flex items-center gap-2", language === 'ar' ? "flex-row-reverse" : "flex-row")}>
          {selectedIds.length > 0 && (
            <>
              <button 
                onClick={handleMarkSelectedRead}
                className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-black border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-sm text-[10px] uppercase tracking-widest"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{language === 'ar' ? 'مقروء' : 'Read'} ({selectedIds.length})</span>
              </button>
              <button 
                onClick={handleDeleteSelected}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl font-black border border-red-100 dark:border-red-800 hover:bg-red-100 transition-all flex items-center gap-2 shadow-sm text-[10px] uppercase tracking-widest"
              >
                <Trash2 className="w-4 h-4" />
                <span>{language === 'ar' ? 'حذف' : 'Delete'} ({selectedIds.length})</span>
              </button>
            </>
          )}

          <button 
            onClick={handleClearAll}
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-black border border-border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm text-[10px] uppercase tracking-widest"
          >
            <Trash className="w-4 h-4" />
            <span>{t('clear_all')}</span>
          </button>
        </div>
      </div>

      <div className="glass rounded-[2.5rem] overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        {/* Toolbar */}
        <div className="p-6 border-b border-border dark:border-slate-800 flex flex-col lg:flex-row lg:items-center gap-6 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
             <button 
               onClick={toggleSelectAll}
               className="w-6 h-6 rounded-lg border-2 border-primary/30 flex items-center justify-center transition-all hover:border-primary bg-white dark:bg-slate-800"
             >
               {selectedIds.length > 0 && selectedIds.length === filteredNotifications.length ? (
                 <CheckCircle2 className="w-4 h-4 text-primary fill-primary/10" />
               ) : selectedIds.length > 0 ? (
                 <div className="w-2 h-2 bg-primary rounded-sm" />
               ) : null}
             </button>
             <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{language === 'ar' ? 'تحديد الكل' : 'Select All'}</span>
          </div>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 hidden lg:block" />

          <div className="relative flex-1 group">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors", language === 'ar' ? "right-4" : "left-4")} />
            <input 
              type="text" 
              placeholder={language === 'ar' ? 'بحث في الإشعارات...' : 'Search notifications...'}
              className={cn(
                "w-full h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none text-slate-900 dark:text-white font-medium",
                language === 'ar' ? "pr-12 pl-4" : "pl-12 pr-4"
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {['all', 'auth', 'appointment', 'lab', 'billing', 'inventory'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                  filterType === type 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                    : "bg-white dark:bg-slate-800 text-muted-foreground border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                )}
              >
                {type === 'all' ? (language === 'ar' ? 'الكل' : 'All') : 
                 type === 'auth' ? (language === 'ar' ? 'هوية' : 'Identity') : 
                 type === 'appointment' ? t('appointments_mgmt') : 
                 type === 'lab' ? t('lab_mgmt') : 
                 type === 'billing' ? t('billing_mgmt') : t('inventory_mgmt')}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-border dark:divide-slate-800 min-h-[400px]">
          {filteredNotifications.length > 0 ? filteredNotifications.map((notif) => (
            <div 
              key={notif.id} 
              className={cn(
                "p-6 flex items-start gap-5 transition-all hover:bg-primary/5 dark:hover:bg-primary/5 relative group",
                !notif.read && "bg-primary/5 dark:bg-primary/10 border-l-[4px] border-l-primary"
              )}
            >
              <div className="pt-2">
                <button 
                  onClick={() => toggleSelect(notif.id)}
                  className={cn(
                    "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center bg-white dark:bg-slate-800",
                    selectedIds.includes(notif.id) 
                      ? "border-primary bg-primary text-white" 
                      : "border-slate-300 dark:border-slate-600 hover:border-primary"
                  )}
                >
                  {selectedIds.includes(notif.id) && <CheckCheck className="w-4 h-4" />}
                </button>
              </div>

              <div className={cn("p-4 rounded-2xl shrink-0 shadow-sm group-hover:scale-110 transition-transform border border-border dark:border-slate-800", notifColor(notif.type))}>
                {notifIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0 pointer-events-auto" onClick={() => !notif.read && markOneRead(notif.id)}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className={cn("text-lg font-black tracking-tight", !notif.read ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400")}>{notif.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    <span dir="ltr">{notif.time}</span>
                  </div>
                </div>
                <p className={cn("text-sm leading-relaxed max-w-4xl", !notif.read ? "text-slate-700 dark:text-slate-300 font-bold" : "text-slate-400 dark:text-slate-500")}>{notif.body}</p>
                {!notif.read && (
                  <div className="mt-3 flex items-center gap-2">
                     <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" />
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest">{language === 'ar' ? 'إشعار جديد' : 'New Notification'}</span>
                  </div>
                )}
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNotifications([notif.id]); }}
                  className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-40 text-center pointer-events-none">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700 shadow-inner">
                <Bell className="w-10 h-10 text-muted-foreground/20" />
              </div>
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{t('no_notifications')}</h4>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto font-bold">{t('success')}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {filteredNotifications.length > 0 && (
          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-border dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={markAllRead}
                className="text-xs font-black text-primary hover:underline flex items-center gap-2 uppercase tracking-widest"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{t('mark_all_read')}</span>
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{t('total_patient_records')} : {filteredNotifications.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}
