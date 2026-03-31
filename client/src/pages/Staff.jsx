import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Stethoscope, 
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import StaffModal from '@/components/modals/StaffModal';
import { useNotifications } from '@/context/NotificationsContext';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';
import api from '@/lib/api';

export default function Staff() {
  const { language } = useSettings();
  const t = useTranslation(language);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setStaff(response.data);
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async (formData) => {
    try {
      if (editingStaff) {
        await api.put(`/users/${editingStaff._id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      addNotification({
        type: 'auth',
        title: t('success'),
        body: editingStaff ? t('save_changes') : t('add')
      });
      fetchStaff();
      setIsModalOpen(false);
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: error.response?.data?.error || t('error') });
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(t('confirm_delete_staff').replace('{name}', name))) return;
    try {
      await api.delete(`/users/${id}`);
      addNotification({ type: 'alert', title: t('success'), body: t('staff_deleted').replace('{name}', name) });
      fetchStaff();
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.specialization && s.specialization.includes(searchTerm))
  );

  const getRoleBadge = (role) => {
    const roles = {
      Admin: { label: t('role_admin'), class: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
      Doctor: { label: t('role_doctor'), class: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
      Receptionist: { label: t('role_receptionist'), class: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' }
    };
    const r = roles[role] || { label: role, class: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' };
    return <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight", r.class)}>{r.label}</span>;
  };

  return (
    <div className={cn("space-y-6 animate-in fade-in duration-500 pb-10", language === 'ar' ? "font-cairo" : "font-sans")} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">{t('staff_mgmt')}</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{t('staff_desc')}</p>
        </div>
        <button 
          onClick={() => { setEditingStaff(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>{t('add_staff_btn')}</span>
        </button>
      </div>

      <StaffModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSubmit={handleAddOrUpdate}
        initialData={editingStaff}
        t={t}
      />

      <div className="glass rounded-[2rem] overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        {/* Toolbar */}
        <div className="p-6 border-b border-border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative max-w-md group">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors", language === 'ar' ? "right-4" : "left-4")} />
            <input 
              type="text" 
              placeholder={t('search_staff_placeholder')}
              className={cn(
                "w-full h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none text-slate-900 dark:text-white font-medium",
                language === 'ar' ? "pr-12 pl-4" : "pl-12 pr-4"
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-muted-foreground">{t('loading')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={cn("w-full border-collapse", language === 'ar' ? "text-right" : "text-left")}>
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-border dark:border-slate-800">
                  <th className="px-8 py-5">{t('staff_table_user')}</th>
                  <th className="px-8 py-5">{t('staff_table_role')}</th>
                  <th className="px-8 py-5">{t('staff_table_contact')}</th>
                  <th className={cn("px-8 py-5", language === 'ar' ? "text-left" : "text-right")}>{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-slate-800">
                {filteredStaff.length > 0 ? filteredStaff.map((person) => (
                  <tr key={person._id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-primary/20">
                          {person.name[0]}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{person.name}</span>
                          <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 uppercase tracking-tighter">
                            <Stethoscope className="w-3 h-3" /> {person.specialization || (t('no_data'))}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {getRoleBadge(person.role)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                          <Mail className="w-3.5 h-3.5 text-blue-500" /> {person.email}
                        </div>
                        {person.phone && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono" dir="ltr">
                            <Phone className="w-3.5 h-3.5 text-indigo-500" /> {person.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className={cn("flex items-center gap-2", language === 'ar' ? "justify-end" : "justify-end")}>
                        <button 
                          onClick={() => { setEditingStaff(person); setIsModalOpen(true); }}
                          className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(person._id, person.name)}
                          className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                         <AlertCircle className="w-12 h-12" />
                         <p className="font-bold">{t('no_staff_found')}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
