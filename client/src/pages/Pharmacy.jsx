import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Filter, 
  ChevronRight,
  Clipboard,
  Activity,
  History,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';
import { useNotifications } from '@/context/NotificationsContext';
import AddDrugModal from '@/components/modals/AddDrugModal';

export default function Pharmacy() {
  const { language } = useSettings();
  const t = useTranslation(language);
  const { addNotification } = useNotifications();
  
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/drugs');
      setDrugs(response.data);
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedDrug) {
        await api.put(`/drugs/${selectedDrug._id}`, formData);
        addNotification({ type: 'info', title: t('success'), body: t('update_success') });
      } else {
        await api.post('/drugs', formData);
        addNotification({ type: 'info', title: t('success'), body: t('record_saved') });
      }
      fetchDrugs();
      setIsModalOpen(false);
      setSelectedDrug(null);
    } catch (error) {
       addNotification({ type: 'alert', title: t('error'), body: t('error') });
    }
  };

  const handleDelete = async (id) => {
    if (confirm(t('confirm_delete_record'))) {
      try {
        await api.delete(`/drugs/${id}`);
        addNotification({ type: 'alert', title: t('delete'), body: t('success') });
        fetchDrugs();
      } catch (error) {
        addNotification({ type: 'alert', title: t('error'), body: t('error') });
      }
    }
  };

  const handleSeed = async () => {
    try {
      await api.post('/drugs/seed');
      addNotification({ type: 'info', title: t('success'), body: 'Medicine database seeded!' });
      fetchDrugs();
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: 'Seed failed or already seeded' });
    }
  };

  const filteredDrugs = drugs.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (d.genericName && d.genericName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || d.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(drugs.map(d => d.category).filter(Boolean))];

  return (
    <div className={cn("space-y-6 animate-in fade-in duration-500 pb-10", language === 'ar' ? "font-cairo" : "font-sans")} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
            {t('pharmacy_mgmt')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{t('pharmacy_desc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSeed}
            className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200"
          >
            {language === 'ar' ? 'تعبئة تلقائية' : 'Seed Data'}
          </button>
          <button 
            onClick={() => { setSelectedDrug(null); setIsModalOpen(true); }}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t('add_drug')}</span>
          </button>
        </div>
      </div>

      <AddDrugModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSubmit={handleSubmit}
        initialData={selectedDrug}
        t={t}
      />

      <div className="glass rounded-[2rem] overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        {/* Toolbar */}
        <div className="p-6 border-b border-border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 group">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors", language === 'ar' ? "right-4" : "left-4")} />
              <input 
                type="text" 
                placeholder={language === 'ar' ? 'البحث بالاسم العلمي أو التجاري...' : 'Search by name or generic...'}
                className={cn(
                  "w-full h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900 dark:text-white",
                  language === 'ar' ? "pr-12 pl-4" : "pl-12 pr-4"
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap",
                    filterCategory === cat 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  )}
                >
                  {cat === 'All' ? (language === 'ar' ? 'جميع التصنيفات' : 'All Categories') : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          <table className={cn("w-full border-collapse", language === 'ar' ? "text-right" : "text-left")}>
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-border dark:border-slate-800">
                <th className="px-8 py-5">{t('drug_name')}</th>
                <th className="px-8 py-5">Generic / Category</th>
                <th className="px-8 py-5">Strength</th>
                <th className="px-8 py-5">Default Dosage</th>
                <th className="px-8 py-5">Instructions</th>
                <th className={cn("px-8 py-5", language === 'ar' ? "text-left" : "text-right")}>{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                       <p className="text-xs font-bold text-muted-foreground">{t('loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDrugs.length > 0 ? filteredDrugs.map((drug) => (
                <tr key={drug._id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                        <Pill className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{drug.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{drug.genericName || '-'}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{drug.category}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                     <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">{drug.strength || '-'}</span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap font-mono text-sm text-primary font-black">
                     {drug.defaultDosage}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                     <span className="text-xs font-bold text-slate-500 underline decoration-dotted">{drug.instructions || '-'}</span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedDrug(drug); setIsModalOpen(true); }}
                        className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(drug._id)}
                        className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-32 text-center opacity-30">
                     <div className="flex flex-col items-center gap-3">
                        <Clipboard className="w-12 h-12" />
                        <p className="font-black text-xl uppercase tracking-widest">{t('no_data')}</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
