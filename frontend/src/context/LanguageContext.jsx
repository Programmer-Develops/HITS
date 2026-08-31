import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    appName: 'HITS Sanitation Monitor',
    schoolName: 'Govt. School Sanitation System',
    dashboard: 'Dashboard',
    workers: 'Workers',
    reports: 'Reports',
    settings: 'Settings',
    clean: 'Clean',
    dirty: 'Needs Cleaning',
    unknown: 'Unknown',
    lastCleaned: 'Last Cleaned',
    by: 'by',
    todayReports: "Today's Reports",
    totalReports: 'Total Reports',
    activeWorkers: 'Active Workers',
    addWorker: 'Add Worker',
    workerName: 'Worker Name',
    phoneNumber: 'Phone Number',
    assignBlock: 'Assign Block',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    liveUpdates: 'Live Updates',
    noReportsToday: 'No reports received today',
    photoProof: 'Photo Proof',
    viewPhoto: 'View Photo',
    neverCleaned: 'Never cleaned',
    hoursAgo: 'hours ago',
    justNow: 'Just now',
    blockStatus: 'Block Status',
    allBlocks: 'All Blocks',
    cleanBlocks: 'Clean',
    dirtyBlocks: 'Need Attention',
  },
  hi: {
    appName: 'HITS स्वच्छता निगरानी',
    schoolName: 'सरकारी स्कूल स्वच्छता प्रणाली',
    dashboard: 'डैशबोर्ड',
    workers: 'कर्मचारी',
    reports: 'रिपोर्ट',
    settings: 'सेटिंग्स',
    clean: 'साफ़',
    dirty: 'सफ़ाई चाहिए',
    unknown: 'अज्ञात',
    lastCleaned: 'अंतिम सफ़ाई',
    by: 'द्वारा',
    todayReports: 'आज की रिपोर्ट',
    totalReports: 'कुल रिपोर्ट',
    activeWorkers: 'सक्रिय कर्मचारी',
    addWorker: 'कर्मचारी जोड़ें',
    workerName: 'कर्मचारी का नाम',
    phoneNumber: 'फ़ोन नंबर',
    assignBlock: 'ब्लॉक सौंपें',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    liveUpdates: 'लाइव अपडेट',
    noReportsToday: 'आज कोई रिपोर्ट नहीं आई',
    photoProof: 'फ़ोटो प्रमाण',
    viewPhoto: 'फ़ोटो देखें',
    neverCleaned: 'कभी साफ़ नहीं हुआ',
    hoursAgo: 'घंटे पहले',
    justNow: 'अभी-अभी',
    blockStatus: 'ब्लॉक स्थिति',
    allBlocks: 'सभी ब्लॉक',
    cleanBlocks: 'साफ़',
    dirtyBlocks: 'ध्यान चाहिए',
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('hi'); // Default to Hindi
  const t = translations[lang];
  const toggleLang = () => setLang(l => l === 'hi' ? 'en' : 'hi');
  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
