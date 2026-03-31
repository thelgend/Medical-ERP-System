import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  User, 
  Stethoscope, 
  Clock,
  Ticket
} from 'lucide-react';
import api from '@/lib/api';

export default function AddQueueModal({ open, onOpenChange, onSubmit, t }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    priority: 'Normal',
    notes: ''
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [patientsRes, staffRes] = await Promise.all([
        api.get('/patients'),
        api.get('/users?role=Doctor')
      ]);
      setPatients(patientsRes.data);
      setDoctors(staffRes.data);
    } catch (error) {
      console.error('Failed to fetch data for queue modal');
    }
  };

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{t('add_to_queue')}</h2>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('queue_desc')}</p>
            </div>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <User className="w-3 h-3" /> {t('patient')}
            </label>
            <select
              required
              className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white"
              value={formData.patient}
              onChange={(e) => setFormData({...formData, patient: e.target.value})}
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
              ))}
            </select>
          </div>

          {/* Doctor Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Stethoscope className="w-3 h-3" /> {t('doctor')}
            </label>
            <select
              required
              className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white"
              value={formData.doctor}
              onChange={(e) => setFormData({...formData, doctor: e.target.value})}
            >
              <option value="">Select Doctor</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
              ))}
            </select>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-3 h-3" /> Priority
            </label>
            <div className="flex gap-2">
              {['Normal', 'Urgent', 'Emergency'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({...formData, priority: p})}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                    formData.priority === p 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                      : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-14 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-black uppercase tracking-widest transition-all"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-[2] h-14 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
            >
              Confirm Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
