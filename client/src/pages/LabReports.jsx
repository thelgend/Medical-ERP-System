import { useState, useMemo, useEffect } from 'react';
import { 
  FlaskConical, 
  Search, 
  Plus, 
  FileUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Activity as ActivityIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AddLabOrderModal from '@/components/modals/AddLabOrderModal';
import api from '@/lib/api';
import { useNotifications } from '@/context/NotificationsContext';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';
import LabPrint from '@/components/printing/LabPrint';

export default function LabReports() {
  const { language } = useSettings();
  const t = useTranslation(language);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printingReport, setPrintingReport] = useState(null);
  const { addNotification } = useNotifications();
  const { clinicInfo } = useSettings();

  const statusConfig = {
    Completed: { label: t('completed'), color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
    Pending: { label: t('status_pending'), color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', icon: Clock },
    InProgress: { label: t('status_scheduled'), color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: ActivityIcon },
  };

  const stats = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA');
    return {
      todayCount: reports.filter(r => new Date(r.createdAt).toLocaleDateString('en-CA') === today).length,
      pendingCount: reports.filter(r => r.status === 'Pending').length,
      completedToday: reports.filter(r => r.status === 'Completed' && new Date(r.createdAt).toLocaleDateString('en-CA') === today).length,
    };
  }, [reports]);

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const status = activeTab === 'all' ? '' : activeTab;
      const response = await api.get(`/lab${status ? `?status=${status}` : ''}`);
      setReports(response.data);
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (report) => {
    setPrintingReport(report);
    setTimeout(() => {
        window.print();
        setPrintingReport(null);
    }, 500);
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => 
      (report.patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (report.testName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, reports]);

  return (
    <div className={cn("space-y-6 animate-in fade-in duration-500 pb-10", language === 'ar' ? "font-cairo" : "font-sans")} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">{t('lab_mgmt')}</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{t('lab_desc')}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t('new_lab_order')}</span>
        </button>
      </div>

      <AddLabOrderModal open={isModalOpen} onOpenChange={setIsModalOpen} t={t} />

      {/* Lab Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: language === 'ar' ? 'تحاليل اليوم' : 'Daily Tests', value: stats.todayCount, icon: FlaskConical, color: 'blue', desc: t('lab_mgmt') },
          { label: t('pending_results'), value: stats.pendingCount, icon: AlertCircle, color: 'amber', desc: t('status_pending') },
          { label: language === 'ar' ? 'تم التسليم اليوم' : 'Delivered Today', value: stats.completedToday, icon: CheckCircle2, color: 'emerald', desc: t('completed') },
        ].map((stat, i) => (
          <div key={i} className={cn("glass p-6 rounded-[2rem] border transition-all hover:scale-[1.02]", `border-${stat.color}-100 dark:border-${stat.color}-800/30`)}>
            <div className="flex items-center justify-between pointer-events-none">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <div className={cn("p-2 rounded-xl", `bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-500`)}><stat.icon className="w-5 h-5" /></div>
            </div>
            <h3 className="text-3xl font-black mt-3 tracking-tighter text-slate-900 dark:text-white">{stat.value}</h3>
            <p className={cn("text-[10px] font-bold mt-2 uppercase tracking-tighter", `text-${stat.color}-600 dark:text-${stat.color}-400`)}>{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-[2.5rem] overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-border dark:border-slate-800 flex flex-col md:flex-row md:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-[1.2rem] border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm">
            {['all', 'pending', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab ? "bg-primary text-white shadow-lg" : "hover:bg-slate-50 dark:hover:bg-slate-700 text-muted-foreground"
                )}
              >
                {tab === 'all' ? (language === 'ar' ? 'الكل' : 'All') : (tab === 'pending' ? (language === 'ar' ? 'معلقة' : 'Pending') : t('completed'))}
              </button>
            ))}
          </div>
          <div className="relative flex-1 group">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors", language === 'ar' ? "right-4" : "left-4")} />
            <input 
              type="text" 
              placeholder={language === 'ar' ? 'البحث باسم المريض أو نوع التحليل...' : 'Search patient or test...'}
              className={cn(
                "w-full h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none text-slate-900 dark:text-white font-medium",
                language === 'ar' ? "pr-12 pl-4" : "pl-12 pr-4"
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-border dark:divide-slate-800 min-h-[400px]">
          {loading ? (
             <div className="py-20 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-muted-foreground">{t('loading')}</p>
             </div>
          ) : filteredReports.length > 0 ? filteredReports.map((report) => {
            const config = statusConfig[report.status] || statusConfig.Pending;
            return (
              <div key={report._id} className="p-6 hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={cn("p-4 rounded-2xl shrink-0 group-hover:scale-110 transition-transform shadow-sm border border-border dark:border-slate-800", config.color)}>
                    <FlaskConical className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors text-lg">{report.testName}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="font-bold text-slate-700 dark:text-slate-400">{report.patient?.name || t('no_data')}</span>
                      <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                      <span className="font-medium">{t('doctor')}: {report.doctor?.name || t('no_data')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className={cn("text-right", language === 'ar' ? "text-right" : "text-left")}>
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">{t('date')}</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-400">{new Date(report.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                  </div>
                  <div className={cn("px-4 py-1.5 rounded-[1.2rem] flex items-center gap-2 shadow-sm border border-border dark:border-slate-800", config.color)}>
                    <config.icon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.status === 'Completed' ? (
                      <>
                        <button 
                          onClick={() => handlePrint(report)}
                          className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
                        >
                          <Printer className="w-5 h-5 text-slate-500" />
                        </button>
                        <button 
                          onClick={() => report.filePath && window.open(`http://localhost:5000/${report.filePath}`)}
                          className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all text-slate-500"
                          title={t('view') || 'View'}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => addNotification({ type: 'info', title: t('upload_result'), body: t('processing') })}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2 border border-primary/20 hover:-translate-y-0.5 active:scale-95"
                      >
                        <FileUp className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">{t('upload_result')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-32 text-center opacity-30">
               <FlaskConical className="w-16 h-16" />
               <p className="font-extrabold mt-4">{t('no_data')}</p>
            </div>
          )}
        </div>
      </div>
      {/* Hidden Print Container */}
      <div className="hidden print:block fixed inset-0 z-[1000] bg-white">
        <LabPrint 
            report={printingReport} 
            patient={printingReport?.patient}
            clinicInfo={clinicInfo}
            language={language}
            t={t}
        />
      </div>
    </div>
  );
}
