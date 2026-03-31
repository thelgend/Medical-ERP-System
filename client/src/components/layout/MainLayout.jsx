import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FlaskConical, 
  Receipt, 
  Package, 
  Settings, 
  Menu, 
  X, 
  Bell, 
  Search,
  LogOut,
  User,
  Clock,
  ChevronLeft,
  CheckCheck,
  AlertCircle,
  FileText,
  TrendingUp,
  ListOrdered,
  Pill,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { arabicSearchCompare } from '@/lib/stringUtils';
import { useNotifications } from '@/context/NotificationsContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';
import io from 'socket.io-client';


const getNavItems = (t, role) => {
  const allItems = [
    { name: t('dashboard'), icon: LayoutDashboard, path: '/' },
    { name: t('analytics'), icon: TrendingUp, path: '/analytics', roles: ['Admin'] },
    { name: t('patients'), icon: Users, path: '/patients', roles: ['Admin', 'Doctor', 'Receptionist'] },
    { name: t('queue'), icon: ListOrdered, path: '/queue', roles: ['Admin', 'Doctor', 'Receptionist'] },
    { name: t('staff'), icon: User, path: '/staff', roles: ['Admin'] },
    { name: t('appointments'), icon: Calendar, path: '/appointments', roles: ['Admin', 'Doctor', 'Receptionist'] },
    { name: t('lab'), icon: FlaskConical, path: '/lab', roles: ['Admin', 'Doctor'] },
    { name: t('billing'), icon: Receipt, path: '/billing', roles: ['Admin', 'Receptionist'] },
    { name: t('pharmacy'), icon: Pill, path: '/pharmacy', roles: ['Admin', 'Doctor'] },
    { name: t('inventory'), icon: Package, path: '/inventory', roles: ['Admin'] },
    { name: t('logs'), icon: History, path: '/logs', roles: ['Admin'] },
    { name: t('settings'), icon: Settings, path: '/settings', roles: ['Admin', 'Doctor', 'Receptionist'] },
  ];

  return allItems.filter(item => !item.roles || item.roles.includes(role));
};

// Quick Mock Data for Global Search
const GLOBAL_SEARCH_DATA = [
  { id: 'p1', type: 'patient', name: 'أحمد علي حسن', sub: '01012345678', path: '/patients' },
  { id: 'p2', type: 'patient', name: 'سارة محمود الرفاعي', sub: '01123456789', path: '/patients' },
  { id: 'a1', type: 'appointment', name: 'موعد مع د. يوسف', sub: 'اليوم الساعة 09:00', path: '/appointments' },
  { id: 'l1', type: 'lab', name: 'تحليل دم شامل', sub: 'بانتظار النتيجة', path: '/lab' },
];

