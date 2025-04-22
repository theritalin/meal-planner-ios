import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {generateRandomId} from '../utils/helpers';
import defaultMealsData from '../data/meals';

const MealContext = createContext();

export const useMeals = () => {
  return useContext(MealContext);
};

export const MealProvider = ({children}) => {
  const [defaultMeals, setDefaultMeals] = useState([]);
  const [userMeals, setUserMeals] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mealFilter, setMealFilter] = useState('all'); // "all", "default", "personal"
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState(null);

  // Kullanıcıya özel storage anahtarları oluştur (username kullan)
  const getUserMealsKey = username => `user_meals_${username}`;
  const getMealPlanKey = username => `meal_plan_${username}`;

  // Başlangıçta verileri yükle
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedDefaultMeals = await AsyncStorage.getItem('defaultMeals');
        const storedUser = await AsyncStorage.getItem('user');

        // Varsayılan yemekleri yükle veya oluştur
        if (storedDefaultMeals) {
          setDefaultMeals(JSON.parse(storedDefaultMeals));
        } else {
          const initialDefaultMeals = importDefaultMeals();
          setDefaultMeals(initialDefaultMeals);
          await AsyncStorage.setItem(
            'defaultMeals',
            JSON.stringify(initialDefaultMeals),
          );
        }

        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);

          // Kullanıcıya özel verileri yükle (username kullan)
          const username = user.username; // username'i al
          if (username) {
            // username varsa devam et
            const storedUserMeals = await AsyncStorage.getItem(
              getUserMealsKey(username), // username ile anahtar al
            );
            const storedMealPlan = await AsyncStorage.getItem(
              getMealPlanKey(username), // username ile anahtar al
            );

            // Kullanıcı yemeklerini yükle
            if (storedUserMeals) {
              setUserMeals(JSON.parse(storedUserMeals));
            } else {
              setUserMeals([]);
            }

            // Kullanıcının yemek planını yükle
            if (storedMealPlan) {
              setMealPlan(JSON.parse(storedMealPlan));
            } else {
              setMealPlan({});
            }
          }
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // defaultMeals ve userMeals değiştiğinde meals state'ini güncelle
  useEffect(() => {
    if (mealFilter === 'all') {
      setMeals([...defaultMeals, ...userMeals]);
    } else if (mealFilter === 'default') {
      setMeals([...defaultMeals]);
    } else if (mealFilter === 'personal') {
      setMeals([...userMeals]);
    }
  }, [defaultMeals, userMeals, mealFilter]);

  // Kullanıcı değiştiğinde kullanıcıya özel verileri yükle (username kullan)
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser || !currentUser.username) return; // username kontrolü ekle

      try {
        setLoading(true);
        const username = currentUser.username;

        // Kullanıcıya özel yemek ve plan verilerini yükle (username kullan)
        const storedUserMeals = await AsyncStorage.getItem(
          getUserMealsKey(username),
        );
        const storedMealPlan = await AsyncStorage.getItem(
          getMealPlanKey(username),
        );

        if (storedUserMeals) {
          setUserMeals(JSON.parse(storedUserMeals));
        } else {
          setUserMeals([]);
        }

        if (storedMealPlan) {
          setMealPlan(JSON.parse(storedMealPlan));
        } else {
          setMealPlan({});
        }
      } catch (error) {
        console.error('Kullanıcı verileri yüklenirken hata:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]); // currentUser değişince tetiklenir

  // Kullanıcı yemeklerini kaydet (username kullan)
  const saveUserMeals = async () => {
    if (!currentUser || !currentUser.username) return;

    try {
      const username = currentUser.username;
      // Mevcut userMeals state'ini kaydet
      await AsyncStorage.setItem(
        getUserMealsKey(username),
        JSON.stringify(userMeals),
      );
    } catch (error) {
      console.error('Kullanıcı yemekleri kaydedilirken hata:', error);
      setError(error);
    }
  };

  // Yemek planını kaydet (username kullan)
  const saveMealPlan = async (newMealPlan = null) => {
    if (!currentUser || !currentUser.username) return;

    try {
      const username = currentUser.username;
      const planToSave = newMealPlan !== null ? newMealPlan : mealPlan;

      // Önce state'i güncelle (eğer yeni plan varsa)
      if (newMealPlan !== null) {
        setMealPlan(planToSave); // Önce state güncellenmeli
      }

      // Sonra kaydet
      await AsyncStorage.setItem(
        getMealPlanKey(username),
        JSON.stringify(planToSave),
      );

      // Fonksiyonun yine de güncellenmiş planı dönmesi yararlı olabilir
      return planToSave;
    } catch (error) {
      console.error('Yemek planı kaydedilirken hata:', error);
      setError(error);
    }
  };

  // Varsayılan yemekleri meals.js'den içe aktar
  const importDefaultMeals = () => {
    try {
      console.log('Default meals data:', defaultMealsData);
      return Array.isArray(defaultMealsData)
        ? defaultMealsData.map(meal => ({
            ...meal,
            id: meal.id || generateRandomId(),
            isDefault: true,
            // Preptime ve cookTime uyumluluğu için
            prepTime: meal.prepTime || meal.duration || 0,
            cookTime: meal.cookTime || meal.duration || 0,
            // Eğer varsa malzemeler ve adımlar, yoksa boş dizi
            ingredients: meal.ingredients || [],
            steps: meal.steps || meal.instructions || [],
          }))
        : [];
    } catch (error) {
      console.error('Import default meals error:', error);
      return [];
    }
  };

  // Tüm yemekleri almak için (filtrelenmiş veya filtrelenmemiş)
  const getAllMeals = (filter = mealFilter) => {
    // meals undefined ise, boş dizi döndür
    if (!meals) return [];

    // Filtre tipine göre doğrudan ilgili veri setini döndür
    if (filter === 'all') {
      return [...defaultMeals, ...userMeals];
    } else if (filter === 'default') {
      return [...defaultMeals];
    } else if (filter === 'personal') {
      return [...userMeals];
    }

    // Varsayılan olarak tüm yemekleri döndür
    return [...defaultMeals, ...userMeals];
  };

  // Yemek ekle (kullanıcı yemeği olarak) (username kullan)
  const addMeal = async newMeal => {
    if (!currentUser || !currentUser.username)
      throw new Error('User not logged in');
    try {
      const username = currentUser.username;
      const mealWithId = {
        ...newMeal,
        id: generateRandomId(),
        isDefault: false,
        ingredients: newMeal.ingredients || [],
        steps: newMeal.steps || [],
      };

      const updatedUserMeals = [...userMeals, mealWithId];
      setUserMeals(updatedUserMeals);
      // Doğrudan kaydet
      await AsyncStorage.setItem(
        getUserMealsKey(username),
        JSON.stringify(updatedUserMeals),
      );
      return mealWithId;
    } catch (error) {
      console.error('Yemek ekleme hatası:', error);
      throw error;
    }
  };

  // Yemek güncelle (username kullan)
  const updateMeal = async updatedMeal => {
    if (!currentUser || !currentUser.username)
      throw new Error('User not logged in');
    try {
      const username = currentUser.username;
      const updatedUserMeals = userMeals.map(meal =>
        meal.id === updatedMeal.id ? {...updatedMeal, isDefault: false} : meal,
      );
      setUserMeals(updatedUserMeals);
      // Doğrudan kaydet
      await AsyncStorage.setItem(
        getUserMealsKey(username),
        JSON.stringify(updatedUserMeals),
      );
      return updatedMeal;
    } catch (error) {
      console.error('Yemek güncelleme hatası:', error);
      throw error;
    }
  };

  // Yemek sil (username kullan)
  const deleteMeal = async mealId => {
    if (!currentUser || !currentUser.username)
      throw new Error('User not logged in');
    try {
      const username = currentUser.username;
      // Yemeği userMeals'dan kaldır
      const updatedUserMeals = userMeals.filter(meal => meal.id !== mealId);
      setUserMeals(updatedUserMeals);

      // Yemeği mealPlan'dan da kaldır
      const updatedMealPlan = {...mealPlan};
      Object.keys(updatedMealPlan).forEach(day => {
        Object.keys(updatedMealPlan[day]).forEach(mealTime => {
          if (updatedMealPlan[day][mealTime]?.id === mealId) {
            delete updatedMealPlan[day][mealTime];
          }
        });
      });
      setMealPlan(updatedMealPlan);

      // Her iki değişikliği de kaydet
      await Promise.all([
        AsyncStorage.setItem(
          getUserMealsKey(username),
          JSON.stringify(updatedUserMeals),
        ),
        AsyncStorage.setItem(
          getMealPlanKey(username),
          JSON.stringify(updatedMealPlan),
        ),
      ]);
    } catch (error) {
      console.error('Yemek silme hatası:', error);
      throw error;
    }
  };

  // Yemek planını güncelle
  const updateMealPlan = (day, mealTime, meal) => {
    const updatedMealPlan = {
      ...mealPlan,
      [day]: {
        ...(mealPlan[day] || {}),
        [mealTime]: meal,
      },
    };
    setMealPlan(updatedMealPlan);
    saveMealPlan(updatedMealPlan);
    return updatedMealPlan;
  };

  // Plandan yemek kaldır
  const removeMealFromPlan = (day, mealTime) => {
    const updatedMealPlan = {...mealPlan};
    if (updatedMealPlan[day]) {
      delete updatedMealPlan[day][mealTime];
      // Eğer gün boşsa, günü de sil
      if (Object.keys(updatedMealPlan[day]).length === 0) {
        delete updatedMealPlan[day];
      }
    }
    setMealPlan(updatedMealPlan);
    saveMealPlan(updatedMealPlan);
    return updatedMealPlan;
  };

  // Çıkış yap
  const logout = async () => {
    try {
      setCurrentUser(null);
      setUserMeals([]);
      setMealPlan({});
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
      throw error;
    }
  };

  return (
    <MealContext.Provider
      value={{
        defaultMeals,
        userMeals,
        mealPlan,
        currentUser,
        loading,
        error,
        mealFilter,
        setMealFilter,
        setCurrentUser,
        getAllMeals,
        addMeal,
        updateMeal,
        deleteMeal,
        updateMealPlan,
        removeMealFromPlan,
        saveMealPlan,
        logout,
      }}>
      {children}
    </MealContext.Provider>
  );
};

export default MealContext;
