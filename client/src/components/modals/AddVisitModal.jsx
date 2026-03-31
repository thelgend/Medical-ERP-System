import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, Thermometer, Activity, Weight, Ruler, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';

export default function AddVisitModal({ open, onOpenChange, patientId, onSuccess }) {
  const { language } = useSettings();
  const t = useTranslation(language);

  const [loading, setLoading] = useState(false);
  const [drugs, setDrugs] = useState([]);
  const [drugSearch, setDrugSearch] = useState('');
  const [showDrugDropdown, setShowDrugDropdown] = useState(false);

  const [formData, setFormData] = useState({
    patient: patientId,
    chiefComplaint: '',
    diagnosis: '',
    vitals: {
      bloodPressure: '',
      temperature: '',
      pulse: '',
      spO2: '',
      weight: '',
      height: ''
    },
    prescription: []
  });

  useEffect(() => {
    if (drugSearch.length > 1) {
      const delayDebounce = setTimeout(async () => {
        try {
          const res = await api.get(`/api/drugs?search=${drugSearch}`);
          setDrugs(res.data);
          setShowDrugDropdown(true);
        } catch (err) {
          console.error('Drug search failed', err);
        }
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setShowDrugDropdown(false);
    }
  }, [drugSearch]);

  const addDrug = (drug) => {
    setFormData({
      ...formData,
      prescription: [
        ...formData.prescription,
        { medicineName: drug.name, dosage: drug.defaultDosage || '', duration: '', notes: drug.instructions || '' }
      ]
    });
    setDrugSearch('');
    setShowDrugDropdown(false);
  };

  const removeDrug = (index) => {
    const updated = [...formData.prescription];
    updated.splice(index, 1);
    setFormData({ ...formData, prescription: updated });
  };

  const updateDrug = (index, field, value) => {
    const updated = [...formData.prescription];
    updated[index][field] = value;
    setFormData({ ...formData, prescription: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/visits', formData);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Save visit failed', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900">{language === 'ar' ? 'سجل زيارة جديدة' : 'New Medical Visit'}</h2>
          <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Vitals & Complaint */}
            <div className="space-y-6">
              <div className="space-y-4">
                 <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Thermometer className="w-4 h-4 text-primary" /> {language === 'ar' ? 'المؤشرات الحيوية' : 'Vitals'}
                 </h3>
                 <div className="grid grid-cols-3 gap-3">
                   {['bloodPressure', 'temperature', 'pulse', 'spO2', 'weight', 'height'].map(v => (
                     <div key={v} className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 uppercase pr-1 italic">{v}</label>
                       <input 
                         type="text" 
                         className="w-full h-10 px-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                         value={formData.vitals[v]}
                         onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, [v]: e.target.value}})}
                       />
                     </div>
                   ))}
                 </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">{language === 'ar' ? 'التشخيص الطبي' : 'Diagnosis'}</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase italic">{language === 'ar' ? 'الشكوى الرئيسية' : 'Chief Complaint'}</label>
                    <textarea 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                      value={formData.chiefComplaint}
                      onChange={(e) => setFormData({...formData, chiefComplaint: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase italic">{language === 'ar' ? 'التشخيص النهائي' : 'Final Diagnosis'}</label>
                    <textarea 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Prescription */}
            <div className="space-y-4 flex flex-col h-full">
               <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Activity className="w-4 h-4 text-emerald-500" /> {language === 'ar' ? 'الروشتة الإلكترونية (Rₓ)' : 'E-Prescription (Rₓ)'}
               </h3>
               
               <div className="relative">
                 <div className="relative">
                   <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                     type="text" 
                     placeholder={language === 'ar' ? 'ابحث عن دواء...' : 'Search medicine...'}
                     className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                     value={drugSearch}
                     onChange={(e) => setDrugSearch(e.target.value)}
                   />
                 </div>

                 {showDrugDropdown && (
                   <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                     {drugs.length > 0 ? drugs.map(drug => (
                       <button
                         key={drug._id}
                         type="button"
                         onClick={() => addDrug(drug)}
                         className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-all text-right border-b border-slate-50 last:border-0"
                       >
                         <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                           <Activity className="w-4 h-4" />
                         </div>
                         <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800">{drug.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{drug.category} | {drug.strength}</p>
                         </div>
                       </button>
                     )) : (
                       <button
                         type="button"
                         onClick={() => addDrug({ name: drugSearch, defaultDosage: '', instructions: '' })}
                         className="w-full p-4 text-xs font-bold text-primary hover:bg-slate-50 text-center"
                       >
                         {language === 'ar' ? `إضافة "${drugSearch}" كدواء جديد` : `Add "${drugSearch}" as manual entry`}
                       </button>
                     )}
                   </div>
                 )}
               </div>

               <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                 {formData.prescription.map((rx, idx) => (
                   <div key={idx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3 animate-in fade-in duration-300">
                     <div className="flex items-center justify-between">
                       <span className="text-sm font-black text-slate-900">{rx.medicineName}</span>
                       <button onClick={() => removeDrug(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder={language === 'ar' ? 'الجرعة (مثلاً 1x3)' : 'Dosage (e.g. 1x3)'}
                          className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-primary/50"
                          value={rx.dosage}
                          onChange={(e) => updateDrug(idx, 'dosage', e.target.value)}
                        />
                        <input 
                          placeholder={language === 'ar' ? 'المدة' : 'Duration'}
                          className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-primary/50"
                          value={rx.duration}
                          onChange={(e) => updateDrug(idx, 'duration', e.target.value)}
                        />
                        <input 
                          placeholder={language === 'ar' ? 'ملاحظات إضافية' : 'Additional instructions'}
                          className="col-span-2 h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-primary/50"
                          value={rx.notes}
                          onChange={(e) => updateDrug(idx, 'notes', e.target.value)}
                        />
                     </div>
                   </div>
                 ))}
                 {formData.prescription.length === 0 && (
                   <div className="h-40 flex flex-col items-center justify-center text-slate-300 opacity-50 space-y-2">
                     <Activity className="w-8 h-8" />
                     <p className="text-[10px] font-bold uppercase">{language === 'ar' ? 'لم يتم إضافة أدوية' : 'No drugs added yet'}</p>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button onClick={() => onOpenChange(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-white transition-all">
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || !formData.chiefComplaint}
            className="px-10 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-50"
          >
            {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ وإهاء الزيارة' : 'Save & Complete Visit')}
          </button>
        </div>
      </div>
    </div>
  );
}
