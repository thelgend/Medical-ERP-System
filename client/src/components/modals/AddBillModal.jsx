import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Receipt, User, Stethoscope, Plus, Trash2, DollarSign, Save } from 'lucide-react';
import api from '@/lib/api';
import { useNotifications } from '@/context/NotificationsContext';
import { cn } from '@/lib/utils';
import { arabicSearchCompare } from '@/lib/stringUtils';

export default function AddBillModal({ open, onOpenChange }) {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    items: [{ description: 'كشف طبي عمومي', amount: 200 }],
    discount: 0,
  });

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showPatientList, setShowPatientList] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const doctorsRes = await api.get('/users/role/Doctor');
      setDoctors(doctorsRes.data);
      if (doctorsRes.data.length > 0) setFormData(prev => ({ ...prev, doctor: doctorsRes.data[0]._id }));

      const patientsRes = await api.get('/patients');
      setPatients(patientsRes.data);

      const configRes = await api.get('/config');
      setConfig(configRes.data);
    } catch (error) {
      console.error('Error fetching billing modal data:', error);
    }
  };

  const handlePatientInput = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, patient: value }));
    setSelectedPatient(null);
    if (value.length > 0) {
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

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'amount' ? Number(value) : value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((acc, item) => acc + item.amount, 0);
    return subtotal - formData.discount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      return addNotification({ type: 'alert', title: 'خطأ', body: 'يرجى اختيار مريض مسجل' });
    }
    setIsSubmitting(true);
    try {
      const subtotal = formData.items.reduce((acc, item) => acc + item.amount, 0);
      const itemsToSubmit = formData.items.map(item => ({
        description: item.description === 'custom' ? item.customDesc : item.description,
        amount: item.amount
      }));

      await api.post('/billing', {
        patient: selectedPatient._id,
        doctor: formData.doctor,
        items: itemsToSubmit,
        totalAmount: subtotal,
        discount: formData.discount,
        status: 'Pending'
      });
      addNotification({ type: 'billing', title: 'تمت العملية', body: 'تم إنشاء الفاتورة بنجاح' });
      onOpenChange(false);
    } catch (error) {
      addNotification({ type: 'alert', title: 'خطأ', body: error.response?.data?.error || 'فشل إنشاء الفاتورة' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white/90 backdrop-blur-xl border-primary/10 shadow-2xl rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" />
            <span>إنشاء فاتورة جديدة</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            أضف الخدمات والمستلزمات المقدمة للمريض لإصدار فاتورة مالية مفصلة.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Search */}
            <div className="space-y-1 relative">
              <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">المريض</label>
              <div className="relative group">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="ابحث بالاسم أو الهاتف..."
                  value={formData.patient}
                  onChange={handlePatientInput}
                  autoComplete="off"
                  className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                />
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
                      <p className="text-xs font-bold text-muted-foreground italic">عذراً، لم يتم العثور على مريض بهذا الاسم.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Doctor Select */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">الطبيب المعالج</label>
              <div className="relative group">
                <Stethoscope className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select
                  value={formData.doctor}
                  onChange={(e) => setFormData(p => ({ ...p, doctor: e.target.value }))}
                  className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-bold text-sm appearance-none"
                >
                  {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">الخدمات والمستلزمات</label>
                <button 
                  type="button" 
                  onClick={addItem}
                  className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> 
                  <span>إضافة بند جديد</span>
                </button>
             </div>
             <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {formData.items.map((item, idx) => (
                   <div key={idx} className="flex gap-3 items-center animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex-1 relative group">
                        {config?.services?.length > 0 ? (
                          <select
                            required
                            value={item.description}
                            onChange={(e) => {
                              const selectedService = config.services.find(s => s.name === e.target.value);
                              const newItems = [...formData.items];
                              newItems[idx].description = e.target.value;
                              if (selectedService) newItems[idx].amount = selectedService.price;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all appearance-none"
                          >
                            <option value="">-- اختر خدمة --</option>
                            {config.services.map((s, i) => (
                              <option key={i} value={s.name}>{s.name} ({s.price} ج.م)</option>
                            ))}
                            <option value="custom">-- وصف مخصص --</option>
                          </select>
                        ) : (
                          <input 
                            type="text" 
                            required
                            placeholder="وصف الخدمة أو الصنف..." 
                            value={item.description}
                            onChange={(e) => updateItem(idx, 'description', e.target.value)}
                            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                          />
                        )}
                        {item.description === 'custom' && (
                          <input 
                            type="text" 
                            required
                            placeholder="اكتب الوصف المخصص هنا..." 
                            autoFocus
                            className="w-full h-11 px-4 mt-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[idx].customDesc = e.target.value;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                          />
                        )}
                      </div>
                      <div className="relative w-32 group">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 opacity-50 transition-opacity group-focus-within:opacity-100" />
                        <input 
                          type="number" 
                          required
                          placeholder="0.00"
                          value={item.amount}
                          onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                          className="w-full h-11 pl-8 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-black focus:ring-4 focus:ring-emerald-500/5 outline-none text-left transition-all"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeItem(idx)}
                        disabled={formData.items.length === 1}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
                      >
                         <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                ))}
             </div>
          </div>

          <div className="p-6 bg-slate-50/50 rounded-[1.5rem] space-y-3 border border-slate-100 shadow-inner">
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">الإجمالي قبل المراجعة</span>
                <span className="font-black text-slate-700">{formData.items.reduce((acc, item) => acc + item.amount, 0).toLocaleString()} ج.م</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">قيمة الخصم النقدي</span>
                <div className="relative w-24">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-400">ج.م</span>
                  <input 
                    type="number" 
                    value={formData.discount}
                    onChange={(e) => setFormData(p => ({ ...p, discount: Number(e.target.value) }))}
                    className="w-full h-9 pl-8 pr-3 bg-white border border-red-100 rounded-xl text-xs font-black text-red-600 outline-none focus:ring-4 focus:ring-red-500/10 text-left transition-all"
                  />
                </div>
             </div>
             <div className="pt-4 mt-2 border-t border-slate-200/60 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">صافي القيمة المستحقة</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">{calculateTotal().toLocaleString()} <span className="text-xs text-primary font-bold">ج.م</span></span>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-wider shadow-sm transition-all",
                  calculateTotal() > 0 ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-slate-200 text-slate-500"
                )}>
                  جاهز للإصدار
                </div>
             </div>
          </div>

          <DialogFooter className="gap-3">
             <button 
               type="submit" 
               disabled={isSubmitting}
               className="flex-1 h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
             >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ وإصدار الفاتورة النهائية'}</span>
             </button>
             <button
               type="button"
               onClick={() => onOpenChange(false)}
               className="px-8 h-14 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all font-cairo"
             >
               إلغاء
             </button>
          </DialogFooter>
        </form>
      </DialogContent>

    </Dialog>
  );
}
