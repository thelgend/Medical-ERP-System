import React from 'react';
import { cn } from '@/lib/utils';
import { Pill, Activity, Stethoscope } from 'lucide-react';

export default function PrescriptionPrint({ prescription, patient, doctor, clinicInfo, language, t }) {
  if (!prescription) return null;

  return (
    <div className={cn(
      "p-12 bg-white text-slate-900 h-full w-full",
      language === 'ar' ? "font-cairo text-right" : "font-sans text-left"
    )} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">{clinicInfo?.name || 'AL-HAYAT MEDICAL CENTER'}</h1>
          <p className="text-sm font-bold opacity-70 mb-1">{doctor?.specialization || 'Clinical Specialist'}</p>
          <p className="text-sm font-bold opacity-70 mb-1">{clinicInfo?.address || '123 Medical Plaza, Cairo, Egypt'}</p>
          <p className="text-sm font-bold opacity-70">{clinicInfo?.phone || '+20 123 456 789'}</p>
        </div>
        <div className="text-right">
          <Stethoscope className="w-16 h-16 text-slate-900 mb-4 inline-block" />
          <h2 className="text-2xl font-black bg-slate-900 text-white px-6 py-2 rounded-lg mb-4 uppercase tracking-widest">{t('prescription')}</h2>
          <p className="text-xl font-black tabular-nums">{new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
        </div>
      </div>

      {/* Patient Info Bar */}
      <div className="grid grid-cols-4 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-12">
        <div className="col-span-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('patient')}</p>
           <h3 className="text-lg font-black">{patient?.name}</h3>
        </div>
        <div>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{language === 'ar' ? 'العمر' : 'Age'}</p>
           <h3 className="text-lg font-black">{patient?.age}</h3>
        </div>
        <div>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{language === 'ar' ? 'الجنس' : 'Gender'}</p>
           <h3 className="text-lg font-black">{patient?.gender}</h3>
        </div>
      </div>

      {/* RX Section */}
      <div className="mb-20 min-h-[400px]">
        <div className="flex items-center gap-4 mb-10">
           <span className="text-8xl font-black text-slate-900 leading-none italic opacity-30 select-none">Rx</span>
           <div className="flex-1 h-px bg-slate-200 mt-10"></div>
        </div>

        <div className="space-y-10 pr-10">
           {prescription.medicines?.map((med, i) => (
             <div key={i} className="flex flex-col gap-2 relative">
                <div className="flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-slate-900" />
                   <h4 className="text-2xl font-black tracking-tight">{med.name} <span className="text-slate-400 font-bold ml-2">{med.strength}</span></h4>
                </div>
                <div className="flex items-center gap-8 pl-6 opacity-70">
                   <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-black uppercase tracking-widest">{med.dosage}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      <span className="text-sm font-black uppercase tracking-widest">{med.duration} Days</span>
                   </div>
                </div>
                {med.instructions && (
                  <p className="pl-6 text-sm font-bold italic opacity-60 mt-1">Note: {med.instructions}</p>
                )}
             </div>
           ))}
           {(!prescription.medicines || prescription.medicines.length === 0) && (
              <p className="text-slate-300 italic p-10 font-bold uppercase tracking-widest">No medicine prescribed</p>
           )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="border-t border-slate-200 pt-8 mt-20 text-center">
        <div className="flex justify-between items-center mb-8 px-10 mt-12 opacity-80">
           <div className="flex flex-col gap-1 items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinic Verified</span>
              <div className="w-32 h-16 bg-slate-50 border border-border border-dashed rounded-xl flex items-center justify-center opacity-30">
                 <span className="text-[10px] font-bold italic">Official Stamp</span>
              </div>
           </div>
           <div className="flex flex-col gap-2 items-center">
              <div className="w-48 h-px bg-slate-900 mb-2"></div>
              <span className="text-sm font-black uppercase tracking-widest">{doctor?.name}</span>
              <span className="text-[10px] font-bold opacity-60">Digital Signature Attached</span>
           </div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mt-20">
          AL-HAYAT MEDICAL ERP PRO • GENERATED BY Dr. {doctor?.name?.toUpperCase()} • STABLE 4.2.0
        </p>
      </div>

    </div>
  );
}