export default function MainLayout({ children }) {
  const { language, theme, clinicInfo } = useSettings();
  const t = useTranslation(language);
  const { logout, user } = useAuth();
  const navItems = getNavItems(t, user?.role);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, markAllRead, markOneRead, unreadCount, addNotification } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const socket = io('http://localhost:5000');
    
    socket.on('queueUpdate', (data) => {
      if (data && data.patientName) {
        addNotification({ 
          type: 'info', 
          title: t('now_serving'), 
          body: `${data.doctorName || 'Doctor'} ${language === 'ar' ? 'يستدعي' : 'is calling'} ${data.patientName}`
        });
      }
    });

    return () => socket.disconnect();
  }, [language]);

  const handleLogout = () => {
    addNotification({
      type: 'auth',
      title: t('logout'),
      body: language === 'ar' ? 'لقد قمت بتسجيل الخروج من النظام بنجاح.' : 'You have been logged out successfully.'
    });
    logout();
    navigate('/login');
  };

  const notifIcon = (type) => {
    if (type === 'appointment') return <Calendar className="w-4 h-4" />;
    if (type === 'lab') return <FlaskConical className="w-4 h-4" />;
    if (type === 'alert') return <AlertCircle className="w-4 h-4" />;
    if (type === 'report') return <FileText className="w-4 h-4" />;
    if (type === 'patient') return <Users className="w-4 h-4" />;
    if (type === 'auth') return <LogOut className="w-4 h-4" />;
    if (type === 'billing') return <Receipt className="w-4 h-4" />;
    if (type === 'inventory') return <Package className="w-4 h-4" />;
    return <Bell className="w-4 h-4" />;
  };

  const notifColor = (type) => {
    if (type === 'appointment') return 'bg-blue-100 text-blue-600';
    if (type === 'lab') return 'bg-emerald-100 text-emerald-600';
    if (type === 'alert') return 'bg-red-100 text-red-600';
    if (type === 'report') return 'bg-amber-100 text-amber-600';
    if (type === 'patient') return 'bg-indigo-100 text-indigo-600';
    if (type === 'auth') return 'bg-slate-100 text-slate-600';
    if (type === 'billing') return 'bg-emerald-100 text-emerald-600';
    if (type === 'inventory') return 'bg-blue-100 text-blue-600';
    return 'bg-muted text-muted-foreground';
  };

  const closeAll = () => { setShowResults(false); setShowNotifications(false); };

  const filteredResults = searchTerm.length > 0 
    ? GLOBAL_SEARCH_DATA.filter(item => arabicSearchCompare(item.name, searchTerm) || item.sub.includes(searchTerm))
    : [];

  const handleResultClick = (path) => {
    navigate(path);
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground flex overflow-hidden selection:bg-primary/20",
      language === 'ar' ? "font-cairo" : "font-sans"
    )} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 z-50 w-72 glass border-slate-200/50 dark:border-slate-800/50 transform transition-transform duration-500 lg:relative lg:translate-x-0 shadow-2xl",
          language === 'ar' ? "right-0 border-l" : "left-0 border-r",
          !isSidebarOpen && (language === 'ar' ? "translate-x-full lg:w-24" : "-translate-x-full lg:w-24")
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-24 flex items-center justify-between px-8">
            <div className={cn("flex flex-col gap-0.5 transition-all duration-500", !isSidebarOpen && "hidden")}>
                <span className="text-xl font-[1000] text-primary tracking-tighter uppercase italic">{clinicInfo.name || 'Medical ERP'}</span>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.3em] uppercase">Portal</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
            >
              {isSidebarOpen ? <X className="w-5 h-5 text-slate-400" /> : <Menu className="w-6 h-6 text-primary animate-pulse" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-[1.5rem] transition-all group relative overflow-hidden",
                    isActive 
                      ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {isActive && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />}
                  <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                  <span className={cn("text-sm font-medium", !isSidebarOpen && "lg:hidden")}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-border dark:border-slate-800">
            <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <div className={cn("flex-1 min-w-0", language === 'ar' ? "text-right" : "text-left", !isSidebarOpen && "hidden")}>
                <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{user?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground truncate uppercase font-black tracking-widest">{user?.role || (language === 'ar' ? 'المدير' : 'Admin')}</p>
              </div>
            </div>
            {isSidebarOpen && (
              <button 
                onClick={handleLogout}
                className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background relative selection:bg-primary/30">
        <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
           <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
           <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        </div>

        {/* Topbar */}
        <header className="h-20 bg-background/60 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-8 relative z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full group">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary", language === 'ar' ? "right-3" : "left-3")} />
              <input 
                type="text" 
                placeholder={t('search')}
                className={cn(
                  "w-full h-10 bg-muted/50 border border-border/50 rounded-full text-sm focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground text-foreground",
                  language === 'ar' ? "pr-10 pl-4" : "pl-10 pr-4"
                )}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
              
              {/* Search Results Dropdown */}
              {showResults && searchTerm.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 max-h-[400px] overflow-y-auto">
                    {filteredResults.length > 0 ? (
                      <div className="space-y-1">
                        {filteredResults.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result.path)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-xl transition-all text-right group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              {result.type === 'patient' && <Users className="w-4 h-4" />}
                              {result.type === 'appointment' && <Calendar className="w-4 h-4" />}
                              {result.type === 'lab' && <FlaskConical className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-800">{result.name}</p>
                              <p className="text-[10px] text-muted-foreground">{result.sub}</p>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <Search className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-sm font-bold text-muted-foreground">لا توجد نتائج مطابقة</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(v => !v); setShowResults(false); }}
                className={cn(
                  "relative p-2 rounded-full transition-all",
                  showNotifications ? "bg-primary text-white shadow-lg" : "hover:bg-muted"
                )}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 border-2 border-card rounded-full flex items-center justify-center text-white text-[9px] font-black">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute left-0 top-full mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" style={{zIndex: 9999}}>
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      <h4 className="font-bold text-slate-900 text-sm">{t('notifications')}</h4>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-black bg-primary text-white px-2 py-0.5 rounded-full">{unreadCount} {language === 'ar' ? 'جديد' : 'new'}</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline transition-all"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'تعليم الكل مقروء' : 'Mark all as read'}</span>
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => markOneRead(notif.id)}
                        className={cn(
                          "w-full flex items-start gap-3 p-4 text-right transition-all hover:bg-muted/30 group",
                          language !== 'ar' && "text-left",
                          !notif.read && "bg-primary/5"
                        )}
                      >
                        <div className={cn("p-2.5 rounded-xl shrink-0 shadow-sm group-hover:scale-110 transition-transform", notifColor(notif.type))}>
                          {notifIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn("flex items-center gap-2 justify-between", language !== 'ar' && "flex-row-reverse")}>
                            <p className={cn("text-sm font-bold", !notif.read ? 'text-slate-900' : 'text-slate-600')}>{notif.title}</p>
                            {!notif.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse"></span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.body}</p>
                          <p className={cn("text-[10px] font-bold text-muted-foreground/60 mt-1.5 flex items-center gap-1", language !== 'ar' && "justify-end")}>
                            <Clock className="w-3 h-3" />{notif.time}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-border bg-muted/10 text-center">
                    <button 
                      onClick={() => { navigate('/notifications'); closeAll(); }}
                      className="text-xs font-bold text-primary hover:underline transition-all"
                    >
                      {language === 'ar' ? 'عرض جميع الإشعارات' : 'View all notifications'}
                    </button>
                  </div>

                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-border dark:bg-slate-800 mx-2"></div>
            <div className={cn("hidden sm:block", language === 'ar' ? "text-right" : "text-left")}>
              <p className="text-xs text-muted-foreground">{t('welcome_desc')}</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'full' }).format(new Date())}</p>
            </div>
          </div>
        </header>

        {/* Global Overlay: Closes both search and notifications */}
        {(showResults || showNotifications) && (
          <div 
            className="fixed inset-0 z-30" 
            onClick={closeAll}
          />
        )}

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
