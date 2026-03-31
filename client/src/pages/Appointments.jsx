import { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Filter,
  Stethoscope,
  ChevronRight,
  ChevronLeft,
  Search,
  Trash2,
  CheckCircle2,
  Activity,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AddAppointmentModal from '@/components/modals/AddAppointmentModal';
import api from '@/lib/api';
import { useNotifications } from '@/context/NotificationsContext';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';

export default function Appointments() {
  const { language } = useSettings();
  const t = useTranslation(language);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      addNotification({ type: 'info', title: t('success'), body: t('success') });
      fetchAppointments();
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    }
  };

  const handleCancel = async (id) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من إلغاء هذا الموعد؟' : 'Are you sure you want to cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      addNotification({ type: 'alert', title: t('success'), body: t('cancelled') });
      fetchAppointments();
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => 
      (apt.patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (apt.doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, appointments]);

  const statusStyles = {
    'Scheduled': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'Completed': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'Cancelled': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    'In Progress': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  };

  const statusLabels = {
    'Scheduled': t('status_scheduled'),
    'Completed': t('status_completed'),
    'Cancelled': t('status_cancelled'),
    'In Progress': t('status_pending'),
  };

  return (
    <div className={cn("space-y-6 animate-in fade-in duration-500 pb-10", language === 'ar' ? "font-cairo" : "font-sans")} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">{t('appointments_mgmt')}</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{t('appointments_desc')}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t('new_appointment')}</span>
        </button>
      </div>

      {/* Appointment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: t('appointments'), value: appointments.length, icon: CalendarIcon, color: 'blue' },
            { label: t('status_pending'), value: appointments.filter(a => a.status === 'In Progress').length, icon: Clock, color: 'amber' },
            { label: t('status_completed'), value: appointments.filter(a => a.status === 'Completed').length, icon: CheckCircle2, color: 'emerald' },
            { label: t('status_cancelled'), value: appointments.filter(a => a.status === 'Cancelled').length, icon: Trash2, color: 'red' },
          ].map((stat, i) => (
           <div key={i} className={cn("glass p-5 rounded-2xl flex items-center gap-4 border", `border-${stat.color}-200 dark:border-${stat.color}-800`)}>
              <div className={cn("p-3 rounded-xl", `bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`)}><stat.icon className="w-5 h-5"/></div>
              <div>
                 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">{stat.label}</p>
                 <h4 className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</h4>
              </div>
           </div>
         ))}
      </div>

      <div className="glass rounded-[2rem] overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        {/* Header */}
        <div className="p-4 border-b border-border dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4 flex-1">
            <h3 className="font-bold text-lg whitespace-nowrap text-slate-800 dark:text-white">{t('today_appointments')}</h3>
            <div className="relative max-w-xs w-full group">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors", language === 'ar' ? "right-3" : "left-3")} />
              <input 
                type="text" 
                placeholder={language === 'ar' ? 'بحث مريض أو طبيب...' : 'Search patient or doctor...'}
                className={cn(
                  "w-full h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-4 focus:ring-primary/10 transition-all outline-none text-slate-900 dark:text-white font-medium",
                  language === 'ar' ? "pr-10 pl-4" : "pl-10 pr-4"
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button className="h-10 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm text-slate-700 dark:text-slate-300">
                <Filter className="w-4 h-4" />
                <span>{language === 'ar' ? 'جميع الأطباء' : 'All Doctors'}</span>
             </button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="py-20 flex flex-col items-center gap-4">
               <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
               <p className="text-xs font-bold text-muted-foreground">{t('loading')}</p>
             </div>
          ) : (
          <table className={cn("w-full border-collapse", language === 'ar' ? "text-right" : "text-left")}>
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border dark:border-slate-800">
                <th className="px-6 py-4">{t('patient')}</th>
                <th className="px-6 py-4">{t('doctor')}</th>
                <th className="px-6 py-4">{t('time')}</th>
                <th className="px-6 py-4">{language === 'ar' ? 'النوع' : 'Type'}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className={cn("px-6 py-4", language === 'ar' ? "text-left" : "text-right")}>{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-800">
              {filteredAppointments.length > 0 ? filteredAppointments.map((apt) => (
                <tr key={apt._id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-100 dark:border-blue-800 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                         {(apt.patient?.name || 'P')[0]}
                       </div>
                       <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">{apt.patient?.name || (language === 'ar' ? 'مريض غير مسجل' : 'Unregistered')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-400">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><Stethoscope className="w-3.5 h-3.5 text-primary" /></div>
                      <span>{apt.doctor?.name || t('doctor')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span dir="ltr">{apt.slot}</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/60">{new Date(apt.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-bold">
                    {apt.visitType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight border",
                      statusStyles[apt.status]
                    )}>
                      {statusLabels[apt.status] || apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={cn("flex gap-2", language === 'ar' ? "justify-end" : "justify-end")}>
                       {apt.status === 'Scheduled' && (
                         <button 
                           onClick={() => handleStatusUpdate(apt._id, 'In Progress')}
                           className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-900/30 font-black text-[9px] uppercase tracking-widest hover:bg-amber-100 transition-all"
                         >
                           {language === 'ar' ? 'بدء' : 'Start'}
                         </button>
                       )}
                       {apt.status === 'In Progress' && (
                         <button 
                           onClick={() => handleStatusUpdate(apt._id, 'Completed')}
                           className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/30 font-black text-[9px] uppercase tracking-widest hover:bg-emerald-100 transition-all"
                         >
                            {language === 'ar' ? 'إكمال' : 'Finish'}
                         </button>
                       )}
                       {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                         <button 
                           onClick={() => handleCancel(apt._id)}
                           className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-800"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                       <Activity className="w-12 h-12" />
                       <h4 className="text-lg font-bold">{t('no_data')}</h4>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      <AddAppointmentModal open={isModalOpen} onOpenChange={setIsModalOpen} fetchAppointments={fetchAppointments} />
    </div>
  );
}
