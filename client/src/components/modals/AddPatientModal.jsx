import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { User, Phone, MapPin, Activity, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AddPatientModal({ open, onOpenChange, onSubmit, initialData = null, t }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'ذكر',
    phone: '',
    address: '',
    bloodGroup: 'O+',
    status: 'نشط',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        age: '',
        gender: 'ذكر',
        phone: '',
        address: '',
        bloodGroup: 'O+',
        status: 'نشط',
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="p-8 space-y-6">
          <DialogHeader className="relative">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {initialData ? t('edit') || 'Edit' : t('add_patient')}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {initialData ? (t('save_changes') || 'Update patient info') : (t('add_patient') || 'Register new patient')}
            </DialogDescription>
             <button onClick={() => onOpenChange(false)} className="absolute -top-2 -right-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                <X className="w-5 h-5 text-slate-400" />
             </button>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('staff_table_user') || 'Name'}</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('phone')}</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-mono font-bold text-slate-900 dark:text-white"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('age_group') || 'Age'}</label>
                <input
                  type="number"
                  name="age"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full h-12 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900 dark:text-white"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('gender')}</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full h-12 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900 dark:text-white"
                >
                  <option value="ذكرو">{t('male') || 'Male'}</option>
                  <option value="ذكر">{t('male') || 'Male'}</option>
                  <option value="أنثى">{t('female') || 'Female'}</option>
                </select>
              </div>

              {/* Blood Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('blood_type')}</label>
                <div className="relative group">
                  <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900 dark:text-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('location_city')}</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-4 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full h-24 pl-12 pr-4 pt-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col md:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] h-14 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                   <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{isSubmitting ? (t('loading') || 'Loading...') : (initialData ? (t('save_changes') || 'Update') : (t('add') || 'Save'))}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                {t('cancel') || 'Cancel'}
              </button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
