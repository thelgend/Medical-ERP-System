import React, { useState, useEffect } from 'react';
import { 
  X, 
  Pill, 
  Clipboard, 
  Stethoscope, 
  Info, 
  Hash,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AddDrugModal({ open, onOpenChange, onSubmit, initialData, t }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    genericName: '',
    strength: '',
    defaultDosage: '',
    instructions: '',
    sideEffects: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        category: '',
        genericName: '',
        strength: '',
        defaultDosage: '',
        instructions: '',
        sideEffects: ''
      });
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                {initialData ? t('edit') : t('add_drug')}
              </h2>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('pharmacy_desc')}</p>
            </div>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Drug Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Pill className="w-3 h-3" /> {t('drug_name')}
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Panadol"
                className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Stethoscope className="w-3 h-3" /> {t('drug_category')}
              </label>
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Analgesic, Antibiotic..."
                className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white"
              />
            </div>

            {/* Generic Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Clipboard className="w-3 h-3" /> Generic Name
              </label>
              <input
                name="genericName"
                value={formData.genericName}
                onChange={handleChange}
                placeholder="e.g. Paracetamol"
                className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white"
              />
            </div>

            {/* Strength */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-3 h-3" /> Strength
              </label>
              <input
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                placeholder="e.g. 500mg"
                className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white"
              />
            </div>

            {/* Default Dosage */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Hash className="w-3 h-3" /> Default Dosage
              </label>
              <input
                name="defaultDosage"
                value={formData.defaultDosage}
                onChange={handleChange}
                placeholder="e.g. 1x3"
                className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Info className="w-3 h-3" /> Instructions
              </label>
              <input
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="e.g. After meals"
                className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Side Effects */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              Side Effects
            </label>
            <textarea
              name="sideEffects"
              value={formData.sideEffects}
              onChange={handleChange}
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-14 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-[2] h-14 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
            >
              {initialData ? t('save_changes') : t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
