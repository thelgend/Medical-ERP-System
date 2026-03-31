import { 
  Receipt, 
  Search, 
  Plus, 
  Filter, 
  DollarSign, 
  Clock, 
  Printer, 
  Eye,
  TrendingUp,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { useNotifications } from '@/context/NotificationsContext';
import AddBillModal from '@/components/modals/AddBillModal';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';
import InvoicePrint from '@/components/printing/InvoicePrint';

export default function Billing() {
  const { language } = useSettings();
  const t = useTranslation(language);
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({ totalToday: 0, totalPending: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printingBill, setPrintingBill] = useState(null);
  const { addNotification } = useNotifications();
  const { clinicInfo } = useSettings();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsRes, statsRes] = await Promise.all([
         api.get('/billing'),
         api.get('/billing/stats/summary')
      ]);
      setBills(billsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id) => {
    try {
      await api.patch(`/billing/${id}/pay`);
      addNotification({ type: 'billing', title: t('success'), body: t('paid') });
      fetchData();
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    }
  };

  const handlePrint = (bill) => {
    setPrintingBill(bill);
    setTimeout(() => {
        window.print();
        setPrintingBill(null);
    }, 500);
  };

  const filteredBills = useMemo(() => {
    return bills.filter(bill => 
      (bill.patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      bill._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, bills]);

  return (
    <div className={cn("space-y-6 animate-in fade-in duration-500 pb-10", language === 'ar' ? "font-cairo" : "font-sans")} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">{t('billing_mgmt')}</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{t('billing_desc')}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t('new_invoice')}</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t('daily_revenue'), value: stats.totalToday, icon: TrendingUp, color: 'emerald', desc: t('status_paid') },
          { label: t('pending_payments'), value: stats.totalPending, icon: Clock, color: 'amber', desc: stats.pendingCount + ' ' + t('billing') },
          { label: t('total_revenue'), value: stats.totalToday + stats.totalPending, icon: DollarSign, color: 'blue', desc: t('billing_mgmt') },
        ].map((stat, i) => (
          <div key={i} className={cn("glass p-6 rounded-[2rem] border transition-all hover:scale-[1.02]", `border-${stat.color}-100 dark:border-${stat.color}-800/30`)}>
            <div className="flex items-center justify-between pointer-events-none">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <div className={cn("p-2 rounded-xl", `bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-500`)}><stat.icon className="w-5 h-5" /></div>
            </div>
            <h3 className="text-3xl font-black mt-3 tracking-tighter text-slate-900 dark:text-white">{stat.value.toLocaleString()} <span className="text-sm font-bold text-slate-400">{language === 'ar' ? 'ج.م' : 'EGP'}</span></h3>
            <p className={cn("text-[10px] font-bold mt-2 uppercase tracking-tighter", `text-${stat.color}-600 dark:text-${stat.color}-400`)}>{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-[2.5rem] overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        {/* Table Header */}
        <div className="p-6 border-b border-border dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-md group">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors", language === 'ar' ? "right-4" : "left-4")} />
            <input 
              type="text" 
              placeholder={language === 'ar' ? 'بحث برقم الفاتورة أو اسم المريض...' : 'Search invoice or patient...'}
              className={cn(
                "w-full h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 dark:text-white",
                language === 'ar' ? "pr-12 pl-4" : "pl-12 pr-4"
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
             <button className="h-12 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm text-slate-600 dark:text-slate-400">
                <Filter className="w-4 h-4" />
                <span>{language === 'ar' ? 'تصفية' : 'Filter'}</span>
             </button>
          </div>
        </div>

        {/* Invoice List */}
        <div className="overflow-x-auto">
          <table className={cn("w-full border-collapse", language === 'ar' ? "text-right" : "text-left")}>
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border dark:border-slate-800">
                <th className="px-8 py-5">{t('invoice_number')}</th>
                <th className="px-8 py-5">{t('patient')}</th>
                <th className="px-8 py-5">{language === 'ar' ? 'نوع الخدمة' : 'Service Type'}</th>
                <th className="px-8 py-5">{t('date')}</th>
                <th className="px-8 py-5">{t('amount')}</th>
                <th className="px-8 py-5">{t('status')}</th>
                <th className={cn("px-8 py-5", language === 'ar' ? "text-left" : "text-right")}>{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-800">
              {loading ? (
                <tr>
                   <td colSpan="7" className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-bold text-muted-foreground">{t('loading')}</p>
                      </div>
                   </td>
                </tr>
              ) : filteredBills.length > 0 ? filteredBills.map((bill) => (
                <tr key={bill._id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="text-xs font-black text-primary uppercase tracking-tighter shadow-sm bg-primary/5 px-2 py-1 rounded-lg border border-primary/20 cursor-default">#{bill._id.slice(-6)}</span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">{bill.patient?.name || t('no_data')}</td>
                  <td className="px-8 py-6 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">{bill.items?.[0]?.description || (language === 'ar' ? 'خدمة طبية' : 'Service')}</td>
                  <td className="px-8 py-6 whitespace-nowrap text-xs text-muted-foreground/60 font-bold">{new Date(bill.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                  <td className="px-8 py-6 whitespace-nowrap text-base font-black text-slate-900 dark:text-white tracking-tighter">{bill.payableAmount.toLocaleString()} <span className="text-[10px] text-slate-400">{language === 'ar' ? 'ج.م' : 'EGP'}</span></td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
                      bill.status === 'Paid' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800" :
                      bill.status === 'Overdue' ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800" : 
                      "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800"
                    )}>
                      {bill.status === 'Paid' ? t('paid') : 
                       bill.status === 'Overdue' ? t('overdue') : t('unpaid')}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className={cn("flex gap-2", language === 'ar' ? "justify-end" : "justify-end")}>
                      {bill.status !== 'Paid' && (
                        <button 
                          onClick={() => handlePay(bill._id)}
                          className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 active:scale-95"
                        >
                          {t('collect_payment')}
                        </button>
                      )}
                      <button className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all"><Eye className="w-4 h-4 text-slate-500" /></button>
                      <button 
                        onClick={() => handlePrint(bill)}
                        className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
                      >
                        <Printer className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan="7" className="py-32 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <FileText className="w-12 h-12" />
                        <p className="font-bold">{language === 'ar' ? 'لا توجد فواتير حالياً' : 'No invoices found'}</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AddBillModal 
        open={isModalOpen} 
        onOpenChange={(open) => {
          if (!open && isModalOpen) fetchData();
          setIsModalOpen(open);
        }} 
        t={t}
      />

      {/* Hidden Print Container */}
      <div className="hidden print:block fixed inset-0 z-[1000] bg-white">
        <InvoicePrint 
            bill={printingBill} 
            clinicInfo={clinicInfo} 
            language={language} 
            t={t} 
        />
      </div>
    </div>
  );
}
