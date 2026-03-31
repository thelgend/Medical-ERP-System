import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  HelpCircle,
  Stethoscope,
  Clock,
  Trash2,
  Save,
  Activity,
  FlaskConical,
  Plus,
  Download, 
  ShieldCheck, 
  UserCog, 
  History, 
  Layout, 
  Briefcase, 
  FileText, 
  Languages, 
  Moon, 
  Sun,
  Building2,
  BellRing
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationsContext';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';

export default function Settings() {
  const { addNotification } = useNotifications();
  const { language, toggleLanguage, theme, toggleTheme, setClinicInfo } = useSettings();
  const t = useTranslation(language);
  const [activeTab, setActiveTab] = useState('clinic_info');
  const [config, setConfig] = useState({ 
    visitTypes: [], 
    timeSlots: [], 
    labTestTypes: [],
    clinicInfo: { name: '', address: '', phone: '', logo: '' },
    services: [],
    backupSchedule: { interval: 'Manual', lastBackup: null },
    defaultSettings: { language: 'ar', theme: 'light' }
  });
  const [newVisitType, setNewVisitType] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [newLabTestType, setNewLabTestType] = useState('');
  const [newService, setNewService] = useState({ name: '', price: '' });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ 
    name: '', email: '', phone: '', specialization: '', role: '',
    notificationPrefs: { appointments: true, inventory: true, lab: true, billing: true }
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [logs, setLogs] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchConfig();
    fetchUser();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab]);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/logs');
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await api.get('/config');
      setConfig(response.data);
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (updatedConfig) => {
    try {
      const response = await api.post('/config', updatedConfig);
      if (response.status === 200 || response.status === 201) {
        addNotification({
          type: 'report',
          title: t('success'),
          body: t('success')
        });
        setConfig(response.data);
        if (response.data.clinicInfo) setClinicInfo(response.data.clinicInfo);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      addNotification({ type: 'alert', title: t('error'), body: t('save_failed') || 'Failed to save settings.' });
    }
  };

  const updateProfile = async (e) => {
    if (e) e.preventDefault();
    setIsSavingProfile(true);
    try {
      const response = await api.put('/users/me/profile', {
        name: user.name,
        email: user.email,
        phone: user.phone,
        specialization: user.specialization,
        notificationPrefs: user.notificationPrefs
      });
      setUser(response.data);
      addNotification({ type: 'info', title: t('success'), body: t('profile_updated') || 'Profile updated successfully.' });
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: error.response?.data?.error || t('update_failed') });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return addNotification({ type: 'alert', title: t('error'), body: t('error') });
    }
    setIsChangingPass(true);
    try {
      const response = await api.put('/users/me/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addNotification({ type: 'info', title: t('success'), body: response.data.message || t('password_changed') });
    } catch (error) {
      addNotification({ 
        type: 'alert', 
        title: t('error'), 
        body: error.response?.data?.error || t('password_failed') 
      });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('/backup/export');
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const exportFileDefaultName = `medical_erp_backup_${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', exportFileDefaultName);
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      window.URL.revokeObjectURL(url);
      addNotification({ type: 'report', title: t('success'), body: t('backup_desc') });
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('backup_failed') || 'Failed to export backup.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const confirmMsg = language === 'ar' 
      ? 'تحذير: سيؤدي هذا إلى استبدال كافة البيانات الحالية. هل أنت متأكد؟' 
      : 'Warning: This will overwrite all current data. Are you sure?';
    if (!confirm(confirmMsg)) {
      e.target.value = '';
      return;
    }
    setIsRestoring(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        await api.post('/backup/restore', json);
        addNotification({ type: 'report', title: t('success'), body: t('restore_success') || 'Data restored successfully.' });
        setTimeout(() => window.location.reload(), 2000);
      } catch (err) {
        addNotification({ type: 'alert', title: t('error'), body: t('restore_failed') || 'Invalid backup file.' });
      } finally {
        setIsRestoring(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const addItem = (type) => {
    if (type === 'visit') {
      if (!newVisitType) return;
      const updated = { ...config, visitTypes: [...(config.visitTypes || []), newVisitType] };
      saveConfig(updated);
      setNewVisitType('');
    } else if (type === 'slot') {
      if (!newTimeSlot) return;
      const updated = { ...config, timeSlots: [...(config.timeSlots || []), newTimeSlot] };
      saveConfig(updated);
      setNewTimeSlot('');
    } else if (type === 'lab') {
      if (!newLabTestType) return;
      const updated = { ...config, labTestTypes: [...(config.labTestTypes || []), newLabTestType] };
      saveConfig(updated);
      setNewLabTestType('');
    }
  };

  const removeItem = (type, index) => {
    if (type === 'visit') {
      const updatedTypes = config.visitTypes.filter((_, i) => i !== index);
      saveConfig({ ...config, visitTypes: updatedTypes });
    } else if (type === 'slot') {
      const updatedSlots = config.timeSlots.filter((_, i) => i !== index);
      saveConfig({ ...config, timeSlots: updatedSlots });
    } else if (type === 'lab') {
      const updatedLabs = config.labTestTypes.filter((_, i) => i !== index);
      saveConfig({ ...config, labTestTypes: updatedLabs });
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-muted-foreground">{t('loading')}</p>
       </div>
    </div>
  );

  const tabs = [
    { section: t('clinic_info'), items: [
      { id: 'clinic_info', name: t('clinic_info'), icon: Building2 },
      { id: 'visit_types', name: t('visit_types'), icon: Activity },
      { id: 'time_slots', name: t('time_slots'), icon: Clock },
      { id: 'lab_tests', name: t('lab_tests'), icon: FlaskConical },
      { id: 'pricing', name: t('services_pricing'), icon: Briefcase },
    ]},
    { section: t('profile'), items: [
      { id: 'profile', name: t('profile'), icon: User },
      { id: 'security', name: t('security'), icon: Shield },
      { id: 'notifications', name: t('notifications'), icon: BellRing },
    ]},
    { section: t('preferences'), items: [
      { id: 'preferences', name: t('preferences'), icon: Layout },
      { id: 'backup', name: t('backup'), icon: Database },
      ...(user.role === 'Admin' ? [{ id: 'logs', name: t('system_logs'), icon: FileText }] : []),
    ]}
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-cairo cursor-default">{t('settings')}</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{t('settings_desc')}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 space-y-6">
          {tabs.map((tabGroup, gIdx) => (
            <div key={gIdx}>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 px-4 mb-2 tracking-widest">{tabGroup.section}</p>
              <div className="space-y-1">
                {tabGroup.items.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs transition-all",
                      activeTab === tab.id 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Clinic Info Tab */}
          {activeTab === 'clinic_info' && (
            <div className="glass p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl font-cairo cursor-default">{t('clinic_info')}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{t('clinic_info_desc')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-1">{t('clinic_name')}</label>
                    <input 
                      type="text" 
                      className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white"
                      value={config.clinicInfo?.name || ''}
                      onChange={(e) => setConfig({...config, clinicInfo: {...config.clinicInfo, name: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-1">{t('clinic_address')}</label>
                    <input 
                      type="text" 
                      className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white"
                      value={config.clinicInfo?.address || ''}
                      onChange={(e) => setConfig({...config, clinicInfo: {...config.clinicInfo, address: e.target.value}})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-1">{t('clinic_phone')}</label>
                    <input 
                      type="text" 
                      className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white"
                      value={config.clinicInfo?.phone || ''}
                      onChange={(e) => setConfig({...config, clinicInfo: {...config.clinicInfo, phone: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-1">{t('clinic_logo')} (URL)</label>
                    <input 
                      type="text" 
                      className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white"
                      placeholder="https://..."
                      value={config.clinicInfo?.logo || ''}
                      onChange={(e) => setConfig({...config, clinicInfo: {...config.clinicInfo, logo: e.target.value}})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-8">
                <button 
                  onClick={() => saveConfig(config)}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                  {t('save')}
                </button>
              </div>
            </div>
          )}

          {/* Visit Types Tab */}
          {activeTab === 'visit_types' && (
            <div className="glass p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl font-cairo cursor-default">{t('visit_types')}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{t('visit_types_desc')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder={language === 'ar' ? 'أضف نوع زيارة (مثل: استشارة فحص)...' : 'Add visit type (e.g. Consultation)...'}
                  className="flex-1 h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-900 dark:text-white"
                  value={newVisitType}
                  onChange={(e) => setNewVisitType(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem('visit')}
                />
                <button onClick={() => addItem('visit')} className="px-6 h-11 bg-primary text-white rounded-xl font-bold transition-all shadow-md active:scale-95"><Plus className="w-5 h-5"/></button>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-800/10 p-4 rounded-2xl border border-border dark:border-slate-800 min-h-[100px]">
                <div className="flex flex-wrap gap-2">
                  {config.visitTypes?.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm animate-in zoom-in duration-200">
                      <span>{v}</span>
                      <button onClick={() => removeItem('visit', i)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  ))}
                  {(!config.visitTypes || config.visitTypes.length === 0) && <p className="text-xs text-slate-400 italic p-4">{t('no_data')}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Time Slots Tab */}
          {activeTab === 'time_slots' && (
            <div className="glass p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl font-cairo cursor-default">{t('time_slots')}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{t('time_slots_desc')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder={language === 'ar' ? 'مثال: 09:00 - 09:30' : 'Example: 09:00 - 09:30'}
                  dir="ltr"
                  className={cn(
                    "flex-1 h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-900 dark:text-white",
                    language === 'ar' ? 'text-right' : 'text-left'
                  )}
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem('slot')}
                />
                <button onClick={() => addItem('slot')} className="px-6 h-11 bg-primary text-white rounded-xl font-bold transition-all shadow-md active:scale-95"><Plus className="w-5 h-5"/></button>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-800/10 p-4 rounded-2xl border border-border dark:border-slate-800 min-h-[100px]">
                <div className="flex flex-wrap gap-2">
                  {config.timeSlots?.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm animate-in zoom-in duration-200">
                      <span dir="ltr">{s}</span>
                      <button onClick={() => removeItem('slot', i)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  ))}
                  {(!config.timeSlots || config.timeSlots.length === 0) && <p className="text-xs text-slate-400 italic p-4">{t('no_data')}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Lab Tests Tab */}
          {activeTab === 'lab_tests' && (
            <div className="glass p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl font-cairo cursor-default">{t('lab_tests')}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{t('lab_tests_desc')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder={language === 'ar' ? 'مثال: تحليل دم شامل...' : 'Example: CBC Lab Test...'}
                  className="flex-1 h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-900 dark:text-white"
                  value={newLabTestType}
                  onChange={(e) => setNewLabTestType(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem('lab')}
                />
                <button onClick={() => addItem('lab')} className="px-6 h-11 bg-primary text-white rounded-xl font-bold transition-all shadow-md active:scale-95"><Plus className="w-5 h-5"/></button>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-800/10 p-4 rounded-2xl border border-border dark:border-slate-800 min-h-[100px]">
                <div className="flex flex-wrap gap-2">
                  {config.labTestTypes?.map((l, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm animate-in zoom-in duration-200">
                      <span>{l}</span>
                      <button onClick={() => removeItem('lab', i)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  ))}
                  {(!config.labTestTypes || config.labTestTypes.length === 0) && <p className="text-xs text-slate-400 italic p-4">{t('no_data')}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="glass p-8 rounded-[2rem] border border-border/50 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl space-y-8">
               <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl font-cairo cursor-default">{t('services_pricing')}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{t('services_pricing_desc')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input 
                    type="text" 
                    placeholder={language === 'ar' ? 'اسم الخدمة...' : 'Service Name...'}
                    className="md:col-span-2 h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-900 dark:text-white"
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder={language === 'ar' ? 'السعر...' : 'Price...'}
                      className="flex-1 h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-900 dark:text-white"
                      value={newService.price}
                      onChange={(e) => setNewService({...newService, price: e.target.value})}
                    />
                    <button 
                      onClick={() => {
                        if (!newService.name || !newService.price) return;
                        saveConfig({ ...config, services: [...(config.services || []), { ...newService, price: Number(newService.price) }] });
                        setNewService({ name: '', price: '' });
                      }}
                      className="px-6 h-11 bg-primary text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
                    >
                      <Plus className="w-5 h-5"/>
                    </button>
                  </div>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-border dark:border-slate-800 p-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {config.services?.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-xl shadow-sm animate-in fade-in duration-300">
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                            <span className="text-xs font-black text-primary">{s.price} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                         </div>
                         <button onClick={() => saveConfig({ ...config, services: config.services.filter((_, idx) => idx !== i) })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ))}
                    {(!config.services || config.services.length === 0) && <p className="col-span-full py-10 text-center text-xs text-slate-400 italic">{t('no_data')}</p>}
                 </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="glass p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl">
               <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl font-cairo cursor-default">{t('profile')}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{t('profile_desc')}</p>
                </div>
              </div>
              <form onSubmit={updateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-1">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                    <input 
                      type="text" 
                      className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white"
                      value={user.name}
                      onChange={(e) => setUser({...user, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-1">{t('email_label')}</label>
                    <input 
                      type="email" 
                      className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white"
                      value={user.email}
                      onChange={(e) => setUser({...user, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-1">{t('clinic_phone')}</label>
                    <input 
                      type="text" 
                      className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white"
                      value={user.phone || ''}
                      onChange={(e) => setUser({...user, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-1">{language === 'ar' ? 'التخصص' : 'Specialization'}</label>
                    <input 
                      type="text" 
                      className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white"
                      value={user.specialization || ''}
                      onChange={(e) => setUser({...user, specialization: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button 
                    disabled={isSavingProfile}
                    className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-50"
                  >
                    {isSavingProfile ? t('loading') : t('save_changes')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="glass p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500 max-w-xl">
               <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl font-cairo cursor-default">{t('security')}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{t('security_desc')}</p>
                </div>
              </div>
              <form onSubmit={changePassword} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-1">{language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}</label>
                    <input 
                      type="password" 
                      className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-1">{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                    <input 
                      type="password" 
                      className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-1">{language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</label>
                    <input 
                      type="password" 
                      className="w-full h-11 px-4 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button 
                    disabled={isChangingPass}
                    className="px-8 py-3 bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all disabled:opacity-50"
                  >
                    {isChangingPass ? t('loading') : t('save_changes')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="glass p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl">
               <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Layout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl font-cairo cursor-default">{t('preferences')}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{t('preferences_desc')}</p>
                </div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-border dark:border-slate-800 transition-all hover:border-primary/20">
                    <div className="flex items-center gap-4">
                       <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-primary border border-border dark:border-slate-800"><Languages className="w-5 h-5"/></div>
                       <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{t('language')}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">{language === 'ar' ? 'العربية' : 'English'}</p>
                       </div>
                    </div>
                    <button onClick={toggleLanguage} className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all">
                       {language === 'ar' ? 'English' : 'العربية'}
                    </button>
                 </div>
                 <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-border dark:border-slate-800 transition-all hover:border-primary/20">
                    <div className="flex items-center gap-4">
                       <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-amber-500 border border-border dark:border-slate-800">
                          {theme === 'light' ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5 text-blue-500"/>}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{t('theme')}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">{theme === 'light' ? t('light_mode') : t('dark_mode')}</p>
                       </div>
                    </div>
                    <button onClick={toggleTheme} className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black transition-all hover:-translate-y-0.5 active:scale-95 shadow-lg">
                       {theme === 'light' ? t('dark_mode') : t('light_mode')}
                    </button>
                 </div>
              </div>
            </div>
          )}

          {/* Backup Tab */}
          {activeTab === 'backup' && (
            <div className="glass p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl space-y-8">
               <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl font-cairo cursor-default">{t('backup')}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{t('backup_desc')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-6 bg-slate-50 dark:bg-slate-800/20 border border-border dark:border-slate-800 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                       <Download className="w-5 h-5 text-primary"/>
                       <h4 className="font-bold text-slate-900 dark:text-white text-sm">{language === 'ar' ? 'تحميل نسخة احتياطية' : 'Download Backup'}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{language === 'ar' ? 'تصدير كافة سجلات المرضى والمواعيد والبيانات المالية كملف JSON آمن.' : 'Export all patient records, appointments, and financial data as a secure JSON file.'}</p>
                    <button onClick={handleExport} disabled={isExporting} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all">
                       {isExporting ? t('loading') : <><Download className="w-4 h-4"/><span>{t('export')} JSON</span></>}
                    </button>
                 </div>
                 <div className="p-6 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                       <History className="w-5 h-5 text-amber-500"/>
                       <h4 className="font-bold text-amber-900 dark:text-amber-400 text-sm">{language === 'ar' ? 'استعادة من ملف' : 'Restore from File'}</h4>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-500/80 leading-relaxed">{language === 'ar' ? 'استبدال البيانات الحالية ببيانات من ملف خارجي. تحذير: هذه العملية لا يمكن التراجع عنها.' : 'Replace current data with data from an external file. Warning: This action cannot be undone.'}</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleRestore}/>
                    <button onClick={() => fileInputRef.current.click()} disabled={isRestoring} className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 transition-all">
                       {isRestoring ? t('loading') : (language === 'ar' ? 'بدء الاستعادة' : 'Start Restore')} 
                    </button>
                 </div>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="glass p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500 max-w-5xl">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xl font-cairo cursor-default">{t('system_logs')}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{language === 'ar' ? 'مراقبة أحداث النظام وتحركات المستخدمين.' : 'Monitor system events and user movements.'}</p>
                    </div>
                  </div>
                  <button onClick={fetchLogs} className="p-2.5 bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-all"><History className="w-5 h-5"/></button>
               </div>
               <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-border dark:border-slate-800">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('staff_table_user')}</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('staff_table_role')}</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('target')}</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('time')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border dark:divide-slate-800">
                        {logs.map((log, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                             <td className="px-6 py-4">
                               <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">{log.user?.name}</span>
                                  <span className="text-[10px] text-slate-500">{log.user?.role}</span>
                               </div>
                             </td>
                             <td className="px-6 py-4">
                                <span className={cn(
                                  "inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase border",
                                  log.action === 'login' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30" :
                                  log.action?.includes('delete') ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30" :
                                  "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                                )}>{log.action}</span>
                             </td>
                             <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{log.target}</td>
                             <td className="px-6 py-4 text-[10px] font-bold text-slate-500" dir="ltr">{new Date(log.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {logs.length === 0 && <div className="py-20 text-center opacity-30 flex flex-col items-center gap-2"><FileText className="w-10 h-10"/><p className="text-xs font-bold">{t('no_data')}</p></div>}
                  </div>
               </div>
            </div>
          )}
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="glass p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl space-y-6">
               <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl font-cairo cursor-default">{t('notifications')}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{language === 'ar' ? 'اختر التنبيهات التي ترغب في تلقيها.' : 'Select which alerts you want to receive.'}</p>
                </div>
              </div>
              <div className="space-y-3">
                 {[
                   { id: 'appointments', label: t('appointments') },
                   { id: 'billing', label: t('billing') },
                   { id: 'lab', label: t('lab') },
                   { id: 'inventory', label: t('inventory') },
                 ].map(pref => (
                   <div key={pref.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/20 border border-border dark:border-slate-800 rounded-2xl">
                       <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{pref.label}</span>
                       <button 
                        onClick={() => setUser({...user, notificationPrefs: {...user.notificationPrefs, [pref.id]: !user.notificationPrefs[pref.id]}})}
                        className={cn(
                          "w-11 h-6 rounded-full transition-all relative",
                          user.notificationPrefs?.[pref.id] ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                        )}
                       >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                            user.notificationPrefs?.[pref.id] ? (language === 'ar' ? "left-1" : "right-1") : (language === 'ar' ? "right-1" : "left-1")
                          )} />
                       </button>
                   </div>
                 ))}
                 <div className="flex justify-end pt-4">
                    <button onClick={updateProfile} disabled={isSavingProfile} className="px-10 py-3 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all">{t('save')}</button>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
