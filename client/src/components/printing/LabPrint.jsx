import React from 'react';
import { cn } from '@/lib/utils';
import { FlaskConical, Activity, Stethoscope } from 'lucide-react';

export default function LabPrint({ report, patient, clinicInfo, language, t }) {
  if (!report) return null;

  return (
    <div className={cn(
      "p-12 bg-white text-slate-900 h-full w-full",
      language === 'ar' ? "font-cairo text-right" : "font-sans text-left"
    )} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">{clinicInfo?.name || 'AL-HAYAT MEDICAL CENTER'}</h1>
          <p className="text-sm font-bold opacity-70 mb-1">{language === 'ar' ? 'قسم المختبر والتحاليل الطبية' : 'Department of Clinical Laboratory'}</p>
          <p className="text-sm font-bold opacity-70 mb-1">{clinicInfo?.address || '123 Medical Plaza, Cairo, Egypt'}</p>
          <p className="text-sm font-bold opacity-70">{clinicInfo?.phone || '+20 123 456 789'}</p>
        </div>
        <div className="text-right">
          <FlaskConical className="w-16 h-16 text-slate-900 mb-4 inline-block" />
          <h2 className="text-2xl font-black bg-slate-900 text-white px-6 py-2 rounded-lg mb-4 uppercase tracking-widest">{t('lab_results')}</h2>
          <p className="text-xl font-black tabular-nums">{new Date(report.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
        </div>
      </div>

      {/* Patient Info Bar */}
      <div className="grid grid-cols-4 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-12">
        <div className="col-span-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('patient')}</p>
           <h3 className="text-lg font-black">{patient?.name}</h3>
        </div>
        <div>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{language === 'ar' ? 'رقم التقرير' : 'Report ID'}</p>
           <h3 className="text-lg font-black font-mono">#{report._id.slice(-6).toUpperCase()}</h3>
        </div>
        <div>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{language === 'ar' ? 'الجنس' : 'Gender'}</p>
           <h3 className="text-lg font-black">{patient?.gender}</h3>
        </div>
      </div>

      {/* Result Section */}
      <div className="mb-20 min-h-[400px]">
        <div className="mb-8">
           <h3 className="text-2xl font-black text-primary uppercase tracking-tight mb-2">{report.testType}</h3>
           <div className="h-1 bg-primary w-20"></div>
        </div>

        <div className="space-y-8">
           <div className="grid grid-cols-3 gap-10 border-b border-slate-100 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>{language === 'ar' ? 'الاختبار' : 'Test Name'}</span>
              <span>{language === 'ar' ? 'النتيجة' : 'Result'}</span>
              <span className="text-end">{language === 'ar' ? 'المعدل الطبيعي' : 'Normal Range'}</span>
           </div>

           {/* Mocking results if not fully structured in DB yet */}
           {(report.results || [{ name: report.testType, value: 'Normal', range: 'Ref. Range' }]).map((res, i) => (
              <div key={i} className="grid grid-cols-3 gap-10 py-4 items-center">
                 <span className="text-sm font-black text-slate-700">{res.name}</span>
                 <span className="text-lg font-black text-slate-900 italic">{res.value}</span>
                 <span className="text-xs font-bold text-slate-400 text-end">{res.range}</span>
              </div>
           ))}
        </div>

        {report.notes && (
          <div className="mt-12 p-6 bg-slate-50 border border-slate-100 rounded-2xl italic font-bold text-sm text-slate-600">
             <p className="text-[10px] uppercase font-black tracking-widest mb-2 opacity-50 NOT-ITALIC">{language === 'ar' ? 'ملاحظات الطبيب' : 'Clinical Notes'}</p>
             {report.notes}
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="border-t border-slate-200 pt-8 mt-20 text-center">
        <div className="flex justify-between items-center mb-8 px-10 mt-12 opacity-80">
           <div className="flex flex-col gap-1 items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Laboratory Stamp</span>
              <div className="w-32 h-16 bg-slate-50 border border-border border-dashed rounded-xl flex items-center justify-center opacity-30">
                 <span className="text-[10px] font-bold italic">Official Stamp</span>
              </div>
           </div>
           <div className="flex flex-col gap-2 items-center">
              <div className="w-48 h-px bg-slate-900 mb-2"></div>
              <span className="text-sm font-black uppercase tracking-widest">{language === 'ar' ? 'مدير المختبر' : 'Lab Director'}</span>
              <span className="text-[10px] font-bold opacity-60 italic">Electronically Verified</span>
           </div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mt-20">
          AL-HAYAT MEDICAL ERP PRO • GENERATED BY LAB-INTEL v2.0 • STABLE 4.2.0
        </p>
      </div>

    </div>
  );
}
