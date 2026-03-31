import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { User, Mail, Lock, Phone, Stethoscope, Save, RefreshCw, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StaffModal({ open, onOpenChange, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    role: 'Doctor',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: '', // Don't pre-fill password for editing
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialization: '',
        role: 'Doctor',
      });
    }
  }, [initialData, open]);

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let retVal = "";
    for (let i = 0, n = charset.length; i < 10; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setFormData(prev => ({ ...prev, password: retVal }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If editing and password is empty, don't send it to backend to keep existing password
    const submissionData = { ...formData };
    if (initialData && !submissionData.password) {
      delete submissionData.password;
    }
    onSubmit(submissionData);
    onOpenChange(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white/90 backdrop-blur-xl border-primary/10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {initialData ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            {initialData ? 'قم بتحديث معلومات الحساب والصلاحيات.' : 'أدخل البيانات الأساسية لإنشاء حساب جديد في النظام.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">الاسم الكامل</label>
              <div className="relative group">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="د. أحمد محمد"
                  className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@example.com"
                  className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm font-mono text-sm"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  name="password"
                  required={!initialData}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={initialData ? "اتركه فارغاً للحفاظ على الحالية" : "********"}
                  className="w-full h-12 pr-10 pl-12 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm font-mono text-sm"
                  dir="ltr"
                />
                <button 
                  type="button"
                  onClick={generatePassword}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 hover:bg-primary/5 text-primary rounded-xl transition-all"
                  title="إنشاء كلمة مرور عشوائية"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">الصلاحية</label>
              <div className="relative group">
                <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm font-bold text-sm"
                >
                  <option value="Admin">مدير نظام (Admin)</option>
                  <option value="Doctor">طبيب (Doctor)</option>
                  <option value="Receptionist">موظف استقبال (Receptionist)</option>
                </select>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">رقم الهاتف</label>
              <div className="relative group">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="01012345678"
                  className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Specialization */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 mr-1 uppercase tracking-wider">التخصص</label>
              <div className="relative group">
                <Stethoscope className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="جراحة عامة، رمد، إلخ..."
                  className="w-full h-12 pr-10 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="submit"
              className="flex-1 h-14 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
            >
              <Save className="w-5 h-5 shadow-sm" />
              <span>{initialData ? 'تحديث بيانات الموظف' : 'إضافة الموظف للنظام'}</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-8 h-14 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              إلغاء
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
