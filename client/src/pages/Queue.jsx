import React, { useState, useEffect } from 'react';
import { 
  ListOrdered, 
  Search, 
  Plus, 
  User, 
  Stethoscope, 
  Clock, 
  ChevronRight,
  Ticket,
  Play,
  CheckCircle2,
  AlertCircle,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';
import { useNotifications } from '@/context/NotificationsContext';
import { useAuth } from '@/context/AuthContext';
import AddQueueModal from '@/components/modals/AddQueueModal';

export default function Queue() {
  const { language } = useSettings();
  const { user } = useAuth();
  const t = useTranslation(language);
  const { addNotification } = useNotifications();
  
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchQueue();
    }
  }, [selectedDoctor]);

  const fetchData = async () => {
    try {
      const staffRes = await api.get('/users?role=Doctor');
      setDoctors(staffRes.data);
      if (staffRes.data.length > 0) {
        // If current user is a doctor, default to them
        const currentDoctor = staffRes.data.find(d => d._id === user?._id);
        setSelectedDoctor(currentDoctor?._id || staffRes.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch doctors');
    }
  };

  const fetchQueue = async () => {
    try {
      setLoading(true);
      // We'll use a general queue list endpoint if it exists, or adapt
      const response = await api.get(`/queue/display?doctor=${selectedDoctor}`);
      // The backend /display returns current and waiting count. 
      // Let's assume we need a full list for this management page.
      // I'll check if there's a full list endpoint or create one.
      // For now, let's fetch all queue entries for the doctor.
      const fullQueueRes = await api.get(`/queue?doctor=${selectedDoctor}`);
      setQueue(fullQueueRes.data);
    } catch (error) {
      console.error('Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToQueue = async (formData) => {
    try {
      await api.post('/queue', formData);
      addNotification({ type: 'info', title: t('success'), body: 'Patient added to queue' });
      fetchQueue();
      setIsModalOpen(false);
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: t('error') });
    }
  };

  const handleCallNext = async () => {
    try {
      await api.patch('/queue/next', { doctor: selectedDoctor });
      addNotification({ type: 'info', title: t('success'), body: 'Next patient called' });
      fetchQueue();
    } catch (error) {
      addNotification({ type: 'alert', title: t('error'), body: 'No more patients or error' });
    }
  }

  const currentPatient = queue.find(q => q.status === 'In-Progress');
  const waitingPatients = queue.filter(q => q.status === 'Waiting');

  return (
    <div className={cn("space-y-6 animate-in fade-in duration-500 pb-10", language === 'ar' ? "font-cairo" : "font-sans")} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-tighter">
            {t('queue_mgmt')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{t('queue_desc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            {doctors.map(d => (
              <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
            ))}
          </select>
          {user?.role !== 'Doctor' && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.open('/public-queue', '_blank')}
                className="p-3 bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 font-bold text-xs"
              >
                <Monitor className="w-4 h-4" />
                <span>{t('public_display')}</span>
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>{t('add_patient')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <AddQueueModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSubmit={handleAddToQueue}
        t={t}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Current Patient Card */}
        <div className="lg:col-span-1 space-y-6">
           <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">{t('in_consultation')}</h2>
           <div className="glass p-8 rounded-[2.5rem] border-2 border-primary/20 shadow-2xl relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
              {currentPatient ? (
                <div className="space-y-6 relative z-10 text-center flex flex-col items-center">
                  <div className="w-24 h-24 rounded-[2rem] bg-primary text-white flex items-center justify-center text-4xl font-black shadow-xl shadow-primary/30 mb-2">
                    {currentPatient.ticketNumber}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{currentPatient.patient?.name}</h3>
                    <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mt-1">Ticket # {currentPatient.ticketNumber}</p>
                  </div>
                  <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800 my-2"></div>
                  <div className="flex gap-4">
                     <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest"><Clock className="w-3 h-3"/> {new Date(currentPatient.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center flex flex-col items-center gap-4 opacity-30">
                  <Play className="w-16 h-16 text-slate-300" />
                  <p className="font-bold">{language === 'ar' ? 'لا يوجد مريض حالياً' : 'No patient currently'}</p>
                </div>
              )}

              {user?.role === 'Doctor' && user?._id === selectedDoctor && (
                <button 
                  onClick={handleCallNext}
                  className="w-full mt-8 py-4 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {t('call_next')}
                </button>
              )}
           </div>
        </div>

        {/* Waiting List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('current_queue')}</h2>
            <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500">{waitingPatients.length} {t('patient_waiting')}</span>
          </div>
          
          <div className="glass rounded-[2.5rem] overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-xl min-h-[400px]">
            <div className="divide-y divide-border dark:divide-slate-800">
              {waitingPatients.length > 0 ? waitingPatients.map((entry, idx) => (
                <div key={entry._id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center font-black text-xl shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                      {entry.ticketNumber}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">{entry.patient?.name}</h4>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" /> {new Date(entry.createdAt).toLocaleTimeString()}
                        <span className="mx-2">•</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-lg border",
                          entry.priority === 'Urgent' ? "bg-amber-50 text-amber-600 border-amber-100" :
                          entry.priority === 'Emergency' ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                        )}>{entry.priority}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-500">
                       Wait: ~{idx * 15}m
                    </div>
                    {user?.role === 'Admin' && (
                        <button className="p-2 hover:bg-red-50 text-red-400 rounded-lg">
                           <AlertCircle className="w-4 h-4" />
                        </button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="p-32 text-center flex flex-col items-center gap-4 opacity-20 pointer-events-none">
                  <ListOrdered className="w-16 h-16" />
                  <p className="font-black text-xl uppercase tracking-widest">{t('no_data')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
