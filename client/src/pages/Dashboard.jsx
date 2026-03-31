import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  FlaskConical, 
  TrendingUp, 
  Clock, 
  ArrowLeft,
  Download,
  CheckCircle2,
  Activity,
  CreditCard,
  FileUp,
  AlertTriangle,
  Plus,
  Trash2,
  ChevronRight,
  ListOrdered,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AddAppointmentModal from '@/components/modals/AddAppointmentModal';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/lib/translations';

function generateDailyReport(appointments, t, language) {
  const headers = language === 'ar' 
    ? ['الاسم', 'العمر', 'الجنس', 'الوقت', 'الطبيب المعالج', 'الحالة']
    : ['Name', 'Age', 'Gender', 'Time', 'Doctor', 'Status'];
    
  const rows = (appointments || []).map(p =>
    [
      p.patient?.name || (language === 'ar' ? 'غير معروف' : 'Unknown'), 
      p.patient?.age || '-', 
      p.patient?.gender || '-', 
      p.slot, 
      p.doctor?.name || '-', 
      p.status
    ].join(',')
  );

  const bom = '\uFEFF'; 
  const csvContent = bom + headers.join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `daily-report-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const { language } = useSettings();
  const { user } = useAuth();
  const t = useTranslation(language);
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [reportDownloaded, setReportDownloaded] = useState(false);
  const { data: serverStats, isLoading } = useDashboardStats();
  const navigate = useNavigate();

  const handleDownloadReport = () => {
    generateDailyReport(serverStats?.dailyAppointments, t, language);
    setReportDownloaded(true);
    setTimeout(() => setReportDownloaded(false), 3000);
  };

  const stats = [
    { 
      name: t('daily_patients'), 
      value: serverStats?.dailyPatients ?? '0', 
      icon: Users, 
      color: 'bg-blue-500',
      hoverColor: 'hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-blue-50/30 dark:hover:bg-blue-500/5',
      trend: language === 'ar' ? 'مرضى جدد' : 'New patients',
      path: '/patients',
      roles: ['Admin', 'Doctor', 'Receptionist']
    },
    { 
      name: t('pending_appointments'), 
      value: serverStats?.pendingAppointments ?? '0', 
      icon: Calendar, 
      color: 'bg-emerald-500',
      hoverColor: 'hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5',
      trend: language === 'ar' ? 'بانتظار التأكيد' : 'Pending',
      path: '/appointments',
      roles: ['Admin', 'Doctor', 'Receptionist']
    },
    { 
      name: t('daily_revenue'), 
      value: `${serverStats?.dailyRevenue ?? 0} ${language === 'ar' ? 'ج.م' : 'EGP'}`, 
      icon: TrendingUp, 
      color: 'bg-amber-500',
      hoverColor: 'hover:border-amber-200 dark:hover:border-amber-500/30 hover:bg-amber-50/30 dark:hover:bg-amber-500/5',
      trend: language === 'ar' ? 'تحصيل اليوم' : 'Today revenue',
      path: '/billing',
      roles: ['Admin', 'Receptionist']
    },
    { 
      name: t('monthly_revenue'), 
      value: `${serverStats?.monthlyRevenue ?? 0} ${language === 'ar' ? 'ج.م' : 'EGP'}`, 
      icon: CreditCard, 
      color: 'bg-purple-500',
      hoverColor: 'hover:border-purple-200 dark:hover:border-purple-500/30 hover:bg-purple-50/30 dark:hover:bg-purple-500/5',
      trend: language === 'ar' ? 'إجمالي الشهر' : 'Monthly total',
      path: '/billing',
      roles: ['Admin']
    }
  ].filter(s => !s.roles || s.roles.includes(user?.role));

  const activityMapping = {
    'CREATE': { label: t('activity_create'), icon: Plus, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    'UPDATE_STATUS': { label: t('activity_update_status'), icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    'CREATE_INVOICE': { label: t('activity_create_invoice'), icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    'PAY_INVOICE': { label: t('activity_pay_invoice'), icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    'CANCEL': { label: t('activity_cancel'), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    'UPLOAD_FILE': { label: t('activity_upload_file'), icon: FileUp, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    'CREATE_LAB_ORDER': { label: t('activity_create_lab_order'), icon: FlaskConical, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    'UPDATE_LAB_STATUS': { label: t('activity_update_lab_status'), icon: Activity, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
    'UPLOAD_LAB_RESULT': { label: t('activity_upload_lab_result'), icon: FileUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    'ADD_INVENTORY_ITEM': { label: t('activity_add_inventory_item'), icon: Plus, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-900/20' },
    'UPDATE_INVENTORY_QTY': { label: t('activity_update_inventory_qty'), icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    'DELETE': { label: t('activity_delete'), icon: Trash2, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-900/20' },
  };

  const targetMapping = {
    'Patient': t('patients'),
    'Appointment': t('appointments'),
    'Bill': t('billing'),
    'LabReport': t('lab'),
    'Inventory': t('inventory'),
    'User': t('staff'),
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return t('activity_just_now');
    if (diffInMinutes < 60) return t('activity_mins_ago').replace('{n}', diffInMinutes);
    if (diffInMinutes < 1440) return t('activity_hours_ago').replace('{n}', Math.floor(diffInMinutes / 60));
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'short' }).format(date);
  };

  if (isLoading) return (
    <div className="h-[60vh] flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-muted-foreground">{t('loading')}</p>
       </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-[1000] tracking-tighter text-slate-900 dark:text-white leading-tight">
            {t('welcome_back')}, <span className="text-primary italic">{user?.name || (language === 'ar' ? 'أهلاً بك' : 'Admin')}</span>
          </h1>
          <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('welcome_desc')}</p>
        </div>
        <button 
          onClick={() => setIsAptModalOpen(true)}
          className="bg-primary text-white px-8 py-4 rounded-[1.5rem] font-black shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-3 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>{t('new_appointment_btn')}</span>
        </button>
      </div>

      <AddAppointmentModal open={isAptModalOpen} onOpenChange={setIsAptModalOpen} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <button
            key={stat.name}
            onClick={() => navigate(stat.path)}
            className={cn(
              "glass p-8 rounded-[2rem] group hover:scale-[1.03] transition-all cursor-pointer overflow-hidden relative border border-slate-200/50 dark:border-slate-800 shadow-premium hover:shadow-2xl text-right w-full",
              stat.hoverColor
            )}
          >
            <div className={cn("absolute right-0 top-0 w-1.5 h-full opacity-40 group-hover:opacity-100 transition-opacity", stat.color)}></div>
            <div className="flex items-center justify-between pointer-events-none">
              <div className={cn("p-3 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg uppercase tracking-tighter">{stat.trend}</p>
            </div>
            <div className="mt-5 pointer-events-none">
              <p className="text-xs font-bold text-muted-foreground dark:text-slate-400">{stat.name}</p>
              <h3 className="text-3xl font-black mt-1 text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass rounded-[2.5rem] overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="p-6 border-b border-border dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('recent_activity')}</h3>
            <button className="text-xs text-primary font-black hover:underline uppercase tracking-widest">{t('view_all')}</button>
          </div>
          <div className="divide-y divide-border dark:divide-slate-800 flex-1">
            {serverStats?.recentActivity?.length > 0 ? serverStats.recentActivity.map((activity) => {
              const mapping = activityMapping[activity.action] || { label: activity.action, icon: Clock, color: 'text-primary', bg: 'bg-primary/5' };
              const Icon = mapping.icon;
              return (
                <div key={activity._id} className="p-5 flex items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                  <div className={cn("p-3 rounded-2xl shadow-sm border border-border dark:border-slate-800 group-hover:scale-110 transition-transform", mapping.bg)}>
                    <Icon className={cn("w-4 h-4", mapping.color)} />
                  </div>
                  <div className={cn("flex-1", language === 'ar' ? 'text-right' : 'text-left')}>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      <span className="text-primary italic">{activity.user?.name || t('activity_user')}</span> 
                      <span className="mx-1 text-slate-400 dark:text-slate-500 font-medium">{mapping.label}</span>
                      <span className="text-slate-600 dark:text-slate-400 leading-none">{targetMapping[activity.target] || activity.target}</span>
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="p-20 text-center opacity-40 flex flex-col items-center gap-3">
                 <Activity className="w-10 h-10 text-slate-300" />
                 <p className="text-xs font-bold">{t('no_data')}</p>
              </div>
            )}
          </div>
        </div>

            {/* Quick Links */}
            <div className="glass rounded-[2.5rem] p-6 flex flex-col gap-4 border border-slate-200/50 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{t('quick_links')}</h3>

              {/* New Queue Actions - visible to Doc/Admin/Receptionist */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                {['Admin', 'Receptionist'].includes(user?.role) && (
                   <button
                    onClick={() => navigate('/queue')}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-primary text-white hover:shadow-xl hover:shadow-primary/20 transition-all group"
                  >
                    <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5"/>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('add_to_queue')}</span>
                  </button>
                )}
                {['Admin', 'Doctor'].includes(user?.role) && (
                  <button
                    onClick={() => navigate('/queue')}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-emerald-500 text-white hover:shadow-xl hover:shadow-emerald-500/20 transition-all group",
                      user?.role === 'Doctor' && "col-span-2"
                    )}
                  >
                    <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current"/>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('call_next')}</span>
                  </button>
                )}
              </div>

          {/* Link 1: Patients */}
          <button
            onClick={() => navigate('/patients')}
            className="flex items-center gap-4 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-primary/5 hover:border-primary/30 transition-all text-right w-full group shadow-sm hover:shadow-xl"
          >
            <div className="p-3.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <Users className="w-5 h-5"/>
            </div>
            <div className={cn("flex-1", language === 'ar' ? 'text-right' : 'text-left')}>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200 block">{t('registered_patients_list')}</span>
              <span className="text-[10px] text-muted-foreground font-bold">{t('total_patient_records')}: {serverStats?.totalPatients || 0}</span>
            </div>
            {language === 'ar' ? <ArrowLeft className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" /> : <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"/>}
          </button>

          {/* Link 2: Lab */}
          <button
            onClick={() => navigate('/lab')}
            className="flex items-center gap-4 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-amber-100/30 hover:border-amber-500/30 transition-all text-right w-full group shadow-sm hover:shadow-xl"
          >
            <div className="p-3.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
              <FlaskConical className="w-5 h-5"/>
            </div>
            <div className={cn("flex-1", language === 'ar' ? 'text-right' : 'text-left')}>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200 block">{t('pending_appointments')}</span>
              <span className="text-[10px] text-muted-foreground font-bold">{serverStats?.pendingLabCount || 0} {t('pending_lab_reports_desc')}</span>
            </div>
            {language === 'ar' ? <ArrowLeft className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" /> : <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"/>}
          </button>

          {/* Link 3: Daily Report */}
          <button
            onClick={handleDownloadReport}
            disabled={reportDownloaded}
            className={cn(
              "flex items-center gap-4 p-5 rounded-[2rem] border transition-all text-right w-full group shadow-sm hover:shadow-xl",
              reportDownloaded
                ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 cursor-default"
                : "border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-emerald-50/50 hover:border-emerald-500/30"
            )}
          >
            <div className={cn(
              "p-3.5 rounded-2xl transition-all shadow-sm",
              reportDownloaded
                ? "bg-emerald-500 text-white"
                : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white"
            )}>
              {reportDownloaded ? <CheckCircle2 className="w-5 h-5" /> : <Download className="w-5 h-5" />}
            </div>
            <div className={cn("flex-1", language === 'ar' ? 'text-right' : 'text-left')}>
              <span className={cn("text-sm font-black block", reportDownloaded ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200')}>
                {reportDownloaded ? t('report_downloaded') : t('generate_daily_report')}
              </span>
              <span className="text-[10px] text-muted-foreground font-bold">
                {reportDownloaded ? t('check_downloads') : t('generate_daily_report_desc')}
              </span>
            </div>
            {!reportDownloaded && (
               language === 'ar' ? <ArrowLeft className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" /> : <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"/>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
