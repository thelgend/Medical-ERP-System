import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Edit,
  Activity,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { useNotifications } from '@/context/NotificationsContext';
import AddInventoryModal from '@/components/modals/AddInventoryModal';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';

export default function Inventory() {
  const { language } = useSettings();
  const t = useTranslation(language);
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, alertsRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/alerts')
      ]);
      setItems(itemsRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, change) => {
    try {
      await api.patch(`/inventory/${id}/quantity`, { change });
      addNotification({ type: 'inventory', title: t('success'), body: t('activity_update_inventory_qty') });
      fetchData();
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      (item.medicineName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      item._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, items]);

  return (
    <div className={cn("space-y-6 animate-in fade-in duration-500 pb-10", language === 'ar' ? "font-cairo" : "font-sans")} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">{t('inventory_mgmt')}</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{t('inventory_desc')}</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t('add_item')}</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: language === 'ar' ? 'إجمالي الأصناف' : 'Total Items', value: items.length, icon: Package, color: 'blue' },
           { label: t('low_stock'), value: alerts.length, icon: AlertTriangle, color: 'amber', suffix: language === 'ar' ? ' أصناف' : ' items' },
           { label: language === 'ar' ? 'إجمالي الوحدات' : 'Total Units', value: items.reduce((acc, i) => acc + i.quantity, 0), icon: ArrowUpRight, color: 'emerald' },
           { label: language === 'ar' ? 'قيمة المخزون' : 'Inventory Value', value: items.reduce((acc, i) => acc + (i.pricePerUnit * i.quantity), 0).toLocaleString(), icon: ArrowDownRight, color: 'red', suffix: ' ' + (language === 'ar' ? 'ج.م' : 'EGP') },
         ].map((stat, i) => (
           <div key={i} className={cn("glass p-5 rounded-2xl flex items-center gap-4 border", `border-${stat.color}-100 dark:border-${stat.color}-800/30`)}>
              <div className={cn("p-3 rounded-xl", `bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-500`)}><stat.icon className="w-5 h-5"/></div>
              <div>
                 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">{stat.label}</p>
                 <h4 className="text-lg font-black text-slate-900 dark:text-white">{stat.value}{stat.suffix}</h4>
              </div>
           </div>
         ))}
      </div>

      <div className="glass rounded-[2.5rem] overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        {/* Table Header */}
        <div className="p-4 border-b border-border dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-sm group">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors", language === 'ar' ? "right-4" : "left-4")} />
            <input 
              type="text" 
              placeholder={language === 'ar' ? 'البحث باسم الصنف أو الكود...' : 'Search item or code...'}
              className={cn(
                "w-full h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900 dark:text-white",
                language === 'ar' ? "pr-12 pl-4" : "pl-12 pr-4"
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Inventory List */}
        <div className="overflow-x-auto">
          <table className={cn("w-full border-collapse", language === 'ar' ? "text-right" : "text-left")}>
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border dark:border-slate-800">
                <th className="px-8 py-5">{language === 'ar' ? 'الصنف / المادة' : 'Item / Medicine'}</th>
                <th className="px-8 py-5">{language === 'ar' ? 'التصنيف' : 'Type'}</th>
                <th className="px-8 py-5">{t('quantity')}</th>
                <th className="px-8 py-5">{t('amount')}</th>
                <th className="px-8 py-5">{t('status')}</th>
                <th className={cn("px-8 py-5", language === 'ar' ? "text-left" : "text-right")}>{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-800">
              {loading ? (
                <tr>
                   <td colSpan="6" className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-bold text-muted-foreground">{t('loading')}</p>
                      </div>
                   </td>
                </tr>
              ) : filteredItems.length > 0 ? filteredItems.map((item) => (
                <tr key={item._id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 font-bold border border-slate-200 dark:border-slate-700 shadow-sm">#{item._id.slice(-3)}</div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{item.medicineName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-500 dark:text-slate-400">{item.type}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col min-w-[60px]">
                        <span className={cn(
                          "text-base font-black tracking-tighter",
                          item.quantity === 0 ? "text-red-500" : item.quantity <= item.minThreshold ? "text-amber-500" : "text-emerald-500"
                        )}>{item.quantity}</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.unit || (t('no_data'))}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => updateQuantity(item._id, 1)} className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100 dark:border-emerald-800 font-black">+</button>
                         <button onClick={() => updateQuantity(item._id, -1)} className="w-7 h-7 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 dark:border-red-800 font-black" disabled={item.quantity === 0}>-</button>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-700 dark:text-slate-300 tracking-tighter">{item.pricePerUnit.toLocaleString()} <span className="text-[10px] text-slate-400">{language === 'ar' ? 'ج.م' : 'EGP'}</span></td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
                      item.quantity === 0 ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800" : 
                      item.quantity <= item.minThreshold ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800" : 
                      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
                    )}>
                      {item.quantity === 0 ? t('out_of_stock') : 
                       item.quantity <= item.minThreshold ? t('low_stock') : t('in_stock')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn("flex gap-2", language === 'ar' ? "justify-end" : "justify-end")}>
                      <button 
                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                        className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
                      >
                        <Edit className="w-4 h-4 text-slate-500"/>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan="6" className="py-32 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <Activity className="w-12 h-12" />
                        <p className="font-bold">{language === 'ar' ? 'المخزن خالٍ حالياً' : 'Inventory is empty'}</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AddInventoryModal 
        open={isModalOpen} 
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
          setIsModalOpen(open);
          if (!open) fetchData();
        }}
        initialData={editingItem}
        t={t}
      />
    </div>
  );
}
