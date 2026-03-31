import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Package, Tag, Hash, DollarSign, AlertCircle, Save } from 'lucide-react';
import api from '@/lib/api';
import { useNotifications } from '@/context/NotificationsContext';
import { cn } from '@/lib/utils';

export default function AddInventoryModal({ open, onOpenChange, initialData = null }) {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    medicineName: '',
    type: 'Tablet',
    quantity: 0,
    minThreshold: 10,
    pricePerUnit: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        medicineName: '',
        type: 'Tablet',
        quantity: 0,
        minThreshold: 10,
        pricePerUnit: 0,
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: (name === 'quantity' || name === 'pricePerUnit' || name === 'minThreshold') ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData) {
        await api.put(`/inventory/${initialData._id}`, formData);
      } else {
        await api.post('/inventory', formData);
      }
      addNotification({ 
        type: 'inventory', 
        title: initialData ? 'تم التحديث' : 'تمت الإضافة', 
        body: `بنجاح: ${formData.medicineName}` 
      });
      onOpenChange(false);
    } catch (error) {
      addNotification({ type: 'alert', title: 'خطأ', body: error.response?.data?.error || 'فشل حفظ الصنف' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white/90 backdrop-blur-xl border-primary/10 shadow-2xl rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            <span>{initialData ? 'تعديل بيانات صنف' : 'إضافة صنف جديد للمخزن'}</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-sm">
            أدخل البيانات الأساسية للمادة الطبية أو المستلزم لتتبع كمياته وتنبيهات النقص بصورة دقيقة.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">اسم الصنف / المادة</label>
              <div className="relative group">
                <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  name="medicineName"
                  required
                  placeholder="مثال: باراسيتامول 500 ملجم"
                  value={formData.medicineName}
                  onChange={handleChange}
                  className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-bold"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">نوع الصنف</label>
              <div className="relative group">
                <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-bold text-sm appearance-none"
                >
                  <option value="Tablet">أقراص (Tablet)</option>
                  <option value="Syrup">شراب (Syrup)</option>
                  <option value="Injection">حقن (Injection)</option>
                  <option value="Other">أخرى (Other)</option>
                </select>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">الكمية الحالية</label>
              <div className="relative group">
                <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="number"
                  name="quantity"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm font-black text-center"
                />
              </div>
            </div>

            {/* Min Threshold */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">حد التنبيه الأدنى</label>
              <div className="relative group">
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 group-focus-within:text-amber-600 transition-colors" />
                <input
                  type="number"
                  name="minThreshold"
                  required
                  min="0"
                  value={formData.minThreshold}
                  onChange={handleChange}
                  className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 outline-none transition-all shadow-sm font-black text-center"
                />
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">السعر التقديري للوحدة</label>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner flex items-center gap-4 group">
                <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200">
                  <DollarSign className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  name="pricePerUnit"
                  required
                  min="0"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-3xl font-black text-slate-900 border-none focus:ring-0 outline-none p-0 text-left placeholder:text-slate-300"
                />
                <span className="text-sm font-black text-slate-400">ج.م</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4">
             <button
               type="submit"
               disabled={isSubmitting}
               className="flex-1 h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
             >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5 shadow-sm" />
                )}
                <span>{isSubmitting ? 'جاري الحفظ...' : (initialData ? 'حفظ التعديلات' : 'إضافة الصنف للمخزن')}</span>
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
