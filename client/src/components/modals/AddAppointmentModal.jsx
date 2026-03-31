import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useNotifications } from '@/context/NotificationsContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { User, Stethoscope, Calendar, Clock, Info, Loader2 } from 'lucide-react';
import { arabicSearchCompare } from '@/lib/stringUtils';

export default function AddAppointmentModal({ open, onOpenChange }) {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    date: '',
    slot: '',
    visitType: '',
    notes: '',
  });

  const [config, setConfig] = useState({ visitTypes: [], timeSlots: [] });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showPatientList, setShowPatientList] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Config
      const configRes = await api.get('/config');
      setConfig(configRes.data);
      if (configRes.data.visitTypes.length > 0) setFormData(prev => ({ ...prev, visitType: configRes.data.visitTypes[0] }));
      if (configRes.data.timeSlots.length > 0) setFormData(prev => ({ ...prev, slot: configRes.data.timeSlots[0] }));

      // Fetch Doctors
      const doctorsRes = await api.get('/users/role/Doctor');
      setDoctors(doctorsRes.data);
      if (doctorsRes.data.length > 0) setFormData(prev => ({ ...prev, doctor: doctorsRes.data[0]._id }));

      // Fetch Patients for lookup
      const patientsRes = await api.get('/patients');
      setPatients(patientsRes.data);
    } catch (error) {
      console.error('Error fetching appointment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientInput = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, patient: value }));
    setSelectedPatient(null);

    if (value.length > 0) { // Start filtering even from 1 character for instant wow
      const filtered = patients.filter(p => 
        arabicSearchCompare(p.name, value) || 
        (p.phone && p.phone.includes(value))
      ).slice(0, 8);
      
      setFilteredPatients(filtered);
      setShowPatientList(true);
    } else {
      setShowPatientList(false);
    }
  };

  const selectPatient = (p) => {
    setSelectedPatient(p);
    setFormData(prev => ({ ...prev, patient: p.name }));
    setShowPatientList(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
        return addNotification({ type: 'alert', title: 'خطأ', body: 'يرجى اختيار مريض مسجل من القائمة' });
    }
    setIsSubmitting(true);
    try {
        await api.post('/appointments', {
            ...formData,
            patient: selectedPatient._id,
        });
        addNotification({ type: 'appointment', title: 'تم الحجز', body: 'تم حجز الموعد بنجاح' });
        onOpenChange(false);
    } catch (error) {
        addNotification({ type: 'alert', title: 'فشل الحجز', body: error.response?.data?.error || 'حدث خطأ أثناء الحجز' });
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
      <DialogContent className="max-w-2xl bg-white/90 backdrop-blur-xl border-primary/10 shadow-2xl rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            <span>حجز موعد جديد</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            اختر المريض والطبيب والوقت المناسب لجدولة زيارة طبية جديدة في النظام.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Patient Selection */}
          <div className="space-y-1 relative md:col-span-2">
            <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">المريض</label>
            <div className="relative group">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                name="patient"
                required
                placeholder="ابحث عن مريض مسجل (بالاسم أو الهاتف)..."
                value={formData.patient}
                onChange={handlePatientInput}
                autoComplete="off"
                className="w-full h-12 pr-10 pl-12 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-bold"
              />
              {isSearching && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                   <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
              )}
            </div>
            {showPatientList && (
              <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {filteredPatients.length > 0 ? filteredPatients.map(p => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => selectPatient(p)}
                    className="w-full px-4 py-3 text-right hover:bg-primary/5 flex items-center justify-between border-b last:border-0 border-slate-100 transition-colors"
                  >
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono bg-slate-100 px-2 py-0.5 rounded-lg">{p.phone}</span>
                  </button>
                )) : (
                  <div className="px-4 py-8 text-center bg-slate-50/50">
                    <p className="text-xs font-bold text-muted-foreground italic">عذراً، لم يتم العثور على مريض بهذا الاسم أو الهاتف في النظام.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Doctor */}
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">الطبيب المعالج</label>
            <div className="relative group">
              <Stethoscope className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-bold text-sm appearance-none"
              >
                {doctors.length > 0 ? doctors.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                )) : <option>جاري التحميل...</option>}
              </select>
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">نوع الزيارة</label>
            <select
              name="visitType"
              value={formData.visitType}
              onChange={handleChange}
              className="w-full h-12 px-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-bold text-sm appearance-none"
            >
              {config.visitTypes.length > 0 ? config.visitTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              )) : <option>لا يوجد خيارات</option>}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">تاريخ الموعد</label>
            <div className="relative group">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-black"
              />
            </div>
          </div>

          {/* Slot */}
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">الفترة الزمنية</label>
            <div className="relative group">
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <select
                name="slot"
                value={formData.slot}
                onChange={handleChange}
                className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-bold text-sm appearance-none text-center"
              >
                {config.timeSlots.length > 0 ? config.timeSlots.map(s => (
                  <option key={s} value={s}>{s}</option>
                )) : <option>لا يوجد فترات</option>}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">ملاحظات إضافية (اختياري)</label>
            <div className="relative group">
              <Info className="absolute right-3 top-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <textarea
                name="notes"
                placeholder="أي شكوى مرضية أو ملاحظات للتذكير..."
                value={formData.notes}
                onChange={handleChange}
                className="w-full h-24 pr-10 pl-4 pt-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm resize-none font-medium"
              />
            </div>
          </div>

          <DialogFooter className="md:col-span-2 gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Calendar className="w-5 h-5 shadow-sm" />
              )}
              <span>{isSubmitting ? 'جاري الحفظ...' : 'تأكيد وحجز الموعد'}</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-8 h-14 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all font-cairo"
            >
              إلغاء التنفيذ
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

  );
}
