import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('lang') || 'ar');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [clinicInfo, setClinicInfo] = useState({ name: '', logo: '', address: '', phone: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        localStorage.setItem('lang', language);
    }, [language]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/config');
            if (response.data.clinicInfo) setClinicInfo(response.data.clinicInfo);
            // Optionally sync system-wide default language/theme if needed
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleLanguage = () => setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <SettingsContext.Provider value={{ 
            language, 
            setLanguage, 
            toggleLanguage, 
            theme, 
            setTheme, 
            toggleTheme,
            clinicInfo,
            setClinicInfo,
            loading 
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
