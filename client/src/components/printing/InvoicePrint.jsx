import React from 'react';
import { cn } from '@/lib/utils';
import { Pill, Activity, Stethoscope } from 'lucide-react';

export default function InvoicePrint({ bill, clinicInfo, language, t }) {
  if (!bill) return null;

  return (
    <div className={cn(
      "p-12 bg-white text-slate-900 h-full w-full",
      language === 'ar' ? "font-cairo text-right" : "font-sans text-left"
    )} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">{clinicInfo?.name || 'AL-HAYAT MEDICAL CENTER'}</h1>
          <p className="text-sm font-bold opacity-70 mb-1">{clinicInfo?.address || '123 Medical Plaza, Cairo, Egypt'}</p>
          <p className="text-sm font-bold opacity-70">{clinicInfo?.phone || '+20 123 456 789'}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-black bg-slate-900 text-white px-6 py-2 rounded-lg mb-4 uppercase tracking-widest">{t('billing')}</h2>
          <p className="text-sm font-bold uppercase tracking-widest opacity-60 italic">{language === 'ar' ? 'رقم الفاتورة' : 'Invoice Number'}</p>
          <p className="text-xl font-black tabular-nums">#{bill._id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      {/* Patient & Date Info */}
      <div className="grid grid-cols-2 gap-10 mb-12">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('patient')}</p>
           <h3 className="text-xl font-black">{bill.patient?.name}</h3>
           <p className="text-sm font-bold opacity-70 mt-1">{bill.patient?.phone}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('date')}</p>
           <h3 className="text-xl font-black">{new Date(bill.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</h3>
           <p className="text-sm font-bold opacity-70 mt-1">{new Date(bill.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase tracking-widest">
              <th className="py-4 text-start">{language === 'ar' ? 'الوصف' : 'Description'}</th>
              <th className="py-4 text-end px-4">{language === 'ar' ? 'الكمية' : 'Qty'}</th>
              <th className="py-4 text-end px-4">{language === 'ar' ? 'سعر الوحدة' : 'Unit Price'}</th>
              <th className="py-4 text-end">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(bill.items || [{ description: 'Medical Consultation', quantity: 1, price: bill.payableAmount }]).map((item, i) => (
              <tr key={i} className="text-sm">
                <td className="py-6 font-bold">{item.description}</td>
                <td className="py-6 text-end px-4 font-black">{item.quantity}</td>
                <td className="py-6 text-end px-4 font-black">{item.price?.toLocaleString()}</td>
                <td className="py-6 text-end font-black">{ (item.price * item.quantity).toLocaleString() } EGP</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-20">
        <div className="w-1/3 space-y-4">
           <div className="flex justify-between items-center text-sm font-bold opacity-60">
              <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span>{bill.payableAmount.toLocaleString()} EGP</span>
           </div>
           <div className="flex justify-between items-center text-sm font-bold opacity-60">
              <span>{t('tax_amount')} (0%)</span>
              <span>0.00 EGP</span>
           </div>
           <div className="h-px bg-slate-900 my-4"></div>
           <div className="flex justify-between items-center text-2xl font-black">
              <span>{t('total')}</span>
              <span className="italic">{bill.payableAmount.toLocaleString()} EGP</span>
           </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="border-t border-slate-200 pt-8 mt-20 text-center">
        <div className="flex justify-center gap-20 mb-8 mt-12 opacity-50 italic font-bold text-xs">
           <div className="flex flex-col gap-2">
              <div className="w-24 h-px bg-slate-900 mx-auto mb-2"></div>
              <span>{language === 'ar' ? 'توقيع العيادة' : 'Clinic Signature'}</span>
           </div>
           <div className="flex flex-col gap-2">
              <div className="w-24 h-px bg-slate-900 mx-auto mb-2"></div>
              <span>{language === 'ar' ? 'توقيع المريض' : 'Patient Signature'}</span>
           </div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mt-20">
          AL-HAYAT MEDICAL ERP PRO • GENERATED ON {new Date().toISOString()} • STABLE 4.2.0
        </p>
      </div>

    </div>
  );
}
