import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  CreditCard, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  FlaskConical,
  Filter,
  Download,
  CalendarDays
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';
import { useNotifications } from '@/context/NotificationsContext';

// Mock Historical Data for Chart Demos
const REVENUE_DATA = [
  { name: 'Jan', revenue: 45000, visits: 120 },
  { name: 'Feb', revenue: 52000, visits: 145 },
  { name: 'Mar', revenue: 48000, visits: 130 },
  { name: 'Apr', revenue: 61000, visits: 168 },
  { name: 'May', revenue: 58000, visits: 155 },
  { name: 'Jun', revenue: 72000, visits: 195 },
  { name: 'Jul', revenue: 85000, visits: 210 },
];

const VISIT_TYPE_DATA = [
  { name: 'Consultation', value: 400, color: '#3b82f6' },
  { name: 'Follow-up', value: 300, color: '#10b981' },
  { name: 'Lab Check', value: 200, color: '#f59e0b' },
  { name: 'Emergency', value: 100, color: '#ef4444' },
];

export default function Analytics() {
  const { language } = useSettings();
  const t = useTranslation(language);
  const { addNotification } = useNotifications();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('Last 7 Days');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/dashboard');
      setStats(response.data);
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: 'Failed to load analytics' });
    } finally {
      setLoading(false);
    }
  };

  const performanceCards = [
    { label: t('total_earnings'), value: `${stats?.monthlyRevenue?.toLocaleString() || 0} EGP`, icon: CreditCard, trend: '+12.5%', isUp: true, color: 'blue' },
    { label: t('daily_patients'), value: stats?.dailyPatients || 0, icon: Users, trend: '+5.2%', isUp: true, color: 'emerald' },
    { label: t('avg_invoice'), value: '450 EGP', icon: Activity, trend: '-2.1%', isUp: false, color: 'amber' },
    { label: t('pending_results'), value: stats?.pendingLabCount || 0, icon: FlaskConical, trend: 'High', isUp: true, color: 'red' },
  ];

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 opacity-50">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       <p className="font-black text-xs uppercase tracking-widest">{t('loading')}</p>
    </div>
  );

  return (
    <div className={cn("space-y-8 animate-in fade-in duration-700 pb-10", language === 'ar' ? "font-cairo" : "font-sans")} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase">
            {t('analytics_hub')}
          </h1>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('analytics_desc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <Filter className="w-4 h-4" /> {language === 'ar' ? 'تصفية' : 'Filter'}
          </button>
          <button className="p-3 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <Download className="w-4 h-4" /> {t('export')}
          </button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceCards.map((card, i) => (
          <div key={i} className={cn("glass p-8 rounded-[2.5rem] border transition-all hover:scale-[1.03] group relative overflow-hidden", `border-${card.color}-100 dark:border-${card.color}-800/30`)}>
             <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl shadow-sm", `bg-${card.color}-50 dark:bg-${card.color}-900/20 text-${card.color}-600`)}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black", card.isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                  {card.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.trend}
                </div>
             </div>
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{card.label}</p>
             <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{card.value}</h3>
             <div className={cn("absolute bottom-0 left-0 h-1 bg-gradient-to-r transition-all group-hover:w-full", `from-${card.color}-500 to-transparent`, "w-0")}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('revenue_overview')}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Monthly Growth Trend</p>
            </div>
            <div className="flex gap-2">
               {['6M', '1Y', 'ALL'].map(r => (
                 <button key={r} className="px-3 py-1.5 rounded-lg text-[9px] font-black bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-all uppercase tracking-tighter">{r}</button>
               ))}
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#fff' }}
                  labelStyle={{ fontWeight: 800, color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visit Types Pie Chart */}
        <div className="glass rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-8">{t('visits_by_type')}</h3>
          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={VISIT_TYPE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {VISIT_TYPE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {VISIT_TYPE_DATA.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Patient Growth Bar Chart */}
         <div className="glass rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-8">{t('patient_growth')}</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_DATA}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="visits" fill="#10b981" radius={[8, 8, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Additional Performance Table or Stats */}
         <div className="glass rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-8">{t('top_services')}</h3>
            <div className="space-y-4">
               {[
                 { name: 'General Consultation', count: 145, revenue: '14.5k', color: 'bg-blue-500' },
                 { name: 'Blood Test', count: 102, revenue: '20.4k', color: 'bg-emerald-500' },
                 { name: 'X-Ray', count: 85, revenue: '17k', color: 'bg-amber-500' },
                 { name: 'Dental Check', count: 48, revenue: '9.6k', color: 'bg-purple-500' },
                 { name: 'Physical Therapy', count: 32, revenue: '6.4k', color: 'bg-indigo-500' },
               ].map((service, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-4">
                       <div className={cn("w-1.5 h-8 rounded-full", service.color)}></div>
                       <div>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-200">{service.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black">{service.count} appointments</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-primary italic">{service.revenue} EGP</p>
                       <p className="text-[9px] font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-lg inline-block">+8%</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
