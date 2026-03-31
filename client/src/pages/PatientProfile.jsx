import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Activity, 
  FileText, 
  FlaskConical, 
  CreditCard, 
  Clock, 
  Download, 
  Printer, 
  Plus,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';
import { useNotifications } from '@/context/NotificationsContext';
import AddVisitModal from '@/components/modals/AddVisitModal';
import PrescriptionPrint from '@/components/printing/PrescriptionPrint';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useSettings();
  const t = useTranslation(language);
  const { addNotification } = useNotifications();

  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [printingRx, setPrintingRx] = useState(null);
  const { clinicInfo } = useSettings();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientRes, historyRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get(`/patients/${id}/history`)
      ]);
      setPatient(patientRes.data);
      setTimeline(historyRes.data);
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPrescription = (visit) => {
    setPrintingRx(visit);
    setTimeout(() => {
        window.print();
        setPrintingRx(null);
    }, 500);
  };

  if (loading) return (
    <div className={cn("p-20 text-center animate-pulse text-muted-foreground font-black uppercase tracking-widest", language === 'ar' ? "font-cairo" : "font-sans")}>
      {t('loading')}
    </div>
  );

  if (!patient) return <div className="p-20 text-center font-bold">Patient Not Found</div>;

  return (
    <div className={cn("space-y-8 animate-in fade-in duration-500 pb-20", language === 'ar' ? "font-cairo" : "font-sans")} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header / Back Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/patients')}
          className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <ArrowLeft className={cn("w-6 h-6 text-slate-600 dark:text-slate-400", language === 'ar' && "rotate-180")} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{patient.name}</h1>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{patient.patientID}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsVisitModalOpen(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            <span>{t('new_visit')}</span>
          </button>
        </div>
      </div>

      <AddVisitModal 
        open={isVisitModalOpen} 
        onOpenChange={setIsVisitModalOpen} 
        patientId={id}
        onSuccess={fetchData}
        t={t}
      />

      {/* Patient Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: t('blood_type'), value: patient.bloodType || '-', icon: Activity, color: 'blue' },
          { label: language === 'ar' ? 'العمر' : 'Age', value: `${patient.age} ${t('years_old')}`, icon: User, color: 'emerald' },
          { label: t('phone'), value: patient.phone, icon: Phone, color: 'amber', mono: true },
          { label: language === 'ar' ? 'العنوان' : 'Address', value: patient.address || '-', icon: MapPin, color: 'slate', small: true },
        ].map((info, i) => (
          <div key={i} className={cn("glass p-5 rounded-[2rem] border flex items-center gap-4 transition-all hover:scale-[1.02]", `border-${info.color}-100/50 dark:border-${info.color}-800/30`)}>
            <div className={cn("p-4 rounded-2xl shadow-sm", `bg-${info.color}-50 dark:bg-${info.color}-900/20 text-${info.color}-600 dark:text-${info.color}-400`)}>
              <info.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{info.label}</p>
              <p className={cn("font-black text-slate-900 dark:text-white tracking-tight", info.small ? "text-xs" : "text-xl", info.mono && "font-mono")}>{info.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black flex items-center gap-3 text-slate-800 dark:text-slate-100 uppercase tracking-tight">
            <Clock className="w-6 h-6 text-primary" />
            {t('clinical_timeline')}
          </h2>

          <div className={cn("relative space-y-12 pb-10", language === 'ar' ? "border-r-2 border-slate-200 dark:border-slate-800 pr-8" : "border-l-2 border-slate-200 dark:border-slate-800 pl-8")}>
            {timeline.length > 0 ? timeline.map((item, idx) => (
              <div key={item.id} className="relative animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                {/* Timeline Dot */}
                <div className={cn(
                  "absolute w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 shadow-lg ring-2 z-10",
                  language === 'ar' ? "-right-[11px]" : "-left-[11px]",
                  item.type === 'visit' ? "ring-blue-500 bg-blue-500" :
                  item.type === 'lab' ? "ring-emerald-500 bg-emerald-500" : "ring-amber-500 bg-amber-500"
                )}></div>

                <div className="glass p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-2xl transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                          "text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border shadow-sm",
                          item.type === 'visit' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800" :
                          item.type === 'lab' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800"
                        )}>{item.type}</span>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{item.title}</h3>
                      </div>
                      <p className="text-xs font-bold text-primary opacity-80">{item.subtitle}</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
                      <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Item Specific Content */}
                  <div className="space-y-6">
                    {item.type === 'visit' && (
                      <>
                        <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
                          <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-widest shadow-sm inline-block px-2 py-0.5 bg-white dark:bg-slate-800 rounded-lg">{language === 'ar' ? 'التشخيص' : 'Diagnosis'}</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{item.diagnosis || (t('no_data'))}</p>
                        </div>
                        
                        {item.prescription?.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('prescription')}</p>
                              <button 
                                onClick={() => handlePrintPrescription(item)}
                                className="text-[10px] font-black text-primary flex items-center gap-2 hover:underline bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 transition-all uppercase tracking-widest"
                              >
                                <Printer className="w-3.5 h-3.5" /> {t('print')}
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {item.prescription.map((rx, rIdx) => (
                                <div key={rIdx} className="flex flex-col p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:border-primary/20 transition-all group/rx">
                                  <span className="text-sm font-black text-slate-900 dark:text-white group-hover/rx:text-primary transition-colors">{rx.medicineName}</span>
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mt-1">{rx.dosage} • {rx.duration}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {item.type === 'lab' && (
                      <div className="flex items-center justify-between p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-800">
                             <FlaskConical className="w-6 h-6 text-emerald-600" />
                          </div>
                          <p className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">{item.content}</p>
                        </div>
                        <button className="p-3 bg-white dark:bg-slate-800 rounded-xl text-emerald-600 hover:bg-emerald-50 shadow-sm border border-emerald-100 dark:border-emerald-800 transition-all active:scale-95">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {item.type === 'billing' && (
                      <div className="flex items-center justify-between p-5 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100/50 dark:border-amber-800/30">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-amber-100 dark:border-amber-800">
                             <CreditCard className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">{item.content}</p>
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mt-1 bg-white/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-lg inline-block">{language === 'ar' ? 'إجمالي الفاتورة: ' : 'Total: '}{item.total} <span className="text-[8px]">{language === 'ar' ? 'ج.م' : 'EGP'}</span></p>
                          </div>
                        </div>
                        <button className="p-3 bg-white dark:bg-slate-800 rounded-xl text-amber-600 hover:bg-amber-50 shadow-sm border border-amber-100 dark:border-amber-800 transition-all active:scale-95">
                          <FileText className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="h-80 flex flex-col items-center justify-center text-muted-foreground opacity-20 pointer-events-none">
                <Activity className="w-16 h-16 mb-6" />
                <p className="font-black text-xl uppercase tracking-[0.2em]">{t('no_data')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (Right col) */}
        <div className="space-y-6">
           {/* Files section */}
           <div className="glass p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
             <h3 className="text-xs font-black text-slate-900 dark:text-white mb-6 flex items-center justify-between uppercase tracking-widest">
               <span>{language === 'ar' ? 'الملفات الطبية' : 'Medical Files'}</span>
               <button className="text-[10px] text-primary hover:underline">{language === 'ar' ? 'رفع ملف' : 'Upload'}</button>
             </h3>
             <div className="space-y-3">
               {patient.medicalFiles?.length > 0 ? patient.medicalFiles.map((file, fIdx) => (
                 <div key={fIdx} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/30 transition-all cursor-pointer group/file shadow-sm">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl group-hover/file:bg-primary/5 transition-colors">
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{file.fileName}</p>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1">{file.fileType}</p>
                    </div>
                    <Download className="w-4 h-4 text-slate-300 group-hover/file:text-primary transition-colors" />
                 </div>
               )) : (
                 <div className="text-center py-8 opacity-30">
                    <FileText className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">{language === 'ar' ? 'لا يوجد ملفات' : 'No files'}</p>
                 </div>
               )}
             </div>
           </div>

           {/* Health Alerts */}
           <div className="glass p-8 rounded-[2.5rem] border border-red-100/50 dark:border-red-900/20 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
             <h3 className="text-xs font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
               <ShieldAlert className="w-4 h-4 text-red-500" />
               {language === 'ar' ? 'ملاحظات هامة' : 'Important Alerts'}
             </h3>
             <div className="p-5 bg-red-50/50 dark:bg-red-900/10 text-red-700 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-inner">
               <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">{language === 'ar' ? 'تنبيه صحي' : 'Clinical Alerts'}</p>
               <p className="text-xs font-bold leading-relaxed">{patient.notes || (language === 'ar' ? 'لا توجد ملاحظات خاصة' : 'No special notes recorded')}</p>
             </div>
           </div>
        </div>
      </div>

      {/* Hidden Print Container */}
      <div className="hidden print:block fixed inset-0 z-[1000] bg-white">
        <PrescriptionPrint 
            prescription={{ medicines: (printingRx?.prescription || []).map(p => ({ name: p.medicineName, strength: '', dosage: p.dosage, duration: p.duration, instructions: p.notes })) }}
            patient={patient}
            doctor={{ name: printingRx?.subtitle || 'Consultant' }}
            clinicInfo={clinicInfo}
            language={language}
            t={t}
        />
      </div>
    </div>
  );
}
