import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { 
  User, 
  Phone, 
  MapPin, 
  Activity, 
  Calendar, 
  X, 
  Clock, 
  History,
  TrendingUp,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PatientDetailsModal({ open, onOpenChange, patient, t }) {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)]">
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-primary to-indigo-600 dark:from-indigo-950 dark:to-slate-900"></div>
          <button 
            onClick={() => onOpenChange(false)} 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition-all text-white border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="px-8 pb-8 -mt-12">
            <div className="flex flex-col md:flex-row gap-6 items-end mb-8">
              <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-800 p-1 shadow-2xl">
                <div className="w-full h-full rounded-[1.2rem] bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {patient.name[0]}
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{patient.name}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{patient.patientID || 'PID-0000'}</span>
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border",
                    patient.status === 'نشط' || patient.status === 'Active' 
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800" 
                      : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800"
                  )}>{patient.status}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
               {[
                 { label: t('age_group') || 'Age', value: `${patient.age} ${t('years_old')}`, icon: Calendar, color: 'blue' },
                 { label: t('gender'), value: patient.gender, icon: User, color: 'indigo' },
                 { label: t('blood_type'), value: patient.bloodGroup || '-', icon: Activity, color: 'red' },
                 { label: t('phone'), value: patient.phone, icon: Phone, color: 'emerald' },
               ].map((info, i) => (
                 <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{info.label}</p>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">{info.value}</p>
                 </div>
               ))}
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <History className="w-5 h-5 text-primary" />
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{t('last_visit') || 'Recent History'}</h3>
              </div>

              <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Clock className="w-4 h-4 text-emerald-500" />
                       <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : (t('no_data') || 'No visits recorded')}</span>
                    </div>
                 </div>
                 
                 <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 dark:border-primary/20">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{t('appointments_mgmt') || 'Notes'}</p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      {patient.notes || (t('no_data') || 'No special clinical notes available for this patient profilr.')}
                    </p>
                 </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
               <button 
                onClick={() => onOpenChange(false)}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
               >
                 {t('cancel') || 'Close'}
               </button>
               <button 
                className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
               >
                 <FileText className="w-4 h-4" />
                 <span>{language === 'ar' ? 'عرض الملف الكامل' : 'View Full File'}</span>
               </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
