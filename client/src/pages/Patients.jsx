import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ChevronRight,
  MapPin,
  Phone,
  Calendar,
  User as UserIcon,
  Activity,
  History,
  FileText,
  X,
  UserCheck,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AddPatientModal from '@/components/modals/AddPatientModal';
import PatientDetailsModal from '@/components/modals/PatientDetailsModal';
import { useNotifications } from '@/context/NotificationsContext';
import api from '@/lib/api';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';

export default function Patients() {
  const { language } = useSettings();
  const t = useTranslation(language);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [ageRangeFilter, setAgeRangeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'All' || p.status === (statusFilter === 'Active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive'));
    
    const genderVal = genderFilter === 'Male' ? (language === 'ar' ? 'ذكر' : 'Male') : (language === 'ar' ? 'أنثى' : 'Female');
    const matchesGender = genderFilter === 'All' || p.gender === genderVal;
    
    let matchesAge = true;
    if (ageRangeFilter === 'Children') matchesAge = p.age < 18;
    else if (ageRangeFilter === 'Youth') matchesAge = p.age >= 18 && p.age <= 40;
    else if (ageRangeFilter === 'Seniors') matchesAge = p.age > 40;

    const matchesLocation = locationFilter === 'All' || (p.address && p.address.includes(locationFilter));

    return matchesSearch && matchesStatus && matchesGender && matchesAge && matchesLocation;
  });

  const handleDeletePatient = async (id) => {
    if (confirm(t('confirm_delete_record'))) {
      try {
        await api.delete(`/patients/${id}`);
        fetchPatients();
        addNotification({ type: 'alert', title: t('success'), body: t('patient_deleted') });
      } catch (error) {
        addNotification({ type: 'alert', title: t('error'), body: t('error') });
      }
    }
  };

  const handleAddPatient = async (formData) => {
    try {
      let response;
      if (selectedPatient?._id) {
        response = await api.put(`/patients/${selectedPatient._id}`, formData);
        addNotification({ type: 'info', title: t('success'), body: t('update_success') });
      } else {
        response = await api.post('/patients', formData);
        addNotification({ type: 'info', title: t('success'), body: t('record_saved') });
      }
      fetchPatients();
      setIsAddModalOpen(false);
      setSelectedPatient(null);
    } catch (error) {
       addNotification({ type: 'alert', title: t('error'), body: t('error') });
    }
  };

  const togglePatientStatus = async (patient) => {
    const newStatus = patient.status === (language === 'ar' ? 'نشط' : 'Active') ? (language === 'ar' ? 'غير نشط' : 'Inactive') : (language === 'ar' ? 'نشط' : 'Active');
    try {
      await api.put(`/patients/${patient._id}`, { ...patient, status: newStatus });
      fetchPatients();
      addNotification({ type: 'info', title: t('success'), body: t('success') });
    } catch (error) {
       addNotification({ type: 'alert', title: t('error'), body: t('error') });
    }
  };

  const locations = ['All', ...new Set(patients.map(p => p.address ? p.address.split('،')[0].trim() : (t('no_data'))))];

  return (
    <div className={cn("space-y-6 animate-in fade-in duration-500 pb-10", language === 'ar' ? "font-cairo" : "font-sans")} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">{t('patients_mgmt')}</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{t('patients_desc').replace('{n}', patients.length)}</p>
        </div>
        <button 
          onClick={() => { setSelectedPatient(null); setIsAddModalOpen(true); }}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t('add_patient')}</span>
        </button>
      </div>

      <AddPatientModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
        onSubmit={handleAddPatient}
        initialData={selectedPatient}
        t={t}
      />

      <PatientDetailsModal 
        open={isDetailsModalOpen} 
        onOpenChange={setIsDetailsModalOpen} 
        patient={selectedPatient}
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
                placeholder={t('search_patient')}
                className={cn(
                  "w-full h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900 dark:text-white",
                  language === 'ar' ? "pr-12 pl-4" : "pl-12 pr-4"
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 w-full lg:w-auto">
              {['All', 'Active', 'Inactive'].map(id => (
                <button
                  key={id}
                  onClick={() => setStatusFilter(id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black transition-all border",
                    statusFilter === id 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  )}
                >
                  {id === 'All' ? (language === 'ar' ? 'الكل' : 'All') : (id === 'Active' ? t('active') : t('inactive'))}
                </button>
              ))}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "p-3 rounded-xl transition-all border flex items-center gap-2",
                  showFilters 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl" 
                    : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                )}
              >
                <Filter className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-tighter">{t('filter_advanced')}</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <UserIcon className="w-3 h-3" /> {t('gender')}
                </label>
                <select 
                  className="w-full h-11 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 text-slate-900 dark:text-white"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <option value="All">{t('all_genders')}</option>
                  <option value="Male">{t('male')}</option>
                  <option value="Female">{t('female')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> {t('age_group')}
                </label>
                <select 
                  className="w-full h-11 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 text-slate-900 dark:text-white"
                  value={ageRangeFilter}
                  onChange={(e) => setAgeRangeFilter(e.target.value)}
                >
                  <option value="All">{t('all_ages')}</option>
                  <option value="Children">{t('children')}</option>
                  <option value="Youth">{t('youth')}</option>
                  <option value="Seniors">{t('seniors')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> {t('location_city')}
                </label>
                <select 
                  className="w-full h-11 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 text-slate-900 dark:text-white"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc === 'All' ? t('all_areas') : loc}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
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
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-border dark:border-slate-800">
                  <th className="px-8 py-5">{t('patient')}</th>
                  <th className="px-8 py-5">{language === 'ar' ? 'العمر / الجنس' : 'Age / Gender'}</th>
                  <th className="px-8 py-5">{t('blood_type')}</th>
                  <th className="px-8 py-5">{t('phone')}</th>
                  <th className="px-8 py-5">{t('last_visit')}</th>
                  <th className="px-8 py-5">{t('status')}</th>
                  <th className={cn("px-8 py-5", language === 'ar' ? "text-left" : "text-right")}>{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-slate-800">
                {filteredPatients.length > 0 ? filteredPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform">
                          {patient.name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors cursor-pointer" onClick={() => { setSelectedPatient(patient); setIsDetailsModalOpen(true); }}>{patient.name}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {patient.address || t('no_data')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                       <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{patient.age} {t('years_old')} | {patient.gender}</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                       <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-black border border-red-100 dark:border-red-900/30">{patient.bloodGroup || '-'}</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                       <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400" dir="ltr">{patient.phone}</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                       <span className="text-xs font-bold text-slate-500 dark:text-slate-500">{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '-'}</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                       <button 
                        onClick={() => togglePatientStatus(patient)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all border",
                          patient.status === (language === 'ar' ? 'نشط' : 'Active') 
                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100" 
                            : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 hover:bg-amber-100"
                        )}
                       >
                         {patient.status}
                       </button>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className={cn("flex items-center gap-2", language === 'ar' ? "justify-end" : "justify-end")}>
                        <button 
                          onClick={() => { setSelectedPatient(patient); setIsAddModalOpen(true); }}
                          className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePatient(patient._id)}
                          className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {language === 'ar' ? <ChevronLeft className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 cursor-pointer" onClick={() => { setSelectedPatient(patient); setIsDetailsModalOpen(true); }} /> : <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 cursor-pointer" onClick={() => { setSelectedPatient(patient); setIsDetailsModalOpen(true); }} />}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center gap-3 opacity-30">
                          <UsersIcon className="w-12 h-12" />
                          <p className="font-bold">{t('no_data')}</p>
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
