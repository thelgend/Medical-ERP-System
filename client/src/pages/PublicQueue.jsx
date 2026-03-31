import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  User, 
  Stethoscope, 
  Clock, 
  Volume2,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/lib/translations';
import io from 'socket.io-client';

export default function PublicQueue() {
  const { language } = useSettings();
  const t = useTranslation(language);
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisplayData();
    const socket = io('http://localhost:5000');
    
    socket.on('queueUpdate', () => {
      fetchDisplayData();
      // Simple voice announcement logic could go here
    });

    return () => socket.disconnect();
  }, []);

  const fetchDisplayData = async () => {
    try {
      // Fetch status for all active doctors
      const staffRes = await api.get('/users?role=Doctor');
      const displays = await Promise.all(staffRes.data.map(async (doctor) => {
        const res = await api.get(`/queue/display?doctor=${doctor._id}`);
        return { doctor, ...res.data };
      }));
      setQueueData(displays);
    } catch (error) {
      console.error('Failed to fetch display data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
       <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       <p className="text-white font-black text-xl tracking-[0.3em] animate-pulse">SYSTEM INITIALIZING...</p>
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen bg-slate-950 text-white p-12 overflow-hidden selection:bg-primary/30",
      language === 'ar' ? "font-cairo" : "font-sans"
    )} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* HUD Header */}
      <div className="flex items-center justify-between mb-20 border-b border-white/10 pb-8 animate-in slide-in-from-top-10 duration-1000">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary/20 backdrop-blur-3xl rounded-[2rem] border border-primary/40 flex items-center justify-center animate-pulse">
            <Monitor className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase">{t('public_display')}</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-sm mt-2">{new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="text-right">
           <div className="text-7xl font-black tracking-tighter text-white tabular-nums animate-pulse">
             {new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {queueData.map((item, idx) => (
          <div key={idx} className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] p-10 flex flex-col gap-10 hover:border-primary/40 transition-all group animate-in zoom-in duration-700">
            
            {/* Doctor Info */}
            <div className="flex items-center gap-6 border-b border-white/10 pb-8">
              <div className="w-20 h-20 bg-slate-800 rounded-[2rem] flex items-center justify-center overflow-hidden border border-white/10 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-10 h-10 text-slate-400" />
              </div>
              <div>
                 <h2 className="text-3xl font-black tracking-tight">{item.doctor.name}</h2>
                 <p className="text-primary font-black uppercase text-xs tracking-widest mt-1 italic">{item.doctor.specialization || 'Clinical Specialist'}</p>
              </div>
            </div>

            {/* Now Serving */}
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm">{t('now_serving')}</p>
              {item.current ? (
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-1000">
                  <div className="text-[10rem] leading-none font-black text-white tracking-widest drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                    {item.current.ticketNumber}
                  </div>
                  <div className="px-10 py-4 bg-primary text-white rounded-[2rem] font-black text-2xl uppercase tracking-wider animate-bounce shadow-2xl shadow-primary/40">
                    {item.current.patient?.name}
                  </div>
                </div>
              ) : (
                <div className="py-20 opacity-20">
                  <Clock className="w-24 h-24 text-white" />
                </div>
              )}
            </div>

            {/* Stats Footer */}
            <div className="mt-auto bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex items-center justify-between group-hover:bg-primary/10 transition-all">
              <div className="flex items-center gap-4 text-slate-400">
                 <Ticket className="w-6 h-6" />
                 <span className="text-lg font-black">{item.waiting} {t('patient_waiting')}</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-primary group-hover:rotate-45 transition-transform">
                <ChevronRight className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-12 left-12 right-12 flex items-center justify-between text-white/20 font-black uppercase tracking-[0.5em] text-[10px]">
        <span>POWERED BY ANTIGRAVITY CLINICAL INTELLIGENCE</span>
        <span>STABLE v4.2.0-HUD</span>
      </div>
    </div>
  );
}
