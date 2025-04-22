import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations, DEFAULT_LANGUAGE } from "../utils/translations";

// Dil context'ini oluştur
const LanguageContext = createContext();

// Custom hook - useLanguage
export const useLanguage = () => useContext(LanguageContext);

// LanguageProvider component'i
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  // Kayıtlı dil ayarını yükle
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("userLanguage");
        if (savedLanguage) {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.error("Dil tercihi yüklenirken hata:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguagePreference();
  }, []);

  // Dili değiştir ve kaydet
  const changeLanguage = async (newLanguage) => {
    try {
      if (newLanguage in translations) {
        await AsyncStorage.setItem("userLanguage", newLanguage);
        setLanguage(newLanguage);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Dil değiştirilirken hata:", error);
      return false;
    }
  };

  // Metin çevirisi için yardımcı fonksiyon
  const translate = (key) => {
    // Noktalı notasyon ile nested objelere erişim (örn: 'mealType.breakfast')
    if (key.includes(".")) {
      const keys = key.split(".");
      let result = translations[language];

      for (const k of keys) {
        if (result && result[k]) {
          result = result[k];
        } else {
          return key; // Çeviri bulunamadı, anahtarı döndür
        }
      }

      return result;
    }

    return translations[language]?.[key] || key;
  };

  const value = {
    language,
    isLoading,
    translations,
    translate,
    changeLanguage,
    availableLanguages: Object.keys(translations),
  };

  return (
    <LanguageContext.Provider value={value}>
      {!isLoading && children}
    </LanguageContext.Provider>
  );
};
